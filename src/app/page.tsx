'use client'
import { useState, useEffect } from 'react'
import TodayTab from '@/components/TodayTab'
import ProgressTab from '@/components/ProgressTab'
import FoodsTab from '@/components/FoodsTab'
import SettingsTab from '@/components/SettingsTab'
import AchievementsTab from '@/components/AchievementsTab'
import FarmTab from '@/components/FarmTab'
import { supabase, USER_ID } from '@/lib/supabase'

const TABS = [
  { id: 'today',    label: 'Today',    icon: '🍽️' },
  { id: 'progress', label: 'Progress', icon: '📈' },
  { id: 'farm',     label: 'Farm',     icon: '🌾' },
  { id: 'awards',   label: 'Awards',   icon: '🏆' },
  { id: 'settings', label: 'More',     icon: '⚙️' },
]

export default function Home() {
  const [tab, setTab] = useState('today')
  const [settings, setSettings] = useState<any>(null)
  const [todayLog, setTodayLog] = useState<any>(null)
  const [streak, setStreak] = useState(0)
  const [farmCoins, setFarmCoins] = useState<{training: number, farm: number} | null>(null)
  const [moments, setMoments] = useState<any[]>([])

  useEffect(() => { loadSettings() }, [])
  useEffect(() => { if (settings) loadToday() }, [settings])
  useEffect(() => { loadMoments(); loadFarmCoins() }, [])

  async function loadSettings() {
    const { data } = await supabase.from('settings').select('*').eq('user_id', USER_ID).single()
    if (data) {
      setSettings(data)
    } else {
      const defaults = {
        user_id: USER_ID,
        kcal_rest: 1750, kcal_strength: 1850, kcal_ride: 1950,
        kcal_run: 2050, kcal_longride: 2200,
        burned_strength: 200, burned_ride: 375, burned_run: 480, burned_longride: 700,
        water_target_ml: 2500, weight_start: 96, weight_target: 76,
      }
      await supabase.from('settings').insert(defaults)
      setSettings(defaults)
    }
  }

  async function loadToday() {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase.from('daily_logs').select('*').eq('user_id', USER_ID).eq('date', today).single()
    if (data) {
      setTodayLog(data)
    } else {
      const newLog = { user_id: USER_ID, date: today, training_day: 'rest', water_ml: 0, meals: [] }
      await supabase.from('daily_logs').insert(newLog)
      setTodayLog(newLog)
    }
    loadStreak()
  }

  async function loadStreak() {
    const { data } = await supabase.from('daily_logs').select('date').eq('user_id', USER_ID).order('date', { ascending: false }).limit(30)
    if (!data) return
    let s = 0
    const today = new Date()
    for (let i = 0; i < data.length; i++) {
      const diff = Math.floor((today.getTime() - new Date(data[i].date).getTime()) / 86400000)
      if (diff === i) s++; else break
    }
    setStreak(s)
  }

  async function loadFarmCoins() {
    const { data } = await supabase.from('farm_state').select('training_coins, farm_coins').eq('user_id', USER_ID).single()
    if (data) setFarmCoins({ training: data.training_coins, farm: data.farm_coins })
  }

  async function loadMoments() {
    const { data } = await supabase.from('partner_moments')
      .select('*').eq('to_user_id', USER_ID).eq('read', false)
      .order('created_at', { ascending: false }).limit(5)
    setMoments(data || [])
  }

  async function dismissMoment(id: string) {
    await supabase.from('partner_moments').update({ read: true }).eq('id', id)
    setMoments(prev => prev.filter((m: any) => m.id !== id))
  }

  async function updateTodayLog(updates: any) {
    if (!todayLog) return
    const updated = { ...todayLog, ...updates }
    setTodayLog(updated)
    await supabase.from('daily_logs').upsert({ ...updated, user_id: USER_ID }, { onConflict: 'user_id,date' })
  }

  if (!settings || !todayLog) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16, background: '#0d1117' }}>
      <div style={{ fontSize: 40 }}>⚡</div>
      <div style={{ color: '#888', fontSize: 14 }}>Loading IronFuel...</div>
    </div>
  )

  return (
    <div style={{ paddingBottom: 80, minHeight: '100vh', background: '#0d1117' }}>

      {/* Header */}
      <div style={{ padding: '52px 20px 16px', borderBottom: '0.5px solid #1e2a3a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, color: '#ffffff' }}>IronFuel</div>
            <div style={{ fontSize: 12, color: '#556', marginTop: 2 }}>
              {new Date().toLocaleDateString('en-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            {streak > 0 && (
              <div style={{ fontSize: 13, color: 'var(--ac)', fontWeight: 700 }}>🔥 {streak} day streak</div>
            )}
            {farmCoins && (
              <div style={{ fontSize: 11, color: '#6aa84f' }}>🏅 {farmCoins.training} · 🌾 {farmCoins.farm}</div>
            )}
          </div>
        </div>

        {/* Franziska moment */}
        {moments.length > 0 && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(232,168,130,0.1)', border: '0.5px solid rgba(232,168,130,0.25)', borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' as const, color: '#e8a882', fontWeight: 700, marginBottom: 3 }}>💌 Franziska</div>
              <div style={{ fontSize: 13, color: '#ddd' }}>{moments[0].emoji} {moments[0].message}</div>
            </div>
            <button onClick={() => dismissMoment(moments[0].id)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 18, padding: '0 0 0 10px', cursor: 'pointer' }}>×</button>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '0 16px' }}>
        {tab === 'today'    && <TodayTab todayLog={todayLog} settings={settings} onUpdate={updateTodayLog} streak={streak} />}
        {tab === 'progress' && <ProgressTab settings={settings} />}
        {tab === 'farm'     && <FarmTab />}
        {tab === 'awards'   && <AchievementsTab />}
        {tab === 'settings' && <SettingsTab settings={settings} onUpdate={(u: any) => setSettings((s: any) => ({ ...s, ...u }))} />}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(13,17,23,0.95)', backdropFilter: 'blur(20px)',
        borderTop: '0.5px solid #1e2a3a',
        display: 'flex', padding: '10px 0 28px',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, background: 'none', border: 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 0',
            opacity: tab === t.id ? 1 : 0.3, transition: 'opacity 0.2s', cursor: 'pointer',
          }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 9, letterSpacing: '1px', textTransform: 'uppercase' as const, color: tab === t.id ? 'var(--ac)' : '#555', fontWeight: tab === t.id ? 700 : 400 }}>
              {t.label}
            </span>
            {t.id === 'farm' && farmCoins && farmCoins.training > 0 && (
              <div style={{ position: 'absolute', top: 8, width: 6, height: 6, borderRadius: '50%', background: 'var(--ac)' }} />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
