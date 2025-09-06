-- Add vape_name column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN vape_name TEXT;

-- Remove the auto-creation trigger to prevent automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the handle_new_user function as we no longer want auto-creation
DROP FUNCTION IF EXISTS public.handle_new_user();