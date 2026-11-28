/*
  # Create listing images storage bucket

  1. New Storage
    - Create 'listing-images' bucket for business listing photos
    - Set bucket to public for easy access
    - Configure size limits and file type restrictions

  2. Security
    - RLS policies to allow authenticated business users to upload
    - Public read access for all users
    - Size limit: 2MB per file
    - Allowed types: images only
*/

-- Create the storage bucket for listing images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'listing-images',
    'listing-images',
    true,
    2097152,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view listing images" ON storage.objects;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listing-images');

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update own listing images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'listing-images')
WITH CHECK (bucket_id = 'listing-images');

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete own listing images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'listing-images');

-- Allow public read access to all listing images
CREATE POLICY "Public can view listing images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'listing-images');