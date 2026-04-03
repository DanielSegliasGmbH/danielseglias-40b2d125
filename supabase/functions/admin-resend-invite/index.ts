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
        JSON.stringify({ error: 'Only admins can resend invites' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { userId } = await req.json()
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Get the user's email
    const { data: { user: targetUser }, error: getUserError } = await adminClient.auth.admin.getUserById(userId)
    if (getUserError || !targetUser) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!targetUser.email) {
      return new Response(
        JSON.stringify({ error: 'User has no email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For unconfirmed users: re-invite (this sends an actual email)
    if (!targetUser.email_confirmed_at) {
      // First delete the user, then re-invite to trigger a fresh invitation email
      // inviteUserByEmail fails if user already exists, so we use a workaround:
      // Delete the auth user (keep profile/role via cascade), then re-create via invite
      
      // Actually, the cleanest approach: use admin.generateLink to get the action link,
      // then we don't need to send email ourselves — Supabase sends it.
      // BUT generateLink does NOT send email. So we need another approach.
      
      // The correct approach for re-inviting: delete and re-create the user
      // This is safe because the profiles trigger will handle the profile,
      // and we preserve the role.
      
      // Save user metadata and role before deletion
      const userMetadata = targetUser.user_metadata
      const email = targetUser.email
      
      // Get existing role
      const { data: existingRole } = await adminClient
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle()
      
      // Get existing customer link
      const { data: existingCustomerUser } = await adminClient
        .from('customer_users')
        .select('customer_id, created_by')
        .eq('user_id', userId)
        .maybeSingle()

      // Delete old user (cascades profile, role, customer_users)
      await adminClient.auth.admin.deleteUser(userId)
      
      // Re-invite with fresh invitation email
      const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
        data: userMetadata,
      })
      
      if (inviteError) {
        return new Response(
          JSON.stringify({ error: `Einladung fehlgeschlagen: ${inviteError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const newUserId = inviteData.user.id

      // Restore role
      if (existingRole) {
        await adminClient.from('user_roles').insert({ user_id: newUserId, role: existingRole.role })
      }

      // Restore customer link
      if (existingCustomerUser) {
        await adminClient.from('customer_users').insert({
          user_id: newUserId,
          customer_id: existingCustomerUser.customer_id,
          created_by: existingCustomerUser.created_by,
        })
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Einladung erneut versendet', newUserId }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For confirmed/active users: send password reset email
    // resetPasswordForEmail actually sends the email (unlike generateLink)
    const { error: resetError } = await adminClient.auth.resetPasswordForEmail(targetUser.email, {
      redirectTo: `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/reset-password`,
    })

    if (resetError) {
      return new Response(
        JSON.stringify({ error: resetError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Passwort-Reset-Link wurde per E-Mail gesendet' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
