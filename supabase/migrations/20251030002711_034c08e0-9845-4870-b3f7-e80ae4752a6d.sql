-- Add policies for regular users to view players (needed to build teams)
CREATE POLICY "Authenticated users can view players" 
ON public.players 
FOR SELECT 
TO authenticated
USING (true);

-- Add policies for regular users to view PSL standings
CREATE POLICY "Authenticated users can view psl_standings" 
ON public.psl_standings 
FOR SELECT 
TO authenticated
USING (true);

-- Add policies for public viewing of players (for landing page/public views)
CREATE POLICY "Anyone can view players" 
ON public.players 
FOR SELECT 
TO anon
USING (true);