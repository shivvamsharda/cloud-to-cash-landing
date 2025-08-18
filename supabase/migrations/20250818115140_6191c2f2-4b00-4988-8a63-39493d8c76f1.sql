-- Add last_score_update column to profiles table for 3-minute scoring system
ALTER TABLE public.profiles 
ADD COLUMN last_score_update TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for performance when querying profiles that need score updates
CREATE INDEX idx_profiles_last_score_update ON public.profiles(last_score_update);

-- Create a function to calculate and update user scores every 3 minutes
CREATE OR REPLACE FUNCTION public.calculate_user_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_record RECORD;
    total_session_puffs INTEGER;
    total_session_rewards NUMERIC;
BEGIN
    -- Process users whose scores need updating (last update > 3 minutes ago)
    FOR user_record IN 
        SELECT id, total_puffs, total_rewards, last_score_update
        FROM profiles 
        WHERE last_score_update < NOW() - INTERVAL '3 minutes'
    LOOP
        -- Calculate totals from all sessions since last score update
        SELECT 
            COALESCE(SUM(puffs_count), 0),
            COALESCE(SUM(puffs_count * 0.1), 0)
        INTO total_session_puffs, total_session_rewards
        FROM puff_sessions 
        WHERE user_id = user_record.id 
        AND created_at > user_record.last_score_update;
        
        -- Update profile with new totals if there are new puffs
        IF total_session_puffs > 0 THEN
            UPDATE profiles 
            SET 
                total_puffs = COALESCE(total_puffs, 0) + total_session_puffs,
                total_rewards = COALESCE(total_rewards, 0) + total_session_rewards,
                last_score_update = NOW()
            WHERE id = user_record.id;
            
            -- Log the score update
            RAISE NOTICE 'Updated scores for user %: +% puffs, +% tokens', 
                user_record.id, total_session_puffs, total_session_rewards;
        END IF;
    END LOOP;
END;
$$;