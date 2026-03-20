-- 1. Add file columns to messages table
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_content_check;
ALTER TABLE public.messages ALTER COLUMN content DROP NOT NULL;

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Ensure either content or file_url is present
ALTER TABLE public.messages ADD CONSTRAINT messages_content_or_file_check CHECK (
  (content IS NOT NULL AND char_length(content) > 0) OR (file_url IS NOT NULL)
);

-- 2. Create Storage Bucket for Message Attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('message_attachments', 'message_attachments', false) 
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies
CREATE POLICY "Authenticated users can upload message attachments"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'message_attachments' AND auth.uid() = owner
);

CREATE POLICY "Authenticated users can view message attachments"
ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'message_attachments'
);

CREATE POLICY "Users can update their own message attachments"
ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'message_attachments' AND auth.uid() = owner
);

CREATE POLICY "Users can delete their own message attachments"
ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'message_attachments' AND auth.uid() = owner
);
