import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user: callingUser }, error: userError } = await userClient.auth.getUser()
    if (userError || !callingUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: roleData } = await userClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callingUser.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Only admins can manage users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { action, targetUserId } = body

    if (!action || !targetUserId) {
      return new Response(
        JSON.stringify({ error: 'action and targetUserId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prevent self-action
    if (targetUserId === callingUser.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot perform this action on yourself' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Get current profile state for audit log
    const { data: currentProfile } = await adminClient
      .from('profiles')
      .select('account_status, user_type, plan, has_strategy_access')
      .eq('id', targetUserId)
      .maybeSingle()

    if (!currentProfile) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let result: Record<string, unknown> = {}
    const auditDetails: Record<string, unknown> = {
      previous_state: { ...currentProfile },
    }

    switch (action) {
      case 'suspend': {
        // Ban user in Auth (prevents login)
        const { error: banErr } = await adminClient.auth.admin.updateUserById(targetUserId, {
          ban_duration: '876000h', // ~100 years = effectively permanent but reversible
        })
        if (banErr) throw banErr

        // Update profile status
        const { error: profileErr } = await adminClient
          .from('profiles')
          .update({ account_status: 'suspended' })
          .eq('id', targetUserId)
        if (profileErr) throw profileErr

        auditDetails.new_state = { account_status: 'suspended' }
        result = { message: 'Benutzer gesperrt' }
        break
      }

      case 'reactivate': {
        // Unban user
        const { error: unbanErr } = await adminClient.auth.admin.updateUserById(targetUserId, {
          ban_duration: 'none',
        })
        if (unbanErr) throw unbanErr

        const { error: profileErr } = await adminClient
          .from('profiles')
          .update({ account_status: 'active' })
          .eq('id', targetUserId)
        if (profileErr) throw profileErr

        auditDetails.new_state = { account_status: 'active' }
        result = { message: 'Benutzer reaktiviert' }
        break
      }

      case 'soft_delete': {
        // Ban user in Auth
        const { error: banErr } = await adminClient.auth.admin.updateUserById(targetUserId, {
          ban_duration: '876000h',
        })
        if (banErr) throw banErr

        // Mark as deleted in profile
        const { error: profileErr } = await adminClient
          .from('profiles')
          .update({ account_status: 'deleted' })
          .eq('id', targetUserId)
        if (profileErr) throw profileErr

        // Remove role
        await adminClient
          .from('user_roles')
          .delete()
          .eq('user_id', targetUserId)

        auditDetails.new_state = { account_status: 'deleted' }
        result = { message: 'Benutzer gelöscht (Soft Delete)' }
        break
      }

      case 'hard_delete': {
        // Remove all related data
        await adminClient.from('user_roles').delete().eq('user_id', targetUserId)
        await adminClient.from('customer_users').delete().eq('user_id', targetUserId)
        await adminClient.from('consent_records').delete().eq('user_id', targetUserId)
        await adminClient.from('gamification_actions').delete().eq('user_id', targetUserId)
        await adminClient.from('memories').delete().eq('user_id', targetUserId)
        await adminClient.from('profiles').delete().eq('id', targetUserId)

        // Delete auth user
        const { error: deleteErr } = await adminClient.auth.admin.deleteUser(targetUserId)
        if (deleteErr) throw deleteErr

        auditDetails.new_state = { account_status: 'permanently_deleted' }
        result = { message: 'Benutzer vollständig gelöscht' }
        break
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    // Write audit log
    await adminClient.from('admin_audit_logs').insert({
      admin_id: callingUser.id,
      target_user_id: targetUserId,
      action,
      details: auditDetails,
    })

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('admin-manage-user error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
