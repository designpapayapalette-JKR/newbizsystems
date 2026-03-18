-- Message channels (group = team-wide, direct = 1-on-1)
CREATE TABLE IF NOT EXISTS message_channels (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type            text NOT NULL DEFAULT 'group',   -- 'group' | 'direct'
  name            text,                             -- only used for group channels
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Members of each channel
CREATE TABLE IF NOT EXISTS channel_members (
  channel_id  uuid NOT NULL REFERENCES message_channels(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES message_channels(id) ON DELETE CASCADE,
  sender_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    text NOT NULL CHECK (char_length(content) > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS messages_channel_id_created_at ON messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS channel_members_user_id ON channel_members(user_id);

-- Enable Realtime on messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE channel_members;

-- RLS
ALTER TABLE message_channels  ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages          ENABLE ROW LEVEL SECURITY;

-- message_channels: visible to org members
CREATE POLICY "Org members can view channels"
  ON message_channels FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Org members can create channels"
  ON message_channels FOR INSERT
  WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

-- channel_members
CREATE POLICY "Channel members can view membership"
  ON channel_members FOR SELECT
  USING (channel_id IN (
    SELECT channel_id FROM channel_members cm WHERE cm.user_id = auth.uid()
  ));

CREATE POLICY "Org members can join channels"
  ON channel_members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Members can update own last_read"
  ON channel_members FOR UPDATE
  USING (user_id = auth.uid());

-- messages: visible to channel members
CREATE POLICY "Channel members can view messages"
  ON messages FOR SELECT
  USING (channel_id IN (
    SELECT channel_id FROM channel_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Channel members can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    channel_id IN (SELECT channel_id FROM channel_members WHERE user_id = auth.uid())
  );
