'use client'
import { useState, useEffect } from 'react'
import { supabase, USER_ID } from '@/lib/supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const IRONMAN_DATE = new Date('2027-09-07')

// Phase 1 Foundation defaults — Apr-Jun 2026
// Cycling strong, running needs work — targets reflect this gap intentionally
const DEFAULT_TARGETS = {
  bike_km: 60,    // 2 rides ~30km each — current level
  run_km: 8,      // 2 runs — 3+5km, building carefully with meniscus
  strength: 2,    // sessions per week — already consistent
}

function SportBar({ icon, label, current, target, unit, color, sublabel }: any) {
  const pct = Math.min(100, target > 0 ? Math.round((current / target) * 100) : 0)
  const over = current > target
  const remaining = Math.max(0, target - current)
  const statusColor = pct >= 100 ? 'var(--good)' : pct >= 60 ? 'var(--warn)' : 'var(--danger)'

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>{icon}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)' }}>{label}</div>
            {sublabel && <div style={{ fontSize: 10, color: 'var(--mu)', letterSpacing: '0.5px' }}>{sublabel}</div>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: over ? 'var(--good)' : 'var(--tx)' }}>
            {current.toFixed(1)}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--mu)' }}>{unit}</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--mu)' }}>/ {target}{unit} target</div>
        </div>
      </div>

      {/* Bar */}
      <div style={{ position: 'relative', height: 12, background: 'var(--s2)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{
          height: 12, width: `${pct}%`, borderRadius: 6,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          transition: 'width 0.6s ease',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 10 }}>
        <span style={{ color: statusColor, fontWeight: 600 }}>{pct}% done</span>
        <span style={{ color: 'var(--mu)' }}>
          {pct >= 100 ? '✓ Target hit!' : `${remaining.toFixed(1)}${unit} to go`}
        </span>
      </div>
    </div>
  )
}

