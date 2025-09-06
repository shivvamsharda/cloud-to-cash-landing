-- Add profile picture column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Add unique constraint for username (ignore if already exists)
DO $$ 
BEGIN
    ALTER TABLE public.profiles ADD CONSTRAINT unique_username UNIQUE (username);
EXCEPTION 
    WHEN duplicate_object THEN 
        NULL;
END $$;

-- Make username NOT NULL (it should be mandatory)
ALTER TABLE public.profiles ALTER COLUMN username DROP DEFAULT;
UPDATE public.profiles SET username = COALESCE(username, 'user_' || SUBSTRING(id::text, 1, 8)) WHERE username IS NULL;
ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;

-- Create profile pictures storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for profile pictures
CREATE POLICY "Users can view all profile pictures" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload their own profile pictures" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-pictures' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile pictures" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile-pictures' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile pictures" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile-pictures' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);