-- Create policy to allow users to rename teams after 36 weeks
CREATE POLICY "Users can rename teams after 36 weeks"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = user_id
  AND (now() - created_at) >= interval '36 weeks'
);