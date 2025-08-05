-- Enable RLS on Fantasy league table
ALTER TABLE public."Fantasy league" ENABLE ROW LEVEL SECURITY;

-- Create policy for Fantasy league table (public read access)
CREATE POLICY "Anyone can view fantasy league" ON public."Fantasy league"
FOR SELECT USING (true);