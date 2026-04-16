'use client'
import { useState, useEffect } from 'react'
import TodayTab from '@/components/TodayTab'
import ProgressTab from '@/components/ProgressTab'
import FoodsTab from '@/components/FoodsTab'
import SettingsTab from '@/components/SettingsTab'
import AchievementsTab from '@/components/AchievementsTab'
import { supabase, USER_ID } from '@/lib/supabase'

const TABS = [
  { id: 'today', label: 'Today', icon: '🍽️' },
  { id: 'progress', label: 'Progress', icon: '📈' },
  { id: 'foods', label: 'My Foods', icon: '🔍' },
  { id: 'achievements', label: 'Awards', icon: '🏆' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

export default function Home() {
  const [tab, setTab] = useState('today')
  const [settings, setSettings] = useState<any>(null)
  const [todayLog, setTodayLog] = useState<any>(null)
  const [streak, setStreak] = useState(0)
  const [moments, setMoments] = useState<any[]>([])

  useEffect(() => { loadSettings() }, [])
  useEffect(() => { if (settings) loadToday() }, [settings])
  useEffect(() => { loadMoments() }, [])

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
      const newLog = { user_id: USER_ID, date: today, meals: [], water_ml: 0, training_day: 'rest' }
      await supabase.from('daily_logs').insert(newLog)
      setTodayLog(newLog)
    }
    await calcStreak()
  }

  async function calcStreak() {
    const { data } = await supabase.from('daily_logs').select('date, meals').eq('user_id', USER_ID).order('date', { ascending: false }).limit(120)
    if (!data) return
    let s = 0
    const today = new Date()
    for (let i = 0; i < data.length; i++) {
      const d = new Date(data[i].date)
      const diff = Math.floor((today.getTime() - d.getTime()) / 86400000)
      if (diff === i && data[i].meals && data[i].meals.length > 0) s++
      else break
    }
    setStreak(s)
  }

  async function updateTodayLog(updates: any) {
    const today = new Date().toISOString().split('T')[0]
    const merged = { ...todayLog, ...updates }
    setTodayLog(merged)
    await supabase.from('daily_logs').upsert({ ...merged, user_id: USER_ID, date: today })
  }

  async function updateSettings(updates: any) {
    const merged = { ...settings, ...updates }
    setSettings(merged)
    await supabase.from('settings').upsert({ ...merged, user_id: USER_ID })
  }

  if (!settings || !todayLog) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 40 }}>⚡</div>
      <div style={{ color: 'var(--mu)', fontSize: 14 }}>Loading IronFuel...</div>
    </div>
  )

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 16px', borderBottom: '0.5px solid var(--b1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>IronFuel</div>
          <div style={{ fontSize: 12, color: 'var(--mu)', marginTop: 2 }}>
            {new Date().toLocaleDateString('en-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {streak > 0 && (
            <div style={{ fontSize: 13, color: 'var(--ac)', fontWeight: 600 }}>
              🔥 {streak} day streak
            </div>
          )}
          <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 2 }}>
            {settings.weight_start - settings.weight_target > 0
              ? `Goal: -${settings.weight_start - settings.weight_target}kg`
              : 'On track'}
          </div>
        </div>
      </div>

      {/* Franziska moment banner */}
      {moments.length > 0 && (
        <div style={{ margin: '0 16px', marginTop: 10, padding: '12px 16px', background: 'rgba(232,168,130,0.12)', border: '0.5px solid rgba(232,168,130,0.3)', borderRadius: 'var(--r)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' as const, color: '#e8a882', fontWeight: 600, marginBottom: 4 }}>💌 Nachricht von Franziska</div>
            <div style={{ fontSize: 14, color: 'var(--tx)' }}>{moments[0].emoji} {moments[0].message}</div>
          </div>
          <button onClick={() => dismissMoment(moments[0].id)} style={{ background: 'none', border: 'none', color: 'var(--mu)', fontSize: 20, padding: '0 0 0 12px', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* Tab content */}
      <div style={{ padding: '0 16px' }}>
        {tab === 'today' && <TodayTab todayLog={todayLog} settings={settings} onUpdate={updateTodayLog} streak={streak} />}
        {tab === 'progress' && <ProgressTab settings={settings} />}
        {tab === 'foods' && <FoodsTab />}
        {tab === 'achievements' && <AchievementsTab />}
        {tab === 'settings' && <SettingsTab settings={settings} onUpdate={updateSettings} />}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(15,15,15,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '0.5px solid var(--b1)',
        display: 'flex', padding: '8px 0 20px',
        zIndex: 100,
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, background: 'none', border: 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '6px 0',
            opacity: tab === t.id ? 1 : 0.4,
            transition: 'opacity 0.2s',
          }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 10, color: tab === t.id ? 'var(--ac)' : 'var(--mu)', fontWeight: tab === t.id ? 600 : 400 }}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
