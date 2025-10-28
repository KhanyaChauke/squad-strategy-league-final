-- Add unique constraint to team_name in profiles table
ALTER TABLE public.profiles ADD CONSTRAINT profiles_team_name_unique UNIQUE (team_name);

-- Create index for faster lookups
CREATE INDEX idx_profiles_team_name ON public.profiles(team_name) WHERE team_name IS NOT NULL;