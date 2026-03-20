-- Update tickets.assigned_to to reference profiles(id) instead of auth.users(id)
-- This allows PostgREST to perform joins with the profiles table.

ALTER TABLE public.tickets
DROP CONSTRAINT IF EXISTS tickets_assigned_to_fkey;

ALTER TABLE public.tickets
ADD CONSTRAINT tickets_assigned_to_fkey
FOREIGN KEY (assigned_to)
REFERENCES public.profiles(id)
ON DELETE SET NULL;

-- Also update ticket_comments.user_id for consistency
ALTER TABLE public.ticket_comments
DROP CONSTRAINT IF EXISTS ticket_comments_user_id_fkey;

ALTER TABLE public.ticket_comments
ADD CONSTRAINT ticket_comments_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE SET NULL;
