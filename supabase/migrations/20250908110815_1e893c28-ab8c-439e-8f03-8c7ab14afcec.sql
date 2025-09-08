-- Create instant score update function for single user
CREATE OR REPLACE FUNCTION public.update_user_scores_instant(target_user_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    total_session_puffs INTEGER;
    total_session_rewards NUMERIC;
    result json;
BEGIN
    -- Calculate totals from ALL sessions for this user
    SELECT 
        COALESCE(SUM(puffs_count), 0),
        COALESCE(SUM(rewards_earned), 0)
    INTO total_session_puffs, total_session_rewards
    FROM puff_sessions 
    WHERE user_id = target_user_id;
    
    -- Update profile with calculated totals
    UPDATE profiles 
    SET 
        total_puffs = total_session_puffs,
        total_rewards = total_session_rewards,
        last_score_update = NOW()
    WHERE id = target_user_id;
    
    -- Return the updated totals
    SELECT json_build_object(
        'user_id', target_user_id,
        'total_puffs', total_session_puffs,
        'total_rewards', total_session_rewards,
        'updated_at', NOW()
    ) INTO result;
    
    RETURN result;
END;
$function$;