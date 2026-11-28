/*
  # Add content images field to blog posts

  1. New Columns
    - `content_images` (jsonb) - Array of objects containing images with optional links to be inserted throughout the content
      Format: [{ image_url: string, link_url?: string }]

  2. Purpose
    - Allow admins to add images with optional links that appear every 2-4 paragraphs in blog content
    - Images break up long text content for better readability
    - Links are optional - images without links are not clickable
*/

-- Add content_images column to blog_posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'content_images'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN content_images jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;