/*
  # Add Useful Links to Blog Posts

  ## Changes
  Add a useful_links field to blog_posts table to store relevant links for each guide.
  
  ## Structure
  - `useful_links` (jsonb) - Array of objects with {text, url} for each link
  
  ## Example Data
  [
    {"text": "Chamber of Commerce", "url": "http://www.thechamberofcommerce.tz"},
    {"text": "Zanzibar Tourism Board", "url": "http://www.zanzibartourism.go.tz"}
  ]
*/

-- Add useful_links column to blog_posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'useful_links'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN useful_links jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;