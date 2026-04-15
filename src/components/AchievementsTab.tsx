'use client'
import { useState, useEffect } from 'react'
import { supabase, USER_ID } from '@/lib/supabase'
import { ACHIEVEMENTS } from '@/lib/foods'

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'nutrition', label: '🍽️ Nutrition' },
  { id: 'body', label: '⚖️ Body' },
  { id: 'run', label: '🏃 Running' },
  { id: 'ride', label: '🚴 Cycling' },
  { id: 'consistency', label: '✅ Consistency' },
  { id: 'ironman', label: '🔱 Ironman' },
]

export default function AchievementsTab() {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set())
  const [cat, setCat] = useState('all')

  useEffect(() => {
    supabase.from('achievements').select('achievement_key').eq('user_id', USER_ID)
      .then(({ data }) => {
        if (data) setUnlocked(new Set(data.map((d: any) => d.achievement_key)))
      })
  }, [])

  async function manualUnlock(key: string) {
    if (unlocked.has(key)) return
    await supabase.from('achievements').insert({ user_id: USER_ID, achievement_key: key })
    setUnlocked(prev => new Set([...prev, key]))
  }

  const filtered = cat === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter(a => a.category === cat)
  const unlockedCount = ACHIEVEMENTS.filter(a => unlocked.has(a.key)).length

  return (
    <div style={{ paddingTop: 20 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--mu)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Unlocked</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--ac)' }}>{unlockedCount}</div>
          <div style={{ fontSize: 11, color: 'var(--mu)' }}>of {ACHIEVEMENTS.length}</div>
        </div>
        <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--mu)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Progress</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--warn)' }}>{Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%</div>
          <div style={{ fontSize: 11, color: 'var(--mu)' }}>complete</div>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} style={{
            padding: '6px 12px', whiteSpace: 'nowrap' as const, fontSize: 12, fontWeight: 500,
            border: `0.5px solid ${cat === c.id ? 'var(--ac)' : 'var(--b2)'}`,
            borderRadius: 20, background: cat === c.id ? 'var(--ac2)' : 'transparent',
            color: cat === c.id ? 'var(--ac)' : 'var(--mu)', cursor: 'pointer',
          }}>{c.label}</button>
        ))}
      </div>

      {/* Achievements grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(a => {
          const isUnlocked = unlocked.has(a.key)
          const isIronman = a.key === 'ironman_finish'
          return (
            <div key={a.key} onClick={() => manualUnlock(a.key)} style={{
              background: isUnlocked ? (isIronman ? 'rgba(200,240,80,0.08)' : 'var(--s1)') : 'var(--s1)',
              border: `0.5px solid ${isUnlocked ? (isIronman ? 'var(--ac)' : 'var(--b2)') : 'var(--b1)'}`,
              borderRadius: 'var(--r)', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 14,
              opacity: isUnlocked ? 1 : 0.45,
              cursor: isUnlocked ? 'default' : 'pointer',
              transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: isIronman ? 32 : 24, flexShrink: 0, filter: isUnlocked ? 'none' : 'grayscale(1)' }}>
                {a.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: isUnlocked ? (isIronman ? 'var(--ac)' : 'var(--tx)') : 'var(--mu)', marginBottom: 2 }}>
                  {a.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--mu)', lineHeight: 1.4 }}>{a.desc}</div>
                {isUnlocked && (
                  <div style={{ fontSize: 10, color: 'var(--ac)', marginTop: 4, fontWeight: 600 }}>✓ UNLOCKED</div>
                )}
                {!isUnlocked && (
                  <div style={{ fontSize: 10, color: 'var(--mu)', marginTop: 4 }}>Tap to unlock manually</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ height: 24 }} />
    </div>
  )
}
