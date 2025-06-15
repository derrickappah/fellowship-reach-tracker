
-- This script updates the allowed achievement types in the database.
-- It first safely removes the old rule, then adds a new one with the complete list of types.

DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find the name of the constraint on the 'type' column
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'public.achievements'::regclass 
      AND pg_get_constraintdef(oid) LIKE '%type%';
    
    -- If the constraint exists, drop it
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.achievements DROP CONSTRAINT ' || quote_ident(constraint_name);
    END IF;
END;
$$;

-- Add the new, updated constraint for the 'type' column
ALTER TABLE public.achievements ADD CONSTRAINT achievements_type_check 
  CHECK (type IN (
    'invitation_milestone', 
    'team_performance', 
    'individual_performance', 
    'attendance_milestone',
    'goal_milestone',
    'leadership_milestone'
  ));
