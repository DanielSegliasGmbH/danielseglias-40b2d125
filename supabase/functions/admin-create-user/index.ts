import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'admin' | 'staff' | 'client'
  customerId?: string
  clientId?: string // Backward compatibility alias for customerId
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header to verify the caller is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a client with the user's token to verify they're an admin
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Get the calling user
    const { data: { user: callingUser }, error: userError } = await userClient.auth.getUser()
    if (userError || !callingUser) {
      console.error('Failed to get calling user:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if the calling user is an admin
    const { data: roleData, error: roleError } = await userClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callingUser.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (roleError || !roleData) {
      console.error('Caller is not an admin:', roleError)
      return new Response(
        JSON.stringify({ error: 'Only admins can create users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the request body
    const body: CreateUserRequest = await req.json()
    const { email, password, firstName, lastName, role, customerId, clientId } = body

    // Use customerId, fallback to clientId for backward compatibility
    const targetCustomerId = customerId || clientId

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      console.error('Missing required fields')
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, firstName, lastName, role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate role
    if (!['admin', 'staff', 'client'].includes(role)) {
      console.error('Invalid role:', role)
      return new Response(
        JSON.stringify({ error: 'Invalid role. Must be admin, staff, or client' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If role is client, customerId is required
    if (role === 'client' && !targetCustomerId) {
      console.error('customerId required for client role')
      return new Response(
        JSON.stringify({ error: 'customerId is required when role is client' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use service role client to create the user
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Creating user with email:', email)

    // Create the user in auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const newUserId = authData.user.id
    console.log('User created with ID:', newUserId)

    // Insert the role
    const { error: roleInsertError } = await adminClient
      .from('user_roles')
      .insert({
        user_id: newUserId,
        role: role,
      })

    if (roleInsertError) {
      console.error('Error inserting role:', roleInsertError)
      // Try to clean up the user if role insert fails
      await adminClient.auth.admin.deleteUser(newUserId)
      return new Response(
        JSON.stringify({ error: 'Failed to assign role: ' + roleInsertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Role assigned:', role)

    // If role is client, link to customer_users (Phase 2: using customer_users instead of client_users)
    if (role === 'client' && targetCustomerId) {
      const { error: customerUserError } = await adminClient
        .from('customer_users')
        .insert({
          user_id: newUserId,
          customer_id: targetCustomerId,
          created_by: callingUser.id,
        })

      if (customerUserError) {
        console.error('Error linking customer:', customerUserError)
        // Clean up
        await adminClient.from('user_roles').delete().eq('user_id', newUserId)
        await adminClient.auth.admin.deleteUser(newUserId)
        return new Response(
          JSON.stringify({ error: 'Failed to link customer: ' + customerUserError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      console.log('Customer linked:', targetCustomerId)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: newUserId,
        message: 'User created successfully' 
      }),
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
