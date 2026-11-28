CREATE POLICY "Admins can view all blog posts"
ON blog_posts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (SELECT auth.uid())
      AND profiles.user_type = 'admin'
  )
);
