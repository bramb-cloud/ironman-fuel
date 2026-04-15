'use client'
import { useState, useCallback } from 'react'
import { TRAINING_TARGETS, BREAKFASTS, LUNCHES, SNACKS, FIXED_DINNERS, SUGGESTED_DINNERS, INGREDIENTS, calcMacros } from '@/lib/foods'
import IngredientSliders from './IngredientSliders'

const S = {
  sec: { marginTop: 22 } as any,
  stitle: { fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const, color: 'var(--mu)', marginBottom: 8, padding: '0 2px' },
  card: { background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 14, marginTop: 8 } as any,
  select: { width: '100%', padding: '13px 40px 13px 14px', fontSize: 14, border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', background: 'var(--s1)', color: 'var(--tx)' } as any,
  pill: { fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'var(--s2)', color: 'var(--mu)', border: '0.5px solid var(--b1)' } as any,
  mbtn: (on: boolean) => ({ flex: 1, padding: 11, fontSize: 13, fontWeight: 500, border: `0.5px solid ${on ? 'var(--ac)' : 'var(--b2)'}`, borderRadius: 'var(--rs)', background: on ? 'var(--ac2)' : 'transparent', color: on ? 'var(--ac)' : 'var(--mu)', cursor: 'pointer' }) as any,
}

function MacroBar({ label, current, target, color }: any) {
  const pct = Math.min(Math.round((current / target) * 100), 100)
  const over = current > target
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--mu)', marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ color: over ? 'var(--danger)' : 'var(--tx)', fontWeight: 500 }}>{current}g / {target}g</span>
      </div>
      <div style={{ height: 6, background: 'var(--s2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: 6, width: `${pct}%`, background: over ? 'var(--danger)' : color, borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

export default function TodayTab({ todayLog, settings, onUpdate, streak }: any) {
  const [dinnerMode, setDinnerMode] = useState<'know' | 'suggest'>('know')
  const [bfIdx, setBfIdx] = useState(0)
  const [lnIdx, setLnIdx] = useState(0)
  const [snIdx, setSnIdx] = useState(0)
  const [dnIdx, setDnIdx] = useState<number | null>(null)
  const [sugDnIdx, setSugDnIdx] = useState<number | null>(null)
  const [bfVals, setBfVals] = useState<Record<string, number>>({})
  const [lnVals, setLnVals] = useState<Record<string, number>>({})
  const [snVals, setSnVals] = useState<Record<string, number>>({})
  const [dnVals, setDnVals] = useState<Record<string, number>>({})
  const [extras, setExtras] = useState<any[]>([])
  const [showExtraMenu, setShowExtraMenu] = useState(false)

  const training = TRAINING_TARGETS[todayLog.training_day || 'rest']
  const target = settings[`kcal_${todayLog.training_day || 'rest'}`] || training.kcal

  const bf = BREAKFASTS[bfIdx]
  const ln = LUNCHES[lnIdx]
  const sn = SNACKS[snIdx]

  function getMacros(items: any, vals: Record<string, number>) {
      if (!items) return { kcal: 0, p: 0, c: 0, f: 0 }
      if (items.fixed) return items.fixed
      const ings = items.ings || (Array.isArray(items) ? items : [])
      if (!ings.length) return { kcal: 0, p: 0, c: 0, f: 0 }
      return calcMacros(ings, vals)
    }

  const bfM = getMacros(bf.ings, bfVals)
  const lnM = ln.fixed ? ln.fixed : getMacros(ln.ings || [], lnVals)
  const snM = getMacros(sn.ings, snVals)

  let dnDef: any = null
  if (dinnerMode === 'know' && dnIdx !== null) dnDef = FIXED_DINNERS[dnIdx]
  if (dinnerMode === 'suggest' && sugDnIdx !== null) dnDef = SUGGESTED_DINNERS[sugDnIdx]
  const dnM = dnDef ? getMacros(dnDef.ings, dnVals) : { kcal: 0, p: 0, c: 0, f: 0 }

  const extraTotal = extras.reduce((a: any, e: any) => ({
    kcal: a.kcal + e.kcal, p: a.p + e.p, c: a.c + e.c, f: a.f + e.f
  }), { kcal: 0, p: 0, c: 0, f: 0 })

  const total = {
    kcal: bfM.kcal + lnM.kcal + snM.kcal + dnM.kcal + extraTotal.kcal,
    p: Math.round((bfM.p + lnM.p + snM.p + dnM.p + extraTotal.p) * 10) / 10,
    c: Math.round((bfM.c + lnM.c + snM.c + dnM.c + extraTotal.c) * 10) / 10,
    f: Math.round((bfM.f + lnM.f + snM.f + dnM.f + extraTotal.f) * 10) / 10,
  }

  const diff = total.kcal - target
  const pct = Math.min(Math.round((total.kcal / target) * 100), 100)

  let statusColor = 'var(--mu)'
  let statusMsg = 'Pick dinner to see full day total'
  if (dnDef) {
    if (diff < -300) { statusColor = 'var(--warn)'; statusMsg = `${Math.abs(diff)} kcal under — Gilbert's fatigue risk` }
    else if (diff < 0) { statusColor = 'var(--good)'; statusMsg = `${Math.abs(diff)} kcal under target — good deficit ✓` }
    else if (diff <= 150) { statusColor = 'var(--warn)'; statusMsg = `${diff} kcal over target — acceptable` }
    else { statusColor = 'var(--danger)'; statusMsg = `${diff} kcal over target — swap something` }
  }

  function addExtra(item: any) {
    const m = calcMacros(item.ings, {})
    setExtras(prev => [...prev, { name: item.name, ...m, id: Date.now() }])
    setShowExtraMenu(false)
  }

  function removeExtra(id: number) {
    setExtras(prev => prev.filter((e: any) => e.id !== id))
  }

  const allFoods = [...BREAKFASTS, ...LUNCHES.filter((l: any) => !l.fixed), ...SNACKS, ...FIXED_DINNERS, ...SUGGESTED_DINNERS]

  const preFuelWarning = ['ride', 'run', 'longride'].includes(todayLog.training_day) && lnM.c < 40

  return (
    <div>
      {/* Training day selector */}
      <div style={S.sec}>
        <div style={S.stitle}>Training Day</div>
        <select style={S.select} value={todayLog.training_day || 'rest'} onChange={e => onUpdate({ training_day: e.target.value })}>
          <option value="rest">🛋️ Rest day — {settings.kcal_rest} kcal</option>
          <option value="strength">🏋️ Strength session — {settings.kcal_strength} kcal</option>
          <option value="ride">🚴 Zone 2 ride — {settings.kcal_ride} kcal</option>
          <option value="run">🏃 Zone 2 run — {settings.kcal_run} kcal</option>
          <option value="longride">🚴 Long ride (Sat) — {settings.kcal_longride} kcal</option>
        </select>

        {/* Training tip */}
        <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--s1)', borderRadius: 'var(--rs)', border: '0.5px solid var(--b1)', fontSize: 12, color: 'var(--mu2)', lineHeight: 1.5 }}>
          <span style={{ color: training.color, fontWeight: 600 }}>{training.label} · </span>
          {training.tip}
        </div>

        {preFuelWarning && (
          <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--warn2)', borderRadius: 'var(--rs)', border: '0.5px solid var(--warn)', fontSize: 12, color: 'var(--warn)' }}>
            ⚠️ Low carbs at lunch on a training day — make sure you eat something before the session.
          </div>
        )}
      </div>

      {/* Macro targets */}
      <div style={{ ...S.sec, ...S.card }}>
        <div style={{ fontSize: 11, color: 'var(--mu)', marginBottom: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Macro Targets</div>
        <MacroBar label="Protein" current={total.p} target={training.protein} color="var(--ac)" />
        <MacroBar label="Carbs" current={total.c} target={training.carbs} color="var(--warn)" />
        <MacroBar label="Fat" current={total.f} target={training.fat} color="var(--purple)" />
      </div>

      {/* Water tracker */}
      <div style={{ ...S.sec, ...S.card }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--mu)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Water</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: (todayLog.water_ml || 0) >= (settings.water_target_ml || 2500) ? 'var(--good)' : 'var(--tx)' }}>
            {((todayLog.water_ml || 0) / 1000).toFixed(1)}L / {((settings.water_target_ml || 2500) / 1000).toFixed(1)}L
          </div>
        </div>
        <div style={{ height: 6, background: 'var(--s2)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ height: 6, width: `${Math.min(100, ((todayLog.water_ml || 0) / (settings.water_target_ml || 2500)) * 100)}%`, background: 'var(--blue)', borderRadius: 3, transition: 'width 0.4s' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[250, 500, 750].map(ml => (
            <button key={ml} onClick={() => onUpdate({ water_ml: (todayLog.water_ml || 0) + ml })} style={{
              flex: 1, padding: '9px 0', background: 'var(--s2)', border: '0.5px solid var(--b2)',
              borderRadius: 'var(--rs)', color: 'var(--blue)', fontSize: 13, fontWeight: 500
            }}>+{ml}ml</button>
          ))}
          <button onClick={() => onUpdate({ water_ml: 0 })} style={{
            padding: '9px 12px', background: 'transparent', border: '0.5px solid var(--b1)',
            borderRadius: 'var(--rs)', color: 'var(--mu)', fontSize: 12
          }}>Reset</button>
        </div>
      </div>

      {/* Breakfast */}
      <div style={S.sec}>
        <div style={S.stitle}>Breakfast</div>
        <select style={S.select} value={bfIdx} onChange={e => { setBfIdx(+e.target.value); setBfVals({}) }}>
          {BREAKFASTS.map((b, i) => <option key={i} value={i}>{b.name}</option>)}
        </select>
        <div style={S.card}>
          <MealCard name={bf.name} macros={bfM} />
          <IngredientSliders ings={bf.ings} vals={bfVals} onChange={setBfVals} />
        </div>
      </div>

      {/* Lunch */}
      <div style={S.sec}>
        <div style={S.stitle}>Lunch</div>
        <select style={S.select} value={lnIdx} onChange={e => { setLnIdx(+e.target.value); setLnVals({}) }}>
          {LUNCHES.map((l: any, i) => <option key={i} value={i}>{l.name}</option>)}
        </select>
        <div style={S.card}>
          <MealCard name={ln.name} macros={lnM} />
          {!ln.fixed && <IngredientSliders ings={ln.ings || []} vals={lnVals} onChange={setLnVals} />}
          {ln.fixed && <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 8 }}>{ln.fixed.note || ''}</div>}
        </div>
      </div>

      {/* Snack */}
      <div style={S.sec}>
        <div style={S.stitle}>Afternoon Snack</div>
        <select style={S.select} value={snIdx} onChange={e => { setSnIdx(+e.target.value); setSnVals({}) }}>
          {SNACKS.map((s, i) => <option key={i} value={i}>{s.name}</option>)}
        </select>
        <div style={S.card}>
          <MealCard name={sn.name} macros={snM} />
          <IngredientSliders ings={sn.ings} vals={snVals} onChange={setSnVals} />
        </div>
      </div>

      {/* Dinner */}
      <div style={S.sec}>
        <div style={S.stitle}>Dinner</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button style={S.mbtn(dinnerMode === 'know')} onClick={() => setDinnerMode('know')}>I know what I'm having</button>
          <button style={S.mbtn(dinnerMode === 'suggest')} onClick={() => setDinnerMode('suggest')}>Suggest me something</button>
        </div>

        {dinnerMode === 'know' && (
          <select style={S.select} value={dnIdx ?? ''} onChange={e => { setDnIdx(+e.target.value); setDnVals({}) }}>
            <option value="">— pick your dinner —</option>
            {FIXED_DINNERS.map((d, i) => <option key={i} value={i}>{d.name}</option>)}
          </select>
        )}

        {dinnerMode === 'suggest' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, maxHeight: 260, overflowY: 'auto', marginBottom: 8 }}>
            {SUGGESTED_DINNERS.map((d, i) => {
              const m = calcMacros(d.ings, {})
              return (
                <div key={i} onClick={() => { setSugDnIdx(i); setDnVals({}) }} style={{
                  padding: '9px 11px', border: `0.5px solid ${sugDnIdx === i ? 'var(--ac)' : 'var(--b1)'}`,
                  borderRadius: 'var(--rs)', cursor: 'pointer', background: sugDnIdx === i ? 'var(--ac2)' : 'var(--s1)',
                  transition: 'all 0.15s',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3 }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--mu)', marginTop: 2 }}>~{m.kcal} kcal · P {m.p}g</div>
                </div>
              )
            })}
          </div>
        )}

        {dnDef && (
          <div style={S.card}>
            <MealCard name={dnDef.name} macros={dnM} tip={dnDef.tip} large />
            <IngredientSliders ings={dnDef.ings} vals={dnVals} onChange={setDnVals} />
          </div>
        )}
      </div>

      {/* Extras */}
      <div style={S.sec}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={S.stitle}>Extras</div>
          <button onClick={() => setShowExtraMenu(!showExtraMenu)} style={{
            padding: '5px 12px', background: 'var(--ac2)', border: '0.5px solid var(--ac)',
            borderRadius: 'var(--rb)', color: 'var(--ac)', fontSize: 12, fontWeight: 600
          }}>+ Add</button>
        </div>

        {showExtraMenu && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, maxHeight: 260, overflowY: 'auto', marginBottom: 8 }}>
            {allFoods.map((item: any, i) => {
              const m = item.ings ? calcMacros(item.ings, {}) : item.fixed || { kcal: 0 }
              return (
                <div key={i} onClick={() => addExtra(item)} style={{
                  padding: '9px 11px', border: '0.5px solid var(--b1)', borderRadius: 'var(--rs)',
                  cursor: 'pointer', background: 'var(--s1)',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.3 }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--mu)', marginTop: 2 }}>~{m.kcal} kcal</div>
                </div>
              )
            })}
          </div>
        )}

        {extras.map((e: any) => (
          <div key={e.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{e.name}</div>
              <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 2 }}>{e.kcal} kcal · P {e.p}g · C {e.c}g · F {e.f}g</div>
            </div>
            <button onClick={() => removeExtra(e.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: 18, padding: 4 }}>×</button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{ ...S.sec, ...S.card }}>
        <div style={{ fontSize: 10, color: 'var(--mu)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Daily Summary</div>
        {[
          { label: 'Breakfast', kcal: bfM.kcal },
          { label: 'Lunch', kcal: lnM.kcal },
          { label: 'Snack', kcal: snM.kcal },
          { label: 'Dinner', kcal: dnM.kcal },
          ...(extras.length ? [{ label: `Extras (${extras.length})`, kcal: extraTotal.kcal }] : []),
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: 'var(--mu)' }}>
            <span>{row.label}</span>
            <span style={{ color: 'var(--tx)', fontWeight: 500 }}>{row.kcal} kcal</span>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, borderTop: '0.5px solid var(--b1)', paddingTop: 10, marginTop: 4 }}>
          <span>Total</span>
          <span style={{ color: 'var(--ac)' }}>{total.kcal} / {target} kcal</span>
        </div>

        <div style={{ height: 5, background: 'var(--s2)', borderRadius: 3, marginTop: 12, overflow: 'hidden' }}>
          <div style={{ height: 5, width: `${pct}%`, background: statusColor, borderRadius: 3, transition: 'width 0.4s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--mu)', marginTop: 3 }}>
          <span>0</span><span>{target} kcal</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
          {[
            { label: 'Protein', val: `${total.p}g`, color: 'var(--ac)' },
            { label: 'Carbs', val: `${total.c}g`, color: 'var(--warn)' },
            { label: 'Fat', val: `${total.f}g`, color: 'var(--purple)' },
          ].map(m => (
            <div key={m.label} style={{ background: 'var(--s2)', borderRadius: 'var(--rs)', padding: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'var(--mu)', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.val}</div>
            </div>
          ))}
        </div>

        {dnDef && (
          <div style={{ marginTop: 12, padding: '9px 12px', borderRadius: 'var(--rs)', background: statusColor === 'var(--good)' ? 'var(--good2)' : statusColor === 'var(--danger)' ? 'var(--danger2)' : statusColor === 'var(--warn)' ? 'var(--warn2)' : 'var(--s2)', fontSize: 12, fontWeight: 500, color: statusColor, textAlign: 'center' }}>
            {statusMsg}
          </div>
        )}

        {/* Save day button */}
        <button onClick={() => onUpdate({ meals: [{ bf: bfM, ln: lnM, sn: snM, dn: dnM, extras: extraTotal, total }] })} style={{
          width: '100%', marginTop: 14, padding: 12, background: 'var(--ac2)', border: '0.5px solid var(--ac)',
          borderRadius: 'var(--rs)', color: 'var(--ac)', fontSize: 14, fontWeight: 600
        }}>
          Save Today's Log ✓
        </button>
      </div>

      <div style={{ height: 24 }} />
    </div>
  )
}

function MealCard({ name, macros, tip, large }: any) {
  return (
    <div>
      <div style={{ fontSize: large ? 15 : 14, fontWeight: 600, marginBottom: 4 }}>{name}</div>
      {large && <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ac)', margin: '6px 0 2px', letterSpacing: -1 }}>{macros.kcal} kcal</div>}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
        {!large && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)', marginRight: 4 }}>{macros.kcal} kcal</span>}
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--s2)', color: 'var(--mu)' }}>P {macros.p}g</span>
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--s2)', color: 'var(--mu)' }}>C {macros.c}g</span>
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--s2)', color: 'var(--mu)' }}>F {macros.f}g</span>
      </div>
      {tip && <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 6, fontStyle: 'italic' }}>{tip}</div>}
    </div>
  )
}
