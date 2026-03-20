import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getMyChannels,
  getMessages,
  ensureTeamChannel,
  ensureChannelMember,
  ensureAllMemberDMs,
} from "@/actions/messages";
import { getTeamMembers } from "@/actions/team";
import { MessagesLayout } from "@/components/messages/MessagesLayout";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/CRM/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_org_id, full_name")
    .eq("id", user.id)
    .single();
  if (!profile?.current_org_id) redirect("/CRM/onboarding");

  const orgId = profile.current_org_id;

  // Ensure Team channel exists, user is a member, and DMs exist for all org members
  const teamChannelId = await ensureTeamChannel(orgId);
  await Promise.all([
    ensureChannelMember(teamChannelId, user.id),
    ensureAllMemberDMs(orgId),
  ]);

  // Fetch all channels + team members in parallel
  const [channels, members] = await Promise.all([
    getMyChannels(orgId),
    getTeamMembers(orgId),
  ]);

  // Default to Team channel and load its messages
  const defaultChannel = channels.find((c) => c.id === teamChannelId) ?? channels[0] ?? null;
  const defaultMessages = defaultChannel ? await getMessages(defaultChannel.id) : [];

  return (
    <div className="flex flex-col h-full">
      <MessagesLayout
        initialChannels={channels as any[]}
        members={members as any[]}
        currentUserId={user.id}
        currentUserName={profile.full_name ?? null}
        defaultChannelId={defaultChannel?.id}
        defaultMessages={defaultMessages}
      />
    </div>
  );
}
