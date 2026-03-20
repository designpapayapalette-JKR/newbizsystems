"use client";

import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// ── Audio ─────────────────────────────────────────────────────────────────────
function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    function tone(freq: number, startAt: number, duration: number, gain = 0.35) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, ctx.currentTime + startAt);
      g.gain.linearRampToValueAtTime(gain, ctx.currentTime + startAt + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + duration);
      osc.start(ctx.currentTime + startAt);
      osc.stop(ctx.currentTime + startAt + duration);
    }

    tone(880, 0, 0.4);
    tone(1100, 0.18, 0.4);
    tone(1320, 0.36, 0.55);
  } catch {
    // AudioContext not available — silent fallback
  }
}

// ── VAPID helper ───────────────────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from(Array.from(rawData).map((c) => c.charCodeAt(0)));
}

// ── Push subscription registration ────────────────────────────────────────────
async function registerPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) return;

  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const existing = await reg.pushManager.getSubscription();
    if (existing) return; // already subscribed

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
    });

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const subJson = sub.toJSON();
    await supabase.from("push_subscriptions").upsert({
      user_id: user.id,
      endpoint: sub.endpoint,
      p256dh: (subJson.keys as any)?.p256dh,
      auth: (subJson.keys as any)?.auth,
    }, { onConflict: "user_id,endpoint" });
  } catch {
    // Silent — user can enable manually in Settings → Notifications
  }
}

// ── Permission prompt ──────────────────────────────────────────────────────────
async function requestPermissionAndRegister() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    await registerPush();
    return;
  }
  if (Notification.permission === "denied") return;

  // Show a friendly toast first, then ask for permission
  toast("Enable notifications for reminders?", {
    duration: 10000,
    action: {
      label: "Enable",
      onClick: async () => {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          await registerPush();
          toast.success("Notifications enabled! You'll get alerted when reminders are due.");
        } else {
          toast.error("Notification permission denied. You can enable it in Settings → Notifications.");
        }
      },
    },
    cancel: {
      label: "Not now",
      onClick: () => {},
    },
  });
}

// ── In-tab reminder poller ─────────────────────────────────────────────────────
const POLL_INTERVAL = 60_000; // 1 minute
const ALERTED_KEY = "crm_alerted_reminders"; // localStorage key

function getAlerted(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(ALERTED_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

function markAlerted(id: string) {
  const set = getAlerted();
  set.add(id);
  // Keep only last 100 to avoid unbounded growth
  const arr = Array.from(set).slice(-100);
  localStorage.setItem(ALERTED_KEY, JSON.stringify(arr));
}

// ── Main component ─────────────────────────────────────────────────────────────
export function NotificationProvider() {
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasPrompted = useRef(false);

  const pollReminders = useCallback(async () => {
    try {
      const res = await fetch("/api/reminders/due");
      if (!res.ok) return;
      const { reminders } = await res.json() as { reminders: Array<{ id: string; title: string; description?: string; lead_id?: string }> };
      if (!reminders?.length) return;

      const alerted = getAlerted();

      for (const reminder of reminders) {
        if (alerted.has(reminder.id)) continue;

        markAlerted(reminder.id);
        playChime();

        const url = reminder.lead_id ? `/ERP/leads/${reminder.lead_id}` : "/ERP/reminders";

        // In-app toast notification
        toast(reminder.title, {
          description: reminder.description || "Reminder is due now",
          duration: 15000,
          action: {
            label: "View",
            onClick: () => { window.location.href = url; },
          },
        });

        // Native browser notification (if tab is in background)
        if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
          new Notification(reminder.title, {
            body: reminder.description || "Reminder is due",
            icon: "/icon-192.png",
            tag: reminder.id,
          });
        }
      }
    } catch {
      // Silent — network error or not authenticated
    }
  }, []);

  useEffect(() => {
    // Prompt for permission after a short delay (let the page settle first)
    const promptTimer = setTimeout(() => {
      if (!hasPrompted.current) {
        hasPrompted.current = true;
        requestPermissionAndRegister();
      }
    }, 3000);

    // Listen for PLAY_CHIME messages from the service worker (push received while tab open)
    function onSwMessage(event: MessageEvent) {
      if (event.data?.type === "PLAY_CHIME") {
        playChime();
        const { title, body, url } = event.data;
        toast(title || "Reminder", {
          description: body || "Reminder is due now",
          duration: 15000,
          action: url ? { label: "View", onClick: () => { window.location.href = url; } } : undefined,
        });
      }
    }
    navigator.serviceWorker?.addEventListener("message", onSwMessage);

    // Start polling
    pollReminders();
    pollerRef.current = setInterval(pollReminders, POLL_INTERVAL);

    return () => {
      clearTimeout(promptTimer);
      if (pollerRef.current) clearInterval(pollerRef.current);
      navigator.serviceWorker?.removeEventListener("message", onSwMessage);
    };
  }, [pollReminders]);

  return null;
}