export default function ProgressTab({ settings }: any) {
  const [weighIns, setWeighIns] = useState<any[]>([])
  const [newWeight, setNewWeight] = useState('')
  const [activities, setActivities] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [targets, setTargets] = useState(DEFAULT_TARGETS)
  const [editingTargets, setEditingTargets] = useState(false)
  const [tempTargets, setTempTargets] = useState(DEFAULT_TARGETS)
  const [weeklyScore, setWeeklyScore] = useState<number | null>(null)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    await Promise.all([loadWeighIns(), loadActivities(), loadLogs(), loadTargets()])
  }

  async function loadWeighIns() {
    const { data } = await supabase.from('weigh_ins').select('*').eq('user_id', USER_ID).order('date', { ascending: true }).limit(50)
    setWeighIns(data || [])
  }

  async function loadActivities() {
    const { data } = await supabase.from('strava_activities').select('*').eq('user_id', USER_ID).order('start_date', { ascending: false }).limit(200)
    setActivities(data || [])
  }

  async function loadLogs() {
    const { data } = await supabase.from('daily_logs').select('*').eq('user_id', USER_ID).order('date', { ascending: false }).limit(30)
    setLogs(data || [])
    if (data) {
      const week = data.slice(0, 7)
      let score = 0
      week.forEach(d => {
        if (d.meals && d.meals.length > 0) score += 10
        if ((d.water_ml || 0) >= (settings?.water_target_ml || 2500)) score += 4
      })
      setWeeklyScore(Math.min(100, Math.round((score / (7 * 14)) * 100)))
    }
  }

  async function loadTargets() {
    const { data } = await supabase.from('settings').select('weekly_bike_km, weekly_run_km, weekly_strength').eq('user_id', USER_ID).single()
    if (data && (data.weekly_bike_km || data.weekly_run_km)) {
      const t = {
        bike_km: data.weekly_bike_km || DEFAULT_TARGETS.bike_km,
        run_km: data.weekly_run_km || DEFAULT_TARGETS.run_km,
        strength: data.weekly_strength || DEFAULT_TARGETS.strength,
      }
      setTargets(t)
      setTempTargets(t)
    }
  }

  async function saveTargets() {
    await supabase.from('settings').update({
      weekly_bike_km: tempTargets.bike_km,
      weekly_run_km: tempTargets.run_km,
      weekly_strength: tempTargets.strength,
    }).eq('user_id', USER_ID)
    setTargets(tempTargets)
    setEditingTargets(false)
  }

  async function logWeight() {
    const w = parseFloat(newWeight)
    if (!w || w < 40 || w > 200) return
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('weigh_ins').upsert({ user_id: USER_ID, date: today, weight_kg: w })
    setNewWeight('')
    loadWeighIns()
  }

  // This week's Monday
  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1 // Mon=0
  const monday = new Date(now)
  monday.setDate(now.getDate() - dayOfWeek)
  monday.setHours(0, 0, 0, 0)

  const thisWeekActs = activities.filter(a => {
    const actDate = new Date(a.start_date)
    return actDate >= monday
  })

  const weekBikeKm = thisWeekActs
    .filter(a => a.activity_type === 'Ride' || a.activity_type === 'VirtualRide')
    .reduce((s, a) => s + (a.distance_m || 0) / 1000, 0)

  const weekRunKm = thisWeekActs
    .filter(a => a.activity_type === 'Run')
    .reduce((s, a) => s + (a.distance_m || 0) / 1000, 0)

  // Strength: detect WeightTraining, Workout, or any non-cardio Strava type this week
  const strengthThisWeek = thisWeekActs
    .filter(a => ['WeightTraining', 'Workout', 'Crossfit', 'RockClimbing', 'Yoga'].includes(a.activity_type))
    .length

  // Overall weekly training score
  const bikePct = Math.min(100, targets.bike_km > 0 ? (weekBikeKm / targets.bike_km) * 100 : 0)
  const runPct = Math.min(100, targets.run_km > 0 ? (weekRunKm / targets.run_km) * 100 : 0)
  const strengthPct = Math.min(100, targets.strength > 0 ? (strengthThisWeek / targets.strength) * 100 : 0)
  const trainingScore = Math.round((bikePct + runPct + strengthPct) / 3)

  // What needs most attention
  const gaps = [
    { label: 'cycling', pct: bikePct, remaining: Math.max(0, targets.bike_km - weekBikeKm), unit: 'km' },
    { label: 'running', pct: runPct, remaining: Math.max(0, targets.run_km - weekRunKm), unit: 'km' },
    { label: 'strength', pct: strengthPct, remaining: Math.max(0, targets.strength - strengthThisWeek), unit: ' sessions' },
  ].sort((a, b) => a.pct - b.pct)
  const biggestGap = gaps[0]

  const latestWeight = weighIns.length ? weighIns[weighIns.length - 1].weight_kg : settings?.weight_start || 96
  const startWeight = settings?.weight_start || 96
  const targetWeight = settings?.weight_target || 76
  const lostKg = Math.max(0, startWeight - latestWeight)
  const toGo = Math.max(0, latestWeight - targetWeight)
  const weightPct = Math.min(100, Math.round((lostKg / (startWeight - targetWeight)) * 100))
  const daysToIronman = Math.max(0, Math.floor((IRONMAN_DATE.getTime() - Date.now()) / 86400000))

  const chartData = weighIns.slice(-12).map(w => ({
    date: new Date(w.date).toLocaleDateString('de', { day: 'numeric', month: 'short' }),
    weight: w.weight_kg,
  }))

  // Days left in week
  const daysLeftInWeek = 7 - dayOfWeek - 1

  return (
    <div style={{ paddingTop: 20 }}>

      {/* Ironman countdown */}
      <div style={{ background: 'var(--s1)', border: '0.5px solid var(--ac)', borderRadius: 'var(--r)', padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: 'var(--ac)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 6 }}>Ironman September 2027</div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1 }}>{daysToIronman} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--mu)' }}>days to go</span></div>
        <div style={{ fontSize: 12, color: 'var(--mu)', marginTop: 4 }}>7 September 2027 — You will cross that finish line.</div>
      </div>

      {/* ── WEEKLY TRAINING TARGETS ── */}
      <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--mu)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 4 }}>This Week</div>
            <div style={{ fontSize: 11, color: 'var(--mu)' }}>{daysLeftInWeek} day{daysLeftInWeek !== 1 ? 's' : ''} remaining</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: trainingScore >= 80 ? 'var(--good)' : trainingScore >= 50 ? 'var(--warn)' : 'var(--danger)', lineHeight: 1 }}>
              {trainingScore}
            </div>
            <div style={{ fontSize: 10, color: 'var(--mu)' }}>/ 100</div>
          </div>
        </div>

        {/* Overall bar */}
        <div style={{ height: 8, background: 'var(--s2)', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ height: 8, width: `${trainingScore}%`, background: trainingScore >= 80 ? 'var(--good)' : trainingScore >= 50 ? 'var(--warn)' : 'var(--danger)', borderRadius: 4, transition: 'width 0.6s' }} />
        </div>

        {/* Focus tip */}
        {biggestGap.pct < 100 && (
          <div style={{ background: 'var(--danger2)', border: '0.5px solid var(--danger)', borderRadius: 'var(--rs)', padding: '8px 12px', marginBottom: 16, fontSize: 12, color: 'var(--danger)' }}>
            ⚡ Focus: {biggestGap.label} is furthest behind — {biggestGap.remaining.toFixed(1)}{biggestGap.unit} still needed this week
          </div>
        )}

        {/* Debug — remove once bars work */}
        <div style={{ fontSize: 10, color: 'var(--mu)', marginBottom: 12, padding: '6px 10px', background: 'var(--s2)', borderRadius: 'var(--rs)' }}>
          🔍 This week ({monday.toLocaleDateString('de')} → now): {thisWeekActs.length} activities · {weekBikeKm.toFixed(1)}km bike · {weekRunKm.toFixed(1)}km run · {strengthThisWeek} strength · Total loaded: {activities.length}
        </div>

        {trainingScore >= 100 && (
          <div style={{ background: 'var(--good2)', border: '0.5px solid var(--good)', borderRadius: 'var(--rs)', padding: '8px 12px', marginBottom: 16, fontSize: 12, color: 'var(--good)', fontWeight: 600 }}>
            🏆 Week complete! All targets hit.
          </div>
        )}

        <SportBar
          icon="🚴" label="Cycling" unit="km"
          current={weekBikeKm} target={targets.bike_km}
          color="var(--ac)" sublabel="Zone 2 outdoor rides"
        />
        <SportBar
          icon="🏃" label="Running" unit="km"
          current={weekRunKm} target={targets.run_km}
          color="var(--good)" sublabel="Zone 2 · watch the knee"
        />
        <SportBar
          icon="💪" label="Strength" unit=" sessions"
          current={strengthThisWeek} target={targets.strength}
          color="var(--purple)" sublabel="Home gym"
        />

        {/* Edit targets */}
        {!editingTargets ? (
          <button onClick={() => setEditingTargets(true)} style={{
            width: '100%', marginTop: 8, padding: '9px 0', background: 'transparent',
            border: '0.5px solid var(--b2)', borderRadius: 'var(--rs)',
            color: 'var(--mu)', fontSize: 12, cursor: 'pointer',
          }}>
            ⚙️ Adjust weekly targets
          </button>
        ) : (
          <div style={{ marginTop: 12, padding: 14, background: 'var(--s2)', borderRadius: 'var(--rs)' }}>
            <div style={{ fontSize: 11, color: 'var(--mu)', marginBottom: 12, fontWeight: 600 }}>WEEKLY TARGETS</div>
            {[
              { key: 'bike_km', label: '🚴 Cycling target (km)', min: 10, max: 300, step: 5 },
              { key: 'run_km', label: '🏃 Running target (km)', min: 2, max: 80, step: 1 },
              { key: 'strength', label: '💪 Strength sessions', min: 1, max: 5, step: 1 },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--tx)', marginBottom: 6 }}>
                  <span>{f.label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--ac)' }}>{(tempTargets as any)[f.key]}{f.key === 'strength' ? ' sessions' : 'km'}</span>
                </div>
                <input type="range" min={f.min} max={f.max} step={f.step}
                  value={(tempTargets as any)[f.key]}
                  onChange={e => setTempTargets(prev => ({ ...prev, [f.key]: +e.target.value }))}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button onClick={saveTargets} style={{ flex: 2, padding: 10, background: 'var(--ac2)', border: '0.5px solid var(--ac)', borderRadius: 'var(--rs)', color: 'var(--ac)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                Save targets
              </button>
              <button onClick={() => setEditingTargets(false)} style={{ flex: 1, padding: 10, background: 'transparent', border: '0.5px solid var(--b2)', borderRadius: 'var(--rs)', color: 'var(--mu)', fontSize: 12, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Weight */}
      <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: 'var(--mu)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 12 }}>Weight Journey</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Current', val: `${latestWeight}kg`, color: 'var(--tx)' },
            { label: 'Lost', val: `${lostKg.toFixed(1)}kg`, color: 'var(--good)' },
            { label: 'To go', val: `${toGo.toFixed(1)}kg`, color: 'var(--warn)' },
          ].map(m => (
            <div key={m.label} style={{ background: 'var(--s2)', borderRadius: 'var(--rs)', padding: 10, textAlign: 'center' as const }}>
              <div style={{ fontSize: 9, color: 'var(--mu)', textTransform: 'uppercase' as const, letterSpacing: 0.5, marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.val}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 6, background: 'var(--s2)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
          <div style={{ height: 6, width: `${weightPct}%`, background: 'var(--ac)', borderRadius: 3, transition: 'width 0.4s' }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--mu)', textAlign: 'center' as const, marginBottom: 14 }}>{weightPct}% to race weight ({targetWeight}kg)</div>

        {chartData.length > 1 && (
          <div style={{ height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 10 }} width={30} />
                <Tooltip formatter={(v: any) => [`${v}kg`, 'Weight']} />
                <Line type="monotone" dataKey="weight" stroke="var(--ac)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <input type="number" placeholder="Today's weight (kg)" value={newWeight}
            onChange={e => setNewWeight(e.target.value)} step="0.1"
            style={{ flex: 1, padding: '11px 14px', background: 'var(--s2)', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', color: 'var(--tx)', fontSize: 14 }} />
          <button onClick={logWeight} style={{ padding: '11px 16px', background: 'var(--ac2)', border: '0.5px solid var(--ac)', borderRadius: 'var(--r)', color: 'var(--ac)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Log
          </button>
        </div>
      </div>

      {/* Recent Strava activities */}
      {activities.length > 0 && (
        <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--mu)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 12 }}>Recent Activities</div>
          {activities.slice(0, 8).map((a: any, i: number) => {
            const icon = a.activity_type === 'Ride' || a.activity_type === 'VirtualRide' ? '🚴' : a.activity_type === 'Run' ? '🏃' : '🏊'
            const km = ((a.distance_m || 0) / 1000).toFixed(1)
            const mins = Math.round((a.duration_s || 0) / 60)
            const date = new Date(a.start_date).toLocaleDateString('de', { weekday: 'short', day: 'numeric', month: 'short' })
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, marginBottom: 10, borderBottom: i < 7 ? '0.5px solid var(--b1)' : 'none' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--tx)' }}>{a.name || a.activity_type}</div>
                    <div style={{ fontSize: 11, color: 'var(--mu)' }}>{date}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ac)' }}>{km}km</div>
                  <div style={{ fontSize: 11, color: 'var(--mu)' }}>{mins}min</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ height: 24 }} />
    </div>
  )
}
