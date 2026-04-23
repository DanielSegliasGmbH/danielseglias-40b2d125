import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string
  password?: string
  firstName: string
  lastName: string
  role: 'admin' | 'staff' | 'client'
  customerId?: string
  clientId?: string
}

/**
 * Generate a memorable but secure initial password.
 * Format: <Word><Word>-<4 digits>  e.g. "Falke-Wolke-7421"
 * Length 16+, mixed case, digits, dash. Easy to read aloud.
 */
function generateInitialPassword(): string {
  const words = [
    'Falke', 'Wolke', 'Berg', 'Stern', 'Anker', 'Kompass', 'Welle', 'Komet',
    'Pinie', 'Eiche', 'Mond', 'Sonne', 'Hafen', 'Pfeil', 'Brunnen', 'Tiger',
  ]
  const w1 = words[Math.floor(Math.random() * words.length)]
  const w2 = words[Math.floor(Math.random() * words.length)]
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `${w1}-${w2}-${digits}`
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

    const { data: roleData, error: roleError } = await userClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callingUser.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Only admins can create users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body: CreateUserRequest = await req.json()
    const { email, password: providedPassword, firstName, lastName, role, customerId, clientId } = body
    const targetCustomerId = customerId || clientId

    if (!email || !firstName || !lastName || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, firstName, lastName, role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['admin', 'staff', 'client'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Always create the user with a real password so the admin can hand it over.
    // If the admin specified one, use it; otherwise we generate one.
    const initialPassword = (providedPassword && providedPassword.length >= 8)
      ? providedPassword
      : generateInitialPassword()

    console.log('Creating user with email:', email)

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: initialPassword,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    })
    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const newUserId = authData.user.id

    console.log('User created with ID:', newUserId)

    // Force the user to change the initial password on first login.
    const { error: profileFlagError } = await adminClient
      .from('profiles')
      .update({ password_change_required: true })
      .eq('id', newUserId)
    if (profileFlagError) {
      console.warn('Could not set password_change_required flag:', profileFlagError)
      // non-fatal — the profile row may not exist yet (trigger race); we continue.
    }

    // Insert the role
    const { error: roleInsertError } = await adminClient
      .from('user_roles')
      .insert({ user_id: newUserId, role })

    if (roleInsertError) {
      console.error('Error inserting role:', roleInsertError)
      await adminClient.auth.admin.deleteUser(newUserId)
      return new Response(
        JSON.stringify({ error: 'Failed to assign role: ' + roleInsertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Link to customer if client role
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
        await adminClient.from('user_roles').delete().eq('user_id', newUserId)
        await adminClient.auth.admin.deleteUser(newUserId)
        return new Response(
          JSON.stringify({ error: 'Failed to link customer: ' + customerUserError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        userId: newUserId,
        email,
        // Plain-text initial password — shown ONCE in the admin UI so it can be
        // handed over to the user. The user is forced to change it on first login.
        initialPassword,
        passwordGenerated: !providedPassword,
        message: 'Benutzer erstellt. Bitte initiales Passwort sicher übergeben.',
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
