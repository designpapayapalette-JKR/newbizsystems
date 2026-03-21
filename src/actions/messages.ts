"use server";
import { createClient } from "@/lib/supabase/server";
import { getOrgId } from "./leads";
import { revalidatePath } from "next/cache";

/** Ensure the org-wide "Team" group channel exists; return its id */
export async function ensureTeamChannel(orgId: string): Promise<string> {
  const supabase = await createClient();

  // Look for existing team channel
  const { data: existing } = await supabase
    .from("message_channels")
    .select("id")
    .eq("organization_id", orgId)
    .eq("type", "group")
    .eq("name", "Team")
    .maybeSingle();

  if (existing) return existing.id;

  // Create it
  const { data: channel, error } = await supabase
    .from("message_channels")
    .insert({ organization_id: orgId, type: "group", name: "Team" })
    .select("id")
    .maybeSingle();

  if (error || !channel) throw error || new Error("Failed to create channel");
  return channel.id;
}

/** Add a user to a channel if not already a member */
export async function ensureChannelMember(channelId: string, userId: string) {
  const supabase = await createClient();
  await supabase
    .from("channel_members")
    .upsert({ channel_id: channelId, user_id: userId }, { onConflict: "channel_id,user_id", ignoreDuplicates: true });
}

/** Get or create a direct-message channel between two users in the same org */
export async function getOrCreateDMChannel(otherUserId: string): Promise<string> {
  const supabase = await createClient();
  const { orgId, userId } = await getOrgId();
  return _ensureDMChannel(supabase, orgId, userId, otherUserId);
}

/** Internal helper: find or create a DM channel between two users */
async function _ensureDMChannel(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orgId: string,
  userId: string,
  otherUserId: string
): Promise<string> {
  // Find existing DM channel shared by both users in this org
  const { data: myChannels } = await supabase
    .from("channel_members")
    .select("channel_id")
    .eq("user_id", userId);

  if (myChannels?.length) {
    const myChannelIds = myChannels.map((c) => c.channel_id);

    const { data: shared } = await supabase
      .from("channel_members")
      .select("channel_id")
      .eq("user_id", otherUserId)
      .in("channel_id", myChannelIds);

    if (shared?.length) {
      for (const { channel_id } of shared) {
        const { data: ch } = await supabase
          .from("message_channels")
          .select("id, type")
          .eq("id", channel_id)
          .eq("organization_id", orgId)
          .eq("type", "direct")
          .maybeSingle();
        if (ch) return ch.id;
      }
    }
  }

  // Create new DM channel
  const { data: channel, error } = await supabase
    .from("message_channels")
    .insert({ organization_id: orgId, type: "direct" })
    .select("id")
    .maybeSingle();

  if (error || !channel) throw error || new Error("Failed to create direct channel");

  await supabase.from("channel_members").insert([
    { channel_id: channel.id, user_id: userId },
    { channel_id: channel.id, user_id: otherUserId },
  ]);

  return channel.id;
}

/**
 * Ensure the current user has a DM channel with every other member of the org.
 * Called on messages page load so all teammates appear in the list by default.
 */
export async function ensureAllMemberDMs(orgId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Get all other members of this org
  const { data: members } = await supabase
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", orgId)
    .neq("user_id", user.id);

  if (!members?.length) return;

  // Create DM channels sequentially (small teams — typically < 20 members)
  for (const { user_id } of members) {
    await _ensureDMChannel(supabase, orgId, user.id, user_id);
  }
}

/** Send a message to a channel */
export async function sendMessage(
  channelId: string,
  content: string,
  fileData?: { fileUrl: string; fileName: string; fileType: string; fileSize: number }
) {
  const supabase = await createClient();
  const { userId } = await getOrgId();

  const insertData: any = { channel_id: channelId, sender_id: userId };
  if (content.trim()) {
    insertData.content = content.trim();
  }
  if (fileData) {
    insertData.file_url = fileData.fileUrl;
    insertData.file_name = fileData.fileName;
    insertData.file_type = fileData.fileType;
    insertData.file_size = fileData.fileSize;
  }

  const { error } = await supabase
    .from("messages")
    .insert(insertData);

  if (error) throw error;
}

/** Fetch the last N messages for a channel */
export async function getMessages(channelId: string, limit = 60) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .select("id, content, created_at, sender_id, file_url, file_name, file_type, file_size")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  const messages = (data ?? []).reverse();
  if (!messages.length) return [];

  // Fetch sender profiles
  const senderIds = [...new Set(messages.map((m) => m.sender_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", senderIds);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
  return messages.map((m) => ({ ...m, sender: profileMap[m.sender_id] ?? null }));
}

/** Get all channels for the current user in their org */
export async function getMyChannels(orgId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get channel IDs this user belongs to
  const { data: memberships } = await supabase
    .from("channel_members")
    .select("channel_id, last_read_at")
    .eq("user_id", user.id);

  if (!memberships?.length) return [];

  const channelIds = memberships.map((m) => m.channel_id);

  const { data: channels } = await supabase
    .from("message_channels")
    .select("id, type, name, created_at")
    .eq("organization_id", orgId)
    .in("id", channelIds)
    .order("created_at");

  if (!channels?.length) return [];

  // For DM channels, get the other member's profile
  const dmChannelIds = channels.filter((c) => c.type === "direct").map((c) => c.id);
  let dmOtherProfiles: Record<string, any> = {};

  if (dmChannelIds.length) {
    const { data: dmMembers } = await supabase
      .from("channel_members")
      .select("channel_id, user_id")
      .in("channel_id", dmChannelIds)
      .neq("user_id", user.id);

    if (dmMembers?.length) {
      const otherUserIds = dmMembers.map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", otherUserIds);

      const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
      dmOtherProfiles = Object.fromEntries(
        dmMembers.map((m) => [m.channel_id, profileMap[m.user_id] ?? null])
      );
    }
  }

  // Get last message per channel
  const lastMsgMap: Record<string, any> = {};
  for (const channelId of channelIds) {
    const { data: last } = await supabase
      .from("messages")
      .select("content, created_at, sender_id")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (last) lastMsgMap[channelId] = last;
  }

  const lastReadMap = Object.fromEntries(memberships.map((m) => [m.channel_id, m.last_read_at]));

  return channels.map((ch) => ({
    ...ch,
    otherProfile: dmOtherProfiles[ch.id] ?? null,
    lastMessage: lastMsgMap[ch.id] ?? null,
    lastReadAt: lastReadMap[ch.id] ?? null,
  }));
}

/** Mark all messages in a channel as read */
export async function markChannelRead(channelId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("channel_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("channel_id", channelId)
    .eq("user_id", user.id);
}
