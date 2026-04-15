import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const USER_ID = 'bram_depypere'
const CLIENT_ID = process.env.STRAVA_CLIENT_ID!
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET!
const VERIFY_TOKEN = 'ironman_fuel_webhook_2024'

// GET — Strava webhook verification handshake
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return NextResponse.json({ 'hub.challenge': challenge })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

// POST — Strava sends new activity events here
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.object_type !== 'activity' || body.aspect_type !== 'create') {
      return NextResponse.json({ ok: true })
    }

    const activityId = body.object_id

    // Get fresh access token
    const { data: settingsData } = await supabase
      .from('settings')
      .select('strava_access_token, strava_refresh_token, strava_token_expiry')
      .eq('user_id', USER_ID)
      .single()

    if (!settingsData?.strava_access_token) {
      return NextResponse.json({ ok: false, error: 'No token' })
    }

    let accessToken = settingsData.strava_access_token

    // Refresh token if expired
    if (settingsData.strava_token_expiry && Date.now() / 1000 > settingsData.strava_token_expiry - 300) {
      const refreshRes = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: settingsData.strava_refresh_token,
        }),
      })
      const refreshed = await refreshRes.json()
      if (refreshed.access_token) {
        accessToken = refreshed.access_token
        await supabase.from('settings').update({
          strava_access_token: refreshed.access_token,
          strava_refresh_token: refreshed.refresh_token,
          strava_token_expiry: refreshed.expires_at,
        }).eq('user_id', USER_ID)
      }
    }

    // Fetch the new activity
    const actRes = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const a = await actRes.json()

    // Store in Supabase
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

    // Check and unlock achievements based on new activity
    await checkActivityAchievements(a, accessToken)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Webhook error:', e)
    return NextResponse.json({ ok: false })
  }
}

async function checkActivityAchievements(activity: any, accessToken: string) {
  try {
    const { data: all } = await supabase
      .from('strava_activities')
      .select('*')
      .eq('user_id', USER_ID)

    const { data: existing } = await supabase
      .from('achievements')
      .select('achievement_key')
      .eq('user_id', USER_ID)

    const unlocked = new Set((existing || []).map((e: any) => e.achievement_key))

    async function unlock(key: string) {
      if (unlocked.has(key)) return
      await supabase.from('achievements').insert({ user_id: USER_ID, achievement_key: key })
      unlocked.add(key)
    }

    const acts = all || []
    const runs = acts.filter((a: any) => a.activity_type === 'Run')
    const rides = acts.filter((a: any) => ['Ride', 'VirtualRide'].includes(a.activity_type))

    const totalRunKm = runs.reduce((s: number, a: any) => s + (a.distance_m || 0) / 1000, 0)
    const totalRideKm = rides.reduce((s: number, a: any) => s + (a.distance_m || 0) / 1000, 0)
    const totalElevation = acts.reduce((s: number, a: any) => s + (a.elevation_m || 0), 0)
    const totalSessions = acts.length

    const distKm = (activity.distance || 0) / 1000
    const type = activity.type

    // First activity
    if (type === 'Run') await unlock('run_first')
    if (type === 'Ride' || type === 'VirtualRide') await unlock('ride_first')

    // Single session distance — run
    if (type === 'Run') {
      if (distKm >= 5) await unlock('run_5k')
      if (distKm >= 10) await unlock('run_10k')
      if (distKm >= 21.1) await unlock('run_half')
      if (distKm >= 42.2) await unlock('run_marathon')
    }

    // Single session distance — ride
    if (type === 'Ride' || type === 'VirtualRide') {
      if (distKm >= 50) await unlock('ride_50k')
      if (distKm >= 100) await unlock('ride_100k')
      if (distKm >= 180) await unlock('ride_180k')
    }

    // Cumulative running
    if (totalRunKm >= 500) await unlock('run_500km_total')
    if (totalRunKm >= 876) await unlock('run_germany')

    // Cumulative riding
    if (totalRideKm >= 1000) await unlock('ride_1000km_total')
    if (totalRideKm >= 1400) await unlock('ride_rome')
    if (totalRideKm >= 5000) await unlock('ride_5000km_total')

    // Elevation
    if (totalElevation >= 8849) await unlock('elev_everest')
    if (totalElevation >= 26547) await unlock('elev_3everest')

    // Session count
    if (totalSessions >= 10) await unlock('sessions_10')
    if (totalSessions >= 50) await unlock('sessions_50')
    if (totalSessions >= 100) await unlock('sessions_100')

    // Monthly totals
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const monthActs = acts.filter((a: any) => a.start_date >= monthStart)
    const monthRunKm = monthActs.filter((a: any) => a.activity_type === 'Run').reduce((s: number, a: any) => s + (a.distance_m || 0) / 1000, 0)
    const monthRideKm = monthActs.filter((a: any) => ['Ride', 'VirtualRide'].includes(a.activity_type)).reduce((s: number, a: any) => s + (a.distance_m || 0) / 1000, 0)

    if (monthRunKm >= 50) await unlock('run_50km_month')
    if (monthRunKm >= 100) await unlock('run_100km_month')
    if (monthRideKm >= 200) await unlock('ride_200km_month')
    if (monthRideKm >= 500) await unlock('ride_500km_month')

  } catch (e) {
    console.error('Achievement check failed:', e)
  }
}
