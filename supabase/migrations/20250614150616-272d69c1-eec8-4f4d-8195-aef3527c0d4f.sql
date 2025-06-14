
-- Set a default value for invited_by to the current user's ID
ALTER TABLE public.invitees
ALTER COLUMN invited_by SET DEFAULT auth.uid();

-- Enable Row Level Security on the invitees table
ALTER TABLE public.invitees ENABLE ROW LEVEL SECURITY;

-- Create policies to control who can see, create, update, and delete invitees

-- Policy for viewing invitees
CREATE POLICY "Users can view invitees based on their role"
ON public.invitees FOR SELECT
USING (
  (public.has_role(auth.uid(), 'admin')) OR
  (public.has_role(auth.uid(), 'fellowship_leader') AND team_id IN (
    SELECT id FROM public.teams WHERE fellowship_id = (SELECT fellowship_id FROM public.profiles WHERE id = auth.uid())
  )) OR
  (public.has_role(auth.uid(), 'member') AND invited_by = auth.uid())
);

-- Policy for creating invitees
CREATE POLICY "Authenticated users can create invitees"
ON public.invitees FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
);

-- Policy for updating invitees
CREATE POLICY "Users can update invitees based on their role"
ON public.invitees FOR UPDATE
USING (
  (public.has_role(auth.uid(), 'admin')) OR
  (public.has_role(auth.uid(), 'fellowship_leader') AND team_id IN (
    SELECT id FROM public.teams WHERE fellowship_id = (SELECT fellowship_id FROM public.profiles WHERE id = auth.uid())
  )) OR
  (public.has_role(auth.uid(), 'member') AND invited_by = auth.uid())
)
WITH CHECK (
  (public.has_role(auth.uid(), 'admin')) OR
  (public.has_role(auth.uid(), 'fellowship_leader')) OR
  (public.has_role(auth.uid(), 'member') AND invited_by = auth.uid())
);

-- Policy for deleting invitees
CREATE POLICY "Users can delete invitees based on their role"
ON public.invitees FOR DELETE
USING (
  (public.has_role(auth.uid(), 'admin')) OR
  (public.has_role(auth.uid(), 'fellowship_leader') AND team_id IN (
    SELECT id FROM public.teams WHERE fellowship_id = (SELECT fellowship_id FROM public.profiles WHERE id = auth.uid())
  )) OR
  (public.has_role(auth.uid(), 'member') AND invited_by = auth.uid())
);
