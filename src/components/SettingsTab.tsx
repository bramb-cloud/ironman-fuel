'use client'
import { useState, useEffect } from 'react'
import { supabase, USER_ID } from '@/lib/supabase'

const STRAVA_CLIENT_ID = '212915'
const REDIRECT_URI = 'https://ironman-fuel.vercel.app/api/strava'

export default function SettingsTab({ settings, onUpdate }: any) {
  const [saved, setSaved] = useState(false)
  const [stravaConnected, setStravaConnected] = useState(!!settings?.strava_access_token)

  useEffect(() => {
    supabase.from('settings').select('strava_access_token').eq('user_id', USER_ID).single()
      .then(({ data }) => setStravaConnected(!!data?.strava_access_token))
  }, [])

  async function clearToday() {
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('daily_logs').delete().eq('user_id', USER_ID).eq('date', today)
    window.location.reload()
  }

  async function save(key: string, val: any) {
    onUpdate({ [key]: val })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function connectStrava() {
    const scope = 'read,activity:read_all'
    const url = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scope}`
    window.location.href = url
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', background: 'var(--s2)',
    border: '0.5px solid var(--b2)', borderRadius: 'var(--rs)',
    color: 'var(--tx)', fontSize: 14,
  } as any

  const sec = { marginBottom: 24 } as any
  const stitle = { fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const, color: 'var(--mu)', marginBottom: 12 }

  return (
    <div style={{ paddingTop: 20 }}>

      {saved && (
        <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: 'var(--ac)', color: '#000', padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600, zIndex: 200 }}>
          Saved ✓
        </div>
      )}

      {/* Strava */}
      <div style={sec}>
        <div style={stitle}>Strava Connection</div>
        <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 16 }}>
          {stravaConnected ? (
            <div>
              <div style={{ fontSize: 13, color: 'var(--good)', fontWeight: 600, marginBottom: 4 }}>✓ Connected to Strava</div>
              <div style={{ fontSize: 12, color: 'var(--mu)' }}>Activities sync automatically when you finish a workout on Garmin.</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 12, lineHeight: 1.5 }}>
                Connect Strava to automatically sync your Garmin activities and track Ironman readiness.
              </div>
              <button onClick={connectStrava} style={{
                width: '100%', padding: 12, background: '#fc4c02', border: 'none',
                borderRadius: 'var(--rs)', color: '#fff', fontSize: 14, fontWeight: 700
              }}>
                Connect with Strava
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Kcal targets */}
      <div style={sec}>
        <div style={stitle}>Daily kcal Targets</div>
        <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: '🛋️ Rest day', key: 'kcal_rest' },
            { label: '🏋️ Strength session', key: 'kcal_strength' },
            { label: '🚴 Zone 2 ride (1hr)', key: 'kcal_ride' },
            { label: '🏃 Zone 2 run (1hr)', key: 'kcal_run' },
            { label: '🚴 Long ride (2hr+)', key: 'kcal_longride' },
          ].map(item => (
            <div key={item.key}>
              <div style={{ fontSize: 12, color: 'var(--mu)', marginBottom: 6 }}>{item.label}</div>
              <input
                type="number" value={settings[item.key] || ''}
                onChange={e => save(item.key, parseInt(e.target.value))}
                style={{ ...inputStyle, fontWeight: 600 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Kcal burned per session */}
      <div style={sec}>
        <div style={stitle}>Avg kcal Burned per Session</div>
        <div style={{ fontSize: 12, color: 'var(--mu)', marginBottom: 10, lineHeight: 1.5 }}>
          Check your Garmin for average kcal per session type and enter here. This is used to set accurate daily targets.
        </div>
        <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: '🏋️ Strength session', key: 'burned_strength' },
            { label: '🚴 Zone 2 ride (1hr)', key: 'burned_ride' },
            { label: '🏃 Zone 2 run (1hr)', key: 'burned_run' },
            { label: '🚴 Long ride (2hr+)', key: 'burned_longride' },
          ].map(item => (
            <div key={item.key}>
              <div style={{ fontSize: 12, color: 'var(--mu)', marginBottom: 6 }}>{item.label}</div>
              <input
                type="number" value={settings[item.key] || ''}
                onChange={e => save(item.key, parseInt(e.target.value))}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Water target */}
      <div style={sec}>
        <div style={stitle}>Daily Water Target</div>
        <input
          type="number" value={settings.water_target_ml || 2500}
          onChange={e => save('water_target_ml', parseInt(e.target.value))}
          style={inputStyle}
        />
        <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 6 }}>ml per day (recommended: 2500ml minimum on training days)</div>
      </div>

      {/* Weight targets */}
      <div style={sec}>
        <div style={stitle}>Weight Goals</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--mu)', marginBottom: 6 }}>Starting weight (kg)</div>
            <input type="number" value={settings.weight_start || 96} onChange={e => save('weight_start', parseFloat(e.target.value))} style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--mu)', marginBottom: 6 }}>Target weight (kg)</div>
            <input type="number" value={settings.weight_target || 76} onChange={e => save('weight_target', parseFloat(e.target.value))} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Clear day */}
      <div style={sec}>
        <div style={stitle}>Reset</div>
        <button onClick={clearToday} style={{
          width: '100%', padding: 12, background: 'var(--danger2)', border: '0.5px solid var(--danger)',
          borderRadius: 'var(--rs)', color: 'var(--danger)', fontSize: 14, fontWeight: 600
        }}>
          Clear today's log
        </button>
      </div>

      <div style={{ height: 24 }} />
    </div>
  )
}
