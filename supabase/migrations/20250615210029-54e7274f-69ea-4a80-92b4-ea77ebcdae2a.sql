
-- Create indexes on email and phone columns for faster duplicate checks
CREATE INDEX IF NOT EXISTS idx_invitees_email ON public.invitees(email);
CREATE INDEX IF NOT EXISTS idx_invitees_phone ON public.invitees(phone);
