
-- Public leaderboard RPC that bypasses RLS safely and returns only needed fields
create or replace function public.get_public_leaderboard(limit_count integer default 10)
returns table (
  id uuid,
  username text,
  total_puffs integer,
  total_rewards numeric,
  wallet_address text
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.username,
    coalesce(p.total_puffs, 0) as total_puffs,
    coalesce(p.total_rewards, 0) as total_rewards,
    p.wallet_address
  from public.profiles p
  order by
    p.total_puffs desc nulls last,
    p.total_rewards desc nulls last,
    p.created_at asc nulls last
  limit limit_count;
$$;

-- Ensure anon and authenticated can call it via PostgREST
grant execute on function public.get_public_leaderboard(integer) to anon, authenticated;

-- Helpful index for ordering performance
create index if not exists idx_profiles_total_puffs on public.profiles (total_puffs);
