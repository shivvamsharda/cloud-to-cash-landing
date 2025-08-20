-- Update profiles table to add required fields for user profile creation
-- Add name field (required for full name)
ALTER TABLE public.profiles 
ADD COLUMN name TEXT;

-- Add twitter_username field (required)  
ALTER TABLE public.profiles
ADD COLUMN twitter_username TEXT;

-- Make username column NOT NULL (required)
-- First update existing null usernames to a default value
UPDATE public.profiles 
SET username = 'user_' || SUBSTRING(id::text, 1, 8)
WHERE username IS NULL;

-- Now make username NOT NULL
ALTER TABLE public.profiles 
ALTER COLUMN username SET NOT NULL;

-- Add unique constraint on username
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Add check constraint for username format (only allow letters, numbers, underscore, dot, dash)
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_username_format 
CHECK (username ~ '^[a-zA-Z0-9._-]+$' AND LENGTH(username) >= 3 AND LENGTH(username) <= 20);

-- Add check constraint for twitter username format (without @ symbol, allow letters, numbers, underscore)
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_twitter_username_format 
CHECK (twitter_username ~ '^[a-zA-Z0-9_]+$' AND LENGTH(twitter_username) >= 1 AND LENGTH(twitter_username) <= 15);

-- Update the handle_new_user function to not automatically create incomplete profiles
-- The user will create their profile through the modal instead
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Remove the trigger since we'll handle profile creation through the UI
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;