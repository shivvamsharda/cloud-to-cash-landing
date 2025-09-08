-- Update leaderboard function to aggregate real-time data from puff_sessions
CREATE OR REPLACE FUNCTION public.get_public_leaderboard(limit_count integer DEFAULT 10)
RETURNS TABLE(id uuid, username text, total_puffs integer, total_rewards numeric, wallet_address text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.username,
    COALESCE(SUM(ps.puffs_count)::integer, 0) as total_puffs,
    COALESCE(SUM(ps.rewards_earned), 0) as total_rewards,
    p.wallet_address
  FROM public.profiles p
  LEFT JOIN public.puff_sessions ps ON p.id = ps.user_id
  GROUP BY p.id, p.username, p.wallet_address, p.created_at
  ORDER BY
    COALESCE(SUM(ps.puffs_count), 0) DESC,
    COALESCE(SUM(ps.rewards_earned), 0) DESC,
    p.created_at ASC
  LIMIT limit_count;
$$;