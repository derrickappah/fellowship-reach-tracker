
-- Add 'team_leader' and 'team_member' to the app_role enum
ALTER TYPE public.app_role ADD VALUE 'team_leader';
ALTER TYPE public.app_role ADD VALUE 'team_member';
