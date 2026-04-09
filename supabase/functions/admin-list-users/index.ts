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
        JSON.stringify({ error: 'Only admins can list users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch all auth users (paginated, up to 1000)
    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers({
      perPage: 1000,
    })

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch profiles, roles, customer_users
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('*')
      .order('last_name', { ascending: true })

    const { data: roles } = await adminClient
      .from('user_roles')
      .select('user_id, role')

    const { data: customerUsers } = await adminClient
      .from('customer_users')
      .select('user_id, customer_id')

    // Combine data
    const users = (profiles || []).map((profile) => {
      const authUser = authUsers.users.find((au) => au.id === profile.id)
      const userRole = roles?.find((r) => r.user_id === profile.id)
      const customerUser = customerUsers?.find((cu) => cu.user_id === profile.id)

      return {
        id: profile.id,
        email: authUser?.email || '',
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        role: userRole?.role || null,
        customer_id: customerUser?.customer_id || null,
        user_type: profile.user_type || 'user',
        plan: profile.plan || 'free',
        has_strategy_access: profile.has_strategy_access || false,
        account_status: profile.account_status || 'active',
        created_at: authUser?.created_at || profile.created_at,
        last_sign_in_at: authUser?.last_sign_in_at || null,
        email_confirmed_at: authUser?.email_confirmed_at || null,
        invited_at: authUser?.invited_at || null,
        confirmed_at: authUser?.confirmed_at || null,
        is_confirmed: !!authUser?.email_confirmed_at,
        is_banned: !!authUser?.banned_until,
      }
    })

    return new Response(
      JSON.stringify({ users }),
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
