-- Update profiles table to add required fields for user profile creation
-- Add name field (required for full name)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Add twitter_username field (required)  
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS twitter_username TEXT;

-- Make existing usernames unique by appending a sequence number
UPDATE public.profiles 
SET username = CASE 
  WHEN username = 'Anonymous Vaper' OR username IS NULL THEN 
    'user_' || SUBSTRING(id::text, 1, 8)
  ELSE username
END;

-- Create a temporary sequence to handle any remaining duplicates
DO $$
DECLARE
    rec RECORD;
    counter INTEGER;
BEGIN
    -- Handle any remaining duplicate usernames
    FOR rec IN 
        SELECT username, array_agg(id) as ids
        FROM public.profiles 
        GROUP BY username 
        HAVING count(*) > 1
    LOOP
        counter := 1;
        -- Update all but the first occurrence
        FOR i IN 2..array_length(rec.ids, 1) LOOP
            UPDATE public.profiles 
            SET username = rec.username || '_' || counter
            WHERE id = rec.ids[i];
            counter := counter + 1;
        END LOOP;
    END LOOP;
END $$;

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