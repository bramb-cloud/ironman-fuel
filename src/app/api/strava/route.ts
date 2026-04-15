import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const USER_ID = 'bram_depypere'
const CLIENT_ID = process.env.STRAVA_CLIENT_ID!
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET!

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/?strava=error', request.url))
  }

  try {
    const tokenRes = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()

    if (!tokens.access_token) {
      console.error('No access token:', JSON.stringify(tokens))
      return NextResponse.redirect(new URL('/?strava=error&reason=notoken', request.url))
    }

    // First try update, then insert if no row exists
    const { error: updateError } = await supabase
      .from('settings')
      .update({
        strava_access_token: tokens.access_token,
        strava_refresh_token: tokens.refresh_token,
        strava_token_expiry: tokens.expires_at,
      })
      .eq('user_id', USER_ID)

    if (updateError) {
      console.error('Token save error:', updateError)
    }

    // Fetch recent activities immediately
    await fetchAndStoreActivities(tokens.access_token)

    return NextResponse.redirect(new URL('/?strava=connected', request.url))
  } catch (e) {
    console.error('Strava auth error:', e)
    return NextResponse.redirect(new URL('/?strava=error&reason=exception', request.url))
  }
}

async function fetchAndStoreActivities(accessToken: string) {
  try {
    const res = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=100', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const activities = await res.json()

    for (const a of activities) {
      await supabase.from('strava_activities').upsert({
        user_id: USER_ID,
        strava_id: a.id,
        activity_type: a.type,
        name: a.name,
        distance_m: a.distance,
        duration_s: a.moving_time,
        elevation_m: a.total_elevation_gain,
        avg_hr: a.average_heartrate ? Math.round(a.average_heartrate) : null,
        max_hr: a.max_heartrate ? Math.round(a.max_heartrate) : null,
        kcal: a.calories,
        avg_speed: a.average_speed,
        start_date: a.start_date,
        raw: a,
      }, { onConflict: 'strava_id' })
    }
  } catch (e) {
    console.error('Failed to fetch activities:', e)
  }
}
