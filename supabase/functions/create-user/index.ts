import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create admin client using SERVICE_ROLE_KEY (SECURE - stays on server)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify requesting user is admin
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    
    if (!user) {
      return new Response('Invalid token', { status: 401, headers: corsHeaders })
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response('Admin access required', { status: 403, headers: corsHeaders })
    }

    // Get request data
    const { fullName, username, email, phone, role, password } = await req.json()

    // Create user with admin powers (SECURE - using service role on server)
    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, username, phone }
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create profile
    if (newUser.user) {
      await supabaseAdmin.from('profiles').upsert({
        id: newUser.user.id,
        full_name: fullName,
        username,
        email,
        phone,
        role: role.toLowerCase(),
        status: 'active',
        permissions: 
          role === 'admin' ? ['All Access'] : 
          role === 'pharmacist' ? ['Sales', 'Inventory', 'Customers', 'Reports', 'Returns', 'Purchases'] :
          role === 'cashier' ? ['Sales', 'Customers'] :
          ['Sales', 'Inventory', 'Customers', 'Reports', 'Returns', 'Users'] // manager
      })
    }

    return new Response(JSON.stringify({ 
      message: `User ${fullName} created successfully` 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})