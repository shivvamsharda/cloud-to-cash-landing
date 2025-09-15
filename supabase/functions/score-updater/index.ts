import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          total_puffs: number
          total_rewards: number
          last_score_update: string
        }
      }
      puff_sessions: {
        Row: {
          id: string
          user_id: string
          puffs_count: number
          created_at: string
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔄 Starting 3-minute score update process...')

    // Get profiles that need score updates (last update > 3 minutes ago)
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString()
    
    const { data: profilesToUpdate, error: profilesError } = await supabase
      .from('profiles')
      .select('id, total_puffs, total_rewards, last_score_update')
      .lt('last_score_update', threeMinutesAgo)

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      throw profilesError
    }

    console.log(`📊 Found ${profilesToUpdate?.length || 0} profiles to update`)

    let updatedUsers = 0

    // Process each profile
    for (const profile of profilesToUpdate || []) {
      console.log(`🔍 Processing user ${profile.id}...`)

      // Get all puff sessions since last score update
      const { data: sessions, error: sessionsError } = await supabase
        .from('puff_sessions')
        .select('puffs_count')
        .eq('user_id', profile.id)
        .gt('created_at', profile.last_score_update)

      if (sessionsError) {
        console.error(`❌ Error fetching sessions for user ${profile.id}:`, sessionsError)
        continue
      }

      // Calculate new puffs and rewards since last update
      const newPuffs = sessions?.reduce((total, session) => total + (session.puffs_count || 0), 0) || 0
      const newRewards = newPuffs * 0.1 // 0.1 token per puff

      // Only update if there are new puffs
      if (newPuffs > 0) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            total_puffs: (profile.total_puffs || 0) + newPuffs,
            total_rewards: (profile.total_rewards || 0) + newRewards,
            last_score_update: new Date().toISOString()
          })
          .eq('id', profile.id)

        if (updateError) {
          console.error(`❌ Error updating profile for user ${profile.id}:`, updateError)
        } else {
          updatedUsers++
          console.log(`✅ Updated user ${profile.id}: +${newPuffs} puffs, +${newRewards.toFixed(1)} $VAPE tokens`)
        }
      } else {
        // Update timestamp even if no new puffs
        await supabase
          .from('profiles')
          .update({
            last_score_update: new Date().toISOString()
          })
          .eq('id', profile.id)
      }
    }

    const responseMessage = `✅ Score update complete. Updated ${updatedUsers} users out of ${profilesToUpdate?.length || 0} checked.`
    console.log(responseMessage)

    return new Response(JSON.stringify({
      success: true,
      message: responseMessage,
      updatedUsers,
      totalChecked: profilesToUpdate?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('❌ Score updater error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})