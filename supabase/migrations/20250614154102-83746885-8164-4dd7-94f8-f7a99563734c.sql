
CREATE OR REPLACE FUNCTION public.update_user_profile_and_team(
  p_user_id uuid,
  p_name text,
  p_phone text,
  p_cell_id uuid,
  p_team_id uuid
) RETURNS void AS $$
BEGIN
  -- Update profile
  UPDATE public.profiles
  SET
    name = p_name,
    phone = p_phone,
    cell_id = p_cell_id
  WHERE id = p_user_id;

  -- Update team membership by replacing existing entry
  DELETE FROM public.team_members WHERE user_id = p_user_id;

  IF p_team_id IS NOT NULL THEN
    INSERT INTO public.team_members (user_id, team_id)
    VALUES (p_user_id, p_team_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
