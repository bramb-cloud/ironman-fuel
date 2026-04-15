'use client'
import { useState, useEffect } from 'react'
import { supabase, USER_ID } from '@/lib/supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const IRONMAN_DATE = new Date('2027-09-07')
const DISCIPLINES = [
  { key: 'swim', label: 'Swim', target: 3.8, unit: 'km', icon: '🏊', color: 'var(--blue)', activityTypes: ['Swim'] },
  { key: 'bike', label: 'Bike', target: 180, unit: 'km', icon: '🚴', color: 'var(--ac)', activityTypes: ['Ride', 'VirtualRide'] },
  { key: 'run', label: 'Run', target: 42.2, unit: 'km', icon: '🏃', color: 'var(--good)', activityTypes: ['Run'] },
]

export default function ProgressTab({ settings }: any) {
  const [weighIns, setWeighIns] = useState<any[]>([])
  const [newWeight, setNewWeight] = useState('')
  const [activities, setActivities] = useState<any[]>([])
  const [weeklyScore, setWeeklyScore] = useState<number | null>(null)
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    loadWeighIns()
    loadActivities()
    loadLogs()
  }, [])

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
    if (data) calcWeeklyScore(data)
  }

  function calcWeeklyScore(data: any[]) {
    const week = data.slice(0, 7)
    if (!week.length) return
    let score = 0
    week.forEach(d => {
      if (d.meals && d.meals.length > 0) score += 10
      if ((d.water_ml || 0) >= (settings.water_target_ml || 2500)) score += 4
    })
    setWeeklyScore(Math.min(100, Math.round((score / (7 * 14)) * 100)))
  }

  async function logWeight() {
    const w = parseFloat(newWeight)
    if (!w || w < 40 || w > 200) return
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('weigh_ins').upsert({ user_id: USER_ID, date: today, weight_kg: w })
    setNewWeight('')
    loadWeighIns()
  }

  const latestWeight = weighIns.length ? weighIns[weighIns.length - 1].weight_kg : settings.weight_start
  const startWeight = settings.weight_start || 96
  const targetWeight = settings.weight_target || 76
  const lostKg = Math.max(0, startWeight - latestWeight)
  const toGo = Math.max(0, latestWeight - targetWeight)
  const progressPct = Math.min(100, Math.round((lostKg / (startWeight - targetWeight)) * 100))

  const daysToIronman = Math.max(0, Math.floor((IRONMAN_DATE.getTime() - Date.now()) / 86400000))

  function getLongestForType(types: string[]) {
    const acts = activities.filter(a => types.includes(a.activity_type))
    if (!acts.length) return 0
    return Math.max(...acts.map(a => (a.distance_m || 0) / 1000))
  }

  const chartData = weighIns.slice(-12).map(w => ({
    date: new Date(w.date).toLocaleDateString('de', { day: 'numeric', month: 'short' }),
    weight: w.weight_kg,
  }))

  return (
    <div style={{ paddingTop: 20 }}>

      {/* Ironman countdown */}
      <div style={{ background: 'var(--s1)', border: '0.5px solid var(--ac)', borderRadius: 'var(--r)', padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: 'var(--ac)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Ironman September 2027</div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1 }}>{daysToIronman} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--mu)' }}>days to go</span></div>
        <div style={{ fontSize: 12, color: 'var(--mu)', marginTop: 4 }}>7 September 2027 — You will cross that finish line.</div>
      </div>

      {/* Weekly score */}
      {weeklyScore !== null && (
        <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--mu)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Weekly Score</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{ fontSize: 40, fontWeight: 700, color: weeklyScore >= 80 ? 'var(--ac)' : weeklyScore >= 60 ? 'var(--warn)' : 'var(--danger)' }}>{weeklyScore}</div>
            <div style={{ fontSize: 14, color: 'var(--mu)' }}>/ 100</div>
          </div>
          <div style={{ height: 5, background: 'var(--s2)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ height: 5, width: `${weeklyScore}%`, background: weeklyScore >= 80 ? 'var(--ac)' : weeklyScore >= 60 ? 'var(--warn)' : 'var(--danger)', borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 6 }}>Based on logging and hydration this week</div>
        </div>
      )}

      {/* Weight loss progress */}
      <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: 'var(--mu)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Weight Journey</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Current', val: `${latestWeight}kg`, color: 'var(--tx)' },
            { label: 'Lost', val: `${lostKg.toFixed(1)}kg`, color: 'var(--good)' },
            { label: 'To go', val: `${toGo.toFixed(1)}kg`, color: 'var(--warn)' },
          ].map(m => (
            <div key={m.label} style={{ background: 'var(--s2)', borderRadius: 'var(--rs)', padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'var(--mu)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.val}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 6, background: 'var(--s2)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
          <div style={{ height: 6, width: `${progressPct}%`, background: 'var(--ac)', borderRadius: 3, transition: 'width 0.4s' }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--mu)', textAlign: 'center' }}>{progressPct}% to race weight ({targetWeight}kg)</div>

        {chartData.length > 1 && (
          <div style={{ marginTop: 16, height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fill: '#777', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#777', fontSize: 9 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="weight" stroke="var(--ac)" strokeWidth={2} dot={{ fill: 'var(--ac)', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Log weight */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <input
            type="number" placeholder="Today's weight (kg)" value={newWeight}
            onChange={e => setNewWeight(e.target.value)}
            style={{ flex: 1, padding: '11px 14px', background: 'var(--s2)', border: '0.5px solid var(--b2)', borderRadius: 'var(--rs)', color: 'var(--tx)', fontSize: 14 }}
          />
          <button onClick={logWeight} style={{ padding: '11px 16px', background: 'var(--ac2)', border: '0.5px solid var(--ac)', borderRadius: 'var(--rs)', color: 'var(--ac)', fontWeight: 600, fontSize: 14 }}>
            Log
          </button>
        </div>
      </div>

      {/* Ironman readiness */}
      <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: 'var(--mu)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>Ironman Readiness</div>
        {DISCIPLINES.map(d => {
          const longest = getLongestForType(d.activityTypes)
          const pct = Math.min(100, Math.round((longest / d.target) * 100))
          return (
            <div key={d.key} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                <span>{d.icon} {d.label}</span>
                <span style={{ color: 'var(--mu)' }}>
                  {longest > 0 ? `${longest.toFixed(1)}km` : 'No data yet'} / {d.target}{d.unit}
                </span>
              </div>
              <div style={{ height: 8, background: 'var(--s2)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: 8, width: `${pct}%`, background: d.color, borderRadius: 4, transition: 'width 0.6s' }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--mu)', marginTop: 3 }}>
                {pct}% of Ironman {d.label.toLowerCase()} distance
                {longest === 0 && d.key === 'swim' ? ' — swimming starts Aug/Sep 2026' : ''}
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent activities */}
      {activities.length > 0 && (
        <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--mu)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Recent Activities</div>
          {activities.slice(0, 8).map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 10, borderBottom: '0.5px solid var(--b1)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 2 }}>
                  {new Date(a.start_date).toLocaleDateString('de', { day: 'numeric', month: 'short' })} · {((a.distance_m || 0) / 1000).toFixed(1)}km · {Math.floor((a.duration_s || 0) / 60)}min
                  {a.avg_hr ? ` · ${a.avg_hr}bpm` : ''}
                </div>
              </div>
              <div style={{ fontSize: 18 }}>
                {a.activity_type === 'Run' ? '🏃' : a.activity_type === 'Ride' ? '🚴' : '🏊'}
              </div>
            </div>
          ))}
        </div>
      )}

      {activities.length === 0 && (
        <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 20, textAlign: 'center', color: 'var(--mu)', fontSize: 13 }}>
          Connect Strava in Settings to see your activities here
        </div>
      )}

      <div style={{ height: 24 }} />
    </div>
  )
}
