import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Rate limit config
const RATE_LIMIT_WINDOW_MINUTES = 10
const RATE_LIMIT_MAX_REQUESTS = 3
const DAILY_LIMIT_MAX_REQUESTS = 10

// Validation
const MAX_NAME_LENGTH = 100
const MAX_EMAIL_LENGTH = 255
const MAX_PHONE_LENGTH = 30
const MAX_MESSAGE_LENGTH = 2000
const MAX_SOURCE_LENGTH = 50
const MAX_SLUG_LENGTH = 100
const MAX_UTM_LENGTH = 200
const MAX_METADATA_SIZE = 10000 // 10KB

interface LeadSubmission {
  name: string
  email: string
  phone?: string
  message?: string
  source: string
  page_slug?: string
  tool_key?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  metadata?: Record<string, unknown>
  honeypot?: string // Hidden field - if filled, it's a bot
}

// Simple hash function for fallback key
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return `hash_${Math.abs(hash).toString(36)}`
}

function getClientIP(req: Request, email: string): string {
  // Check various headers for client IP
  const cfConnectingIP = req.headers.get('cf-connecting-ip')
  if (cfConnectingIP) return cfConnectingIP

  const xForwardedFor = req.headers.get('x-forwarded-for')
  if (xForwardedFor) {
    // Take the first IP in the chain
    return xForwardedFor.split(',')[0].trim()
  }

  const xRealIP = req.headers.get('x-real-ip')
  if (xRealIP) return xRealIP

  // Fallback: use hash of email + user-agent
  const userAgent = req.headers.get('user-agent') || ''
  return simpleHash(email.toLowerCase() + userAgent)
}

function getBucketWindowStart(): string {
  const now = Date.now()
  const bucketMs = RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
  const bucketStart = Math.floor(now / bucketMs) * bucketMs
  return new Date(bucketStart).toISOString()
}

function getDayStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validateInput(data: LeadSubmission): { valid: boolean; error?: string } {
  // Required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    return { valid: false, error: 'Name is required' }
  }
  if (!data.email || typeof data.email !== 'string' || data.email.trim().length === 0) {
    return { valid: false, error: 'Email is required' }
  }
  if (!data.source || typeof data.source !== 'string' || data.source.trim().length === 0) {
    return { valid: false, error: 'Source is required' }
  }

  // Email format
  if (!validateEmail(data.email.trim())) {
    return { valid: false, error: 'Invalid email format' }
  }

  // Length limits
  if (data.name.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `Name must be less than ${MAX_NAME_LENGTH} characters` }
  }
  if (data.email.length > MAX_EMAIL_LENGTH) {
    return { valid: false, error: `Email must be less than ${MAX_EMAIL_LENGTH} characters` }
  }
  if (data.phone && data.phone.length > MAX_PHONE_LENGTH) {
    return { valid: false, error: `Phone must be less than ${MAX_PHONE_LENGTH} characters` }
  }
  if (data.message && data.message.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Message must be less than ${MAX_MESSAGE_LENGTH} characters` }
  }
  if (data.source.length > MAX_SOURCE_LENGTH) {
    return { valid: false, error: `Source must be less than ${MAX_SOURCE_LENGTH} characters` }
  }
  if (data.page_slug && data.page_slug.length > MAX_SLUG_LENGTH) {
    return { valid: false, error: `Page slug must be less than ${MAX_SLUG_LENGTH} characters` }
  }
  if (data.tool_key && data.tool_key.length > MAX_SLUG_LENGTH) {
    return { valid: false, error: `Tool key must be less than ${MAX_SLUG_LENGTH} characters` }
  }

  // UTM field limits
  const utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
  for (const field of utmFields) {
    if (data[field] && data[field]!.length > MAX_UTM_LENGTH) {
      return { valid: false, error: `${field} must be less than ${MAX_UTM_LENGTH} characters` }
    }
  }

  // Metadata size limit
  if (data.metadata) {
    const metadataStr = JSON.stringify(data.metadata)
    if (metadataStr.length > MAX_METADATA_SIZE) {
      return { valid: false, error: `Metadata must be less than ${MAX_METADATA_SIZE} bytes` }
    }
  }

  return { valid: true }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, code: 'METHOD_NOT_ALLOWED' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let rateLimitDegraded = false

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse body
    let data: LeadSubmission
    try {
      data = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ success: false, code: 'INVALID_JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Honeypot check - if filled, silently accept but don't insert
    if (data.honeypot && data.honeypot.trim().length > 0) {
      console.log('Honeypot triggered, rejecting silently')
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate input
    const validation = validateInput(data)
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ success: false, code: 'VALIDATION', message: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get client IP (with email fallback for unknown)
    const clientIP = getClientIP(req, data.email)
    const bucketWindowStart = getBucketWindowStart()
    const dayStart = getDayStart()

    // Check rate limit for current bucket
    const { data: bucketData, error: bucketError } = await supabase
      .from('lead_rate_limits')
      .select('request_count')
      .eq('ip_address', clientIP)
      .eq('window_start', bucketWindowStart)
      .maybeSingle()

    if (bucketError) {
      console.warn('Rate limit bucket check error:', bucketError)
      rateLimitDegraded = true
      // In degraded mode, allow 1 request but don't insert - fail safe
    } else if (bucketData && bucketData.request_count >= RATE_LIMIT_MAX_REQUESTS) {
      console.log(`Rate limit exceeded for ${clientIP}: ${bucketData.request_count} in bucket`)
      return new Response(
        JSON.stringify({ success: false, code: 'RATE_LIMIT' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check daily limit
    const { data: dailyData, error: dailyError } = await supabase
      .from('lead_rate_limits')
      .select('request_count')
      .eq('ip_address', clientIP)
      .gte('window_start', dayStart)

    if (dailyError) {
      console.warn('Daily limit check error:', dailyError)
      rateLimitDegraded = true
    } else {
      const totalDaily = dailyData?.reduce((sum, r) => sum + r.request_count, 0) ?? 0
      if (totalDaily >= DAILY_LIMIT_MAX_REQUESTS) {
        console.log(`Daily limit exceeded for ${clientIP}: ${totalDaily} today`)
        return new Response(
          JSON.stringify({ success: false, code: 'RATE_LIMIT' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Upsert rate limit bucket (increment counter)
    if (!rateLimitDegraded) {
      const { error: upsertError } = await supabase
        .from('lead_rate_limits')
        .upsert(
          {
            ip_address: clientIP,
            window_start: bucketWindowStart,
            request_count: 1
          },
          {
            onConflict: 'ip_address,window_start',
            ignoreDuplicates: false
          }
        )

      if (upsertError) {
        // If upsert failed, try incrementing existing row
        const { error: updateError } = await supabase
          .rpc('increment_rate_limit', { 
            p_ip: clientIP, 
            p_window: bucketWindowStart 
          })
        
        if (updateError) {
          console.warn('Failed to record rate limit:', updateError)
          rateLimitDegraded = true
        }
      }
    }

    // Insert lead
    const { error: insertError } = await supabase
      .from('leads')
      .insert({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        message: data.message?.trim() || null,
        source: data.source.trim(),
        page_slug: data.page_slug?.trim() || null,
        tool_key: data.tool_key?.trim() || null,
        utm_source: data.utm_source?.trim() || null,
        utm_medium: data.utm_medium?.trim() || null,
        utm_campaign: data.utm_campaign?.trim() || null,
        utm_content: data.utm_content?.trim() || null,
        utm_term: data.utm_term?.trim() || null,
        metadata: data.metadata || null,
        status: 'new'
      })

    if (insertError) {
      console.error('Lead insert error:', insertError)
      return new Response(
        JSON.stringify({ success: false, code: 'SERVER_ERROR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const responseHeaders: Record<string, string> = {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
    if (rateLimitDegraded) {
      responseHeaders['X-RateLimit-Degraded'] = 'true'
    }

    console.log(`Lead submitted successfully from ${clientIP}: ${data.email}`)
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: responseHeaders }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ success: false, code: 'SERVER_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
