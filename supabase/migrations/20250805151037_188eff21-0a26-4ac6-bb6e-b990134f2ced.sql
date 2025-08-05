-- Enable Row Level Security on all tables
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gameweeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fantasy_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_chips ENABLE ROW LEVEL SECURITY;

-- Players table policies (public read access)
CREATE POLICY "Anyone can view players" ON public.players
FOR SELECT USING (true);

-- Users table policies (users can only see/edit their own data)
CREATE POLICY "Users can view own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id);

-- Gameweeks table policies (public read access)
CREATE POLICY "Anyone can view gameweeks" ON public.gameweeks
FOR SELECT USING (true);

-- Player stats table policies (public read access)
CREATE POLICY "Anyone can view player stats" ON public.player_stats
FOR SELECT USING (true);

-- Fantasy points table policies (users can only see their own points)
CREATE POLICY "Users can view related fantasy points" ON public.fantasy_points
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.player_stats ps
    JOIN public.user_teams ut ON ps.player_id = ut.player_id
    WHERE ps.id = player_stat_id AND ut.user_id = auth.uid()
  )
);

-- User chips table policies (users can only see/manage their own chips)
CREATE POLICY "Users can view own chips" ON public.user_chips
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chips" ON public.user_chips
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chips" ON public.user_chips
FOR UPDATE USING (auth.uid() = user_id);

-- Add missing columns to users table for fantasy app data
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS budget NUMERIC DEFAULT 1000000000;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS formation TEXT DEFAULT '4-4-2';