'use client'
import { INGREDIENTS } from '@/lib/foods'

export default function IngredientSliders({ ings, vals, onChange }: {
  ings: { k: string; d: number }[]
  vals: Record<string, number>
  onChange: (v: Record<string, number>) => void
}) {
  if (!ings || ings.length === 0) return null

  function update(key: string, val: number) {
    onChange({ ...vals, [key]: val })
  }

  return (
    <div style={{ borderTop: '0.5px solid var(--b1)', paddingTop: 12, marginTop: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const, color: 'var(--mu)', marginBottom: 10 }}>
        Adjust amounts
      </div>
      {ings.map(ig => {
        const info = INGREDIENTS[ig.k]
        if (!info) return null
        const v = vals[ig.k] !== undefined ? vals[ig.k] : ig.d
        const kcal = Math.round(info.k * v)
        return (
          <div key={ig.k} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--mu)', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
              <span>{info.l}</span>
              <span style={{ color: 'var(--ac)', fontWeight: 500 }}>{kcal} kcal</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 36px', alignItems: 'center', gap: 8 }}>
              <input
                type="range"
                min={info.mn} max={info.mx} step={info.st} value={v}
                onChange={e => update(ig.k, +e.target.value)}
              />
              <input
                type="number"
                min={info.mn} max={info.mx} step={info.st} value={v}
                onChange={e => update(ig.k, +e.target.value)}
                style={{
                  padding: '4px 4px', fontSize: 12, fontWeight: 600,
                  border: '0.5px solid var(--b2)', borderRadius: 6,
                  background: 'var(--s2)', color: 'var(--tx)', textAlign: 'center', width: '100%'
                }}
              />
              <span style={{ fontSize: 10, color: 'var(--mu)' }}>{info.u}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
