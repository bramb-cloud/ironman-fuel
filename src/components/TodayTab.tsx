'use client'
import { useState, useEffect } from 'react'
import { TRAINING_TARGETS, INGREDIENTS, BREAKFASTS, LUNCHES, SNACKS, FIXED_DINNERS, SUGGESTED_DINNERS } from '@/lib/foods'
import { supabase, USER_ID } from '@/lib/supabase'

const S = {
  sec: { marginTop: 22 } as any,
  stitle: { fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const, color: 'var(--mu)', marginBottom: 8, padding: '0 2px' },
  card: { background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 14, marginTop: 10 } as any,
  select: { width: '100%', padding: '13px 40px 13px 14px', fontSize: 14, border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', background: 'var(--s2)', color: 'var(--tx)' } as any,
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
        <div style={{ height: 6, width: pct+'%', background: over ? 'var(--danger)' : color, borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

function MealItem({ item, onRemove, onQtyChange }: any) {
  const [qty, setQty] = useState(item.qty || (item.isUnit ? 1 : 100))
  const kcal = item.isUnit ? Math.round(item.kcalPer * qty) : Math.round(item.kcalPer * qty / 100)
  function handleQty(v: number) { setQty(v); onQtyChange(item.id, v) }
  return (
    <div style={{ background: 'var(--s2)', borderRadius: 'var(--rs)', padding: '10px 12px', marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
        <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: 20, padding: '0 4px', cursor: 'pointer' }}>×</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 36px 52px', alignItems: 'center', gap: 8 }}>
        <input type="range"
          min={item.isUnit ? 1 : 10}
          max={item.isUnit ? (item.isFixedMeal ? 2 : 20) : 500}
          step={item.isUnit ? 1 : 10}
          value={qty} onChange={e => handleQty(+e.target.value)} />
        <input type="number" value={qty}
          min={item.isUnit ? 1 : 10}
          max={item.isUnit ? (item.isFixedMeal ? 2 : 20) : 500}
          step={item.isUnit ? 1 : 10}
          onChange={e => handleQty(+e.target.value)}
          style={{ padding: '4px', fontSize: 12, fontWeight: 600, border: '0.5px solid var(--b2)', borderRadius: 6, background: 'var(--s1)', color: 'var(--tx)', textAlign: 'center', width: '100%' }} />
        <span style={{ fontSize: 10, color: 'var(--mu)' }}>{item.unit}</span>
        <span style={{ fontSize: 11, color: 'var(--ac)', textAlign: 'right' }}>{kcal} kcal</span>
      </div>
      <div style={{ fontSize: 10, color: 'var(--mu)', marginTop: 4 }}>
        {item.isUnit
          ? `P ${Math.round(item.pPer * qty * 10)/10}g · C ${Math.round(item.cPer * qty * 10)/10}g · F ${Math.round(item.fPer * qty * 10)/10}g`
          : `P ${Math.round(item.pPer * qty / 100 * 10)/10}g · C ${Math.round(item.cPer * qty / 100 * 10)/10}g · F ${Math.round(item.fPer * qty / 100 * 10)/10}g`
        }
      </div>
    </div>
  )
}

function MealSection({ title, items, onAdd, onRemove, onQtyChange, foodOptions, macros }: any) {
  const [showPicker, setShowPicker] = useState(false)
  const [search, setSearch] = useState('')
  const filtered = foodOptions.filter((f: any) => f.name.toLowerCase().includes(search.toLowerCase()))
  return (
    <div style={S.sec}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={S.stitle}>{title}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {macros.kcal > 0 && <span style={{ fontSize: 11, color: 'var(--mu)' }}>{macros.kcal} kcal</span>}
          <button onClick={() => setShowPicker(!showPicker)} style={{
            padding: '4px 12px', background: showPicker ? 'var(--s2)' : 'var(--ac2)',
            border: '0.5px solid ' + (showPicker ? 'var(--b2)' : 'var(--ac)'),
            borderRadius: 20, color: showPicker ? 'var(--mu)' : 'var(--ac)', fontSize: 12, fontWeight: 600, cursor: 'pointer'
          }}>{showPicker ? 'Close' : '+ Add'}</button>
        </div>
      </div>
      {showPicker && (
        <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', padding: 12, marginBottom: 10 }}>
          <input placeholder="Search food..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...S.select, marginBottom: 10, padding: '10px 14px' }} autoFocus />
          <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.length === 0 && <div style={{ fontSize: 12, color: 'var(--mu)', padding: 8 }}>No results</div>}
            {filtered.map((f: any) => (
              <div key={f.id} onClick={() => { onAdd(f); setShowPicker(false); setSearch('') }}
                style={{ padding: '9px 12px', background: 'var(--s2)', borderRadius: 'var(--rs)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 2 }}>
                    {f.isUnit ? f.kcalPer+' kcal/pc' : f.kcalPer+' kcal/100g'}
                    {f.isCustom && <span style={{ color: 'var(--blue)', marginLeft: 6 }}>custom</span>}
                  </div>
                </div>
                <span style={{ color: 'var(--ac)', fontSize: 20 }}>+</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {items.length === 0 && !showPicker && (
        <div style={{ color: 'var(--mu)', fontSize: 12, textAlign: 'center', padding: '14px', background: 'var(--s1)', borderRadius: 'var(--rs)', border: '0.5px solid var(--b1)' }}>
          Nothing added yet — tap + Add
        </div>
      )}
      {items.map((item: any) => (
        <MealItem key={item.id} item={item} onRemove={onRemove} onQtyChange={onQtyChange} />
      ))}
    </div>
  )
}

function sumMacros(items: any[]) {
  return items.reduce((acc, item) => {
    // Unit items (pcs, bars, slices etc): kcalPer is per unit, qty is count → multiply directly
    // Gram items: kcalPer is per 100g, qty is grams → divide by 100
    const r = item.isUnit ? item.qty : item.qty / 100
    return {
      kcal: acc.kcal + Math.round(item.kcalPer * r),
      p: Math.round((acc.p + item.pPer * r) * 10) / 10,
      c: Math.round((acc.c + item.cPer * r) * 10) / 10,
      f: Math.round((acc.f + item.fPer * r) * 10) / 10,
    }
  }, { kcal: 0, p: 0, c: 0, f: 0 })
}

const MEALS = ['breakfast', 'lunch', 'snack', 'dinner', 'extras'] as const
type MealKey = typeof MEALS[number]

export default function TodayTab({ todayLog, settings, onUpdate, streak }: any) {
  const [mealItems, setMealItems] = useState<Record<MealKey, any[]>>({
    breakfast: [], lunch: [], snack: [], dinner: [], extras: []
  })
  const [foodOptions, setFoodOptions] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle'|'saving'|'saved'>('idle')

  const training = TRAINING_TARGETS[todayLog.training_day || 'rest']
  const target = settings['kcal_'+(todayLog.training_day||'rest')] || training.kcal

  useEffect(() => {
    loadMealsFromDB()
    buildFoodOptions()
  }, [])

  async function loadMealsFromDB() {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('daily_logs')
      .select('meal_items')
      .eq('user_id', USER_ID)
      .eq('date', today)
      .single()
    if (data?.meal_items) {
      try {
        const saved = typeof data.meal_items === 'string'
          ? JSON.parse(data.meal_items)
          : data.meal_items
        if (saved && typeof saved === 'object') {
          setMealItems({ breakfast: [], lunch: [], snack: [], dinner: [], extras: [], ...saved })
        }
      } catch (e) {}
    }
    setLoaded(true)
  }

  async function buildFoodOptions() {
    // Individual ingredients
    const builtin = Object.entries(INGREDIENTS).map(([key, info]) => ({
      id: 'builtin_'+key, name: info.l,
      kcalPer: info.isU ? info.k : info.k * 100,
      pPer: info.isU ? info.p : info.p * 100,
      cPer: info.isU ? info.c : info.c * 100,
      fPer: info.isU ? info.f : info.f * 100,
      unit: info.u, isUnit: !!info.isU,
      defaultQty: info.isU ? Math.max(1, info.mn) : 100,
      isCustom: false,
    }))

    // Fixed meal combos — show as single searchable items with fixed macros
    const fixedMeals: any[] = []
    const allMealLists = [
      ...BREAKFASTS.map((m: any) => ({ ...m, cat: '🍳 Frühstück' })),
      ...LUNCHES.map((m: any) => ({ ...m, cat: '🥗 Mittagessen' })),
      ...SNACKS.map((m: any) => ({ ...m, cat: '🍫 Snack' })),
      ...FIXED_DINNERS.map((m: any) => ({ ...m, cat: '🍽️ Abendessen' })),
      ...SUGGESTED_DINNERS.map((m: any) => ({ ...m, cat: '🍽️ Abendessen' })),
    ]

    allMealLists.forEach((meal: any, i: number) => {
      // Calculate total macros for this meal at default quantities
      let kcal = 0, p = 0, c = 0, f = 0
      if (meal.fixed) {
        kcal = meal.fixed.kcal; p = meal.fixed.p; c = meal.fixed.c; f = meal.fixed.f
      } else if (meal.ings && meal.ings.length > 0) {
        meal.ings.forEach((ing: any) => {
          const info = INGREDIENTS[ing.k]
          if (!info) return
          const qty = ing.d
          const r = info.isU ? qty : qty / 100
          kcal += Math.round(info.k * (info.isU ? qty : qty * 100) / 100)
          p += info.p * (info.isU ? qty : qty)
          c += info.c * (info.isU ? qty : qty)
          f += info.f * (info.isU ? qty : qty)
        })
        // Recalculate properly
        kcal = 0; p = 0; c = 0; f = 0
        meal.ings.forEach((ing: any) => {
          const info = INGREDIENTS[ing.k]
          if (!info) return
          const r = info.isU ? ing.d : ing.d / 100
          kcal += info.k * (info.isU ? ing.d : ing.d)
          p += info.p * (info.isU ? ing.d : ing.d)
          c += info.c * (info.isU ? ing.d : ing.d)
          f += info.f * (info.isU ? ing.d : ing.d)
        })
      }
      if (kcal > 0 || meal.fixed) {
        fixedMeals.push({
          id: `meal_${i}_${meal.name}`,
          name: `${meal.cat}: ${meal.name}`,
          kcalPer: Math.round(kcal) || (meal.fixed?.kcal || 0),
          pPer: Math.round(p * 10) / 10 || (meal.fixed?.p || 0),
          cPer: Math.round(c * 10) / 10 || (meal.fixed?.c || 0),
          fPer: Math.round(f * 10) / 10 || (meal.fixed?.f || 0),
          unit: 'portion', isUnit: true, defaultQty: 1, isCustom: false, isFixedMeal: true,
        })
      }
    })

    const { data: custom } = await supabase.from('custom_foods').select('*').eq('user_id', USER_ID)
    const customFoods = (custom || []).map((f: any) => ({
      id: 'custom_'+f.id, name: f.name,
      kcalPer: f.kcal_per_100g, pPer: f.protein_per_100g, cPer: f.carbs_per_100g, fPer: f.fat_per_100g,
      unit: 'g', isUnit: false, defaultQty: 100, isCustom: true,
    }))

    setFoodOptions([...customFoods, ...fixedMeals, ...builtin])
  }

  async function persistMeals(items: Record<MealKey, any[]>) {
    const today = new Date().toISOString().split('T')[0]
    const totals = Object.fromEntries(
      MEALS.map(m => [m, sumMacros(items[m])])
    )
    const total = MEALS.reduce((acc, m) => ({
      kcal: acc.kcal + totals[m].kcal,
      p: Math.round((acc.p + totals[m].p) * 10) / 10,
      c: Math.round((acc.c + totals[m].c) * 10) / 10,
      f: Math.round((acc.f + totals[m].f) * 10) / 10,
    }), { kcal: 0, p: 0, c: 0, f: 0 })

    const { error } = await supabase.from('daily_logs').upsert({
      user_id: USER_ID,
      date: today,
      training_day: todayLog.training_day || 'rest',
      water_ml: todayLog.water_ml || 0,
      meal_items: JSON.stringify(items),
      meals: [{ ...totals, total }],
    }, { onConflict: 'user_id,date' })
    if (error) {
      console.error('Save error:', error)
      alert('Opslaan mislukt: ' + error.message)
      setSaveStatus('idle')
      return
    }
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  function addItem(meal: MealKey, food: any) {
    const item = {
      id: food.id+'_'+Date.now(), name: food.name,
      kcalPer: food.kcalPer, pPer: food.pPer, cPer: food.cPer, fPer: food.fPer,
      unit: food.unit, isUnit: food.isUnit, qty: food.defaultQty || 100,
    }
    setMealItems(prev => ({ ...prev, [meal]: [...prev[meal], item] }))
  }

  function removeItem(meal: MealKey, id: string) {
    setMealItems(prev => ({ ...prev, [meal]: prev[meal].filter((i: any) => i.id !== id) }))
  }

  function updateQty(meal: MealKey, id: string, qty: number) {
    setMealItems(prev => ({ ...prev, [meal]: prev[meal].map((i: any) => i.id === id ? { ...i, qty } : i) }))
  }

  const macros = Object.fromEntries(MEALS.map(m => [m, sumMacros(mealItems[m])])) as Record<MealKey, any>
  const total = MEALS.reduce((acc, m) => ({
    kcal: acc.kcal + macros[m].kcal,
    p: Math.round((acc.p + macros[m].p) * 10) / 10,
    c: Math.round((acc.c + macros[m].c) * 10) / 10,
    f: Math.round((acc.f + macros[m].f) * 10) / 10,
  }), { kcal: 0, p: 0, c: 0, f: 0 })

  const diff = total.kcal - target
  const pct = Math.min(Math.round((total.kcal / target) * 100), 100)
  const hasAny = MEALS.some(m => mealItems[m].length > 0)
  const preFuelWarning = ['ride','run','longride'].includes(todayLog.training_day) && macros.lunch.c < 40 && mealItems.lunch.length > 0

  let statusColor = 'var(--mu)', statusMsg = 'Add meals to see your daily total'
  if (hasAny) {
    if (diff < -300) { statusColor='var(--warn)'; statusMsg=Math.abs(diff)+' kcal under — Gilberts fatigue risk' }
    else if (diff < 0) { statusColor='var(--good)'; statusMsg=Math.abs(diff)+' kcal under target — good deficit ✓' }
    else if (diff <= 150) { statusColor='var(--warn)'; statusMsg=diff+' kcal over target — acceptable' }
    else { statusColor='var(--danger)'; statusMsg=diff+' kcal over target — swap something' }
  }

  const MEAL_LABELS: Record<MealKey, string> = {
    breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snack', dinner: 'Dinner', extras: 'Extras'
  }

  return (
    <div style={{ paddingTop: 8 }}>
      {/* Save indicator */}
      {saveStatus !== 'idle' && (
        <div style={{
          position: 'fixed', top: 56, right: 16, zIndex: 200,
          padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
          background: saveStatus === 'saved' ? 'var(--good)' : 'var(--s2)',
          color: saveStatus === 'saved' ? '#000' : 'var(--mu)',
          border: '0.5px solid ' + (saveStatus === 'saved' ? 'var(--good)' : 'var(--b2)'),
        }}>
          {saveStatus === 'saving' ? '...' : '✓ Saved'}
        </div>
      )}

      {/* Kcal ring + training day */}
      <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 16, marginTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: -2, color: total.kcal > target ? 'var(--danger)' : 'var(--ac)', lineHeight: 1 }}>
              {total.kcal}
            </div>
            <div style={{ fontSize: 12, color: 'var(--mu)', marginTop: 3 }}>/ {target} kcal today</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--mu)', marginBottom: 4 }}>
              {total.kcal < target * 0.8 ? `${target - total.kcal} kcal to go` : total.kcal > target ? `${total.kcal - target} over` : '✓ On target'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ l: 'P', v: total.p, c: 'var(--ac)' }, { l: 'C', v: total.c, c: 'var(--warn)' }, { l: 'F', v: total.f, c: 'var(--purple)' }].map(m => (
                <div key={m.l} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: m.c }}>{Math.round(m.v)}</div>
                  <div style={{ fontSize: 9, color: 'var(--mu)' }}>{m.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Kcal bar */}
        <div style={{ height: 6, background: 'var(--s3)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ height: 6, width: `${Math.min(100, (total.kcal / target) * 100)}%`, background: total.kcal > target ? 'var(--danger)' : 'var(--ac)', borderRadius: 3, transition: 'width 0.4s' }} />
        </div>
        {/* Training day selector */}
        <select style={{ width: '100%', padding: '11px 40px 11px 14px', fontSize: 13, border: '0.5px solid var(--b2)', borderRadius: 'var(--rs)', background: 'var(--s2)', color: 'var(--tx)' }}
          value={todayLog.training_day || 'rest'} onChange={e => onUpdate({ training_day: e.target.value })}>
          <option value="rest">🛋️ Rest day — {settings.kcal_rest} kcal</option>
          <option value="strength">🏋️ Strength — {settings.kcal_strength} kcal</option>
          <option value="ride">🚴 Zone 2 ride — {settings.kcal_ride} kcal</option>
          <option value="run">🏃 Zone 2 run — {settings.kcal_run} kcal</option>
          <option value="longride">🚴 Long ride — {settings.kcal_longride} kcal</option>
        </select>
        {preFuelWarning && (
          <div style={{ marginTop: 8, padding: '9px 12px', background: 'var(--warn2)', borderRadius: 'var(--rs)', border: '0.5px solid var(--warn)', fontSize: 12, color: 'var(--warn)' }}>
            ⚠️ Low carbs on a training day — eat before your session.
          </div>
        )}
      </div>

      {/* Quick-add your most common foods */}
      <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 14, marginTop: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: 'var(--mu)', marginBottom: 10 }}>Quick Add</div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {[
            { key: 'egg', label: 'Eggs', qty: 3 },
            { key: 'oats', label: 'Oats', qty: 80 },
            { key: 'chicken', label: 'Chicken', qty: 150 },
            { key: 'maultasche', label: 'Maultaschen', qty: 3 },
            { key: 'rice', label: 'Basmati', qty: 100 },
            { key: 'banana', label: 'Banana', qty: 1 },
            { key: 'skyr', label: 'Skyr', qty: 200 },
            { key: 'corny', label: 'Corny Bar', qty: 1 },
          ].map(qf => {
            const info = INGREDIENTS[qf.key]
            if (!info) return null
            const kcal = info.isU ? Math.round(info.k * qf.qty) : Math.round(info.k * qf.qty)
            return (
              <button key={qf.key} onClick={() => {
                const food = {
                  id: `builtin_${qf.key}`,
                  name: info.l,
                  kcalPer: info.isU ? info.k : info.k * 100,
                  pPer: info.isU ? info.p : info.p * 100,
                  cPer: info.isU ? info.c : info.c * 100,
                  fPer: info.isU ? info.f : info.f * 100,
                  unit: info.u, isUnit: !!info.isU, defaultQty: qf.qty,
                }
                // Add to lunch by default
                const item = {
                  id: food.id + '_' + Date.now(),
                  name: food.name,
                  kcalPer: food.kcalPer, pPer: food.pPer, cPer: food.cPer, fPer: food.fPer,
                  unit: food.unit, isUnit: food.isUnit, qty: qf.qty, isFixedMeal: false,
                }
                setMealItems(prev => ({ ...prev, lunch: [...prev.lunch, item] }))
              }} style={{
                flexShrink: 0, padding: '8px 12px',
                background: 'var(--s2)', border: '0.5px solid var(--b2)',
                borderRadius: 20, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)', whiteSpace: 'nowrap' as const }}>{qf.label}</span>
                <span style={{ fontSize: 10, color: 'var(--ac)' }}>{kcal} kcal</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Training day tip */}
      <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--s2)', borderRadius: 'var(--rs)', border: '0.5px solid var(--b1)', fontSize: 12, color: 'var(--mu2)', lineHeight: 1.5 }}>
        <span style={{ color: training.color, fontWeight: 700 }}>{training.label} · </span>{training.tip}
      </div>

      {/* Macro bars */}
      <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 14, marginTop: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: 'var(--mu)', marginBottom: 12 }}>Macros</div>
        <MacroBar label="Protein" current={total.p} target={training.protein} color="var(--ac)" />
        <MacroBar label="Carbs" current={total.c} target={training.carbs} color="var(--warn)" />
        <MacroBar label="Fat" current={total.f} target={training.fat} color="var(--purple)" />
      </div>

      {/* Water */}
      <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 14, marginTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const, color: 'var(--mu)' }}>Water</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: (todayLog.water_ml||0) >= (settings.water_target_ml||2500) ? 'var(--good)' : 'var(--tx)' }}>
            {((todayLog.water_ml||0)/1000).toFixed(1)}L / {((settings.water_target_ml||2500)/1000).toFixed(1)}L
          </div>
        </div>
        <div style={{ height: 6, background: 'var(--s3)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ height: 6, width: Math.min(100,((todayLog.water_ml||0)/(settings.water_target_ml||2500))*100)+'%', background: 'var(--blue)', borderRadius: 3, transition: 'width 0.4s' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[250,500,750].map(ml => (
            <button key={ml} onClick={() => onUpdate({ water_ml: (todayLog.water_ml||0)+ml })} style={{ flex: 1, padding: '9px 0', background: 'var(--s2)', border: '0.5px solid var(--b2)', borderRadius: 'var(--rs)', color: 'var(--blue)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+{ml}ml</button>
          ))}
          <button onClick={() => onUpdate({ water_ml: 0 })} style={{ padding: '9px 12px', background: 'transparent', border: '0.5px solid var(--b1)', borderRadius: 'var(--rs)', color: 'var(--mu)', fontSize: 12, cursor: 'pointer' }}>Reset</button>
        </div>
      </div>

      {/* Meals */}
      {MEALS.map(meal => (
        <MealSection
          key={meal}
          title={MEAL_LABELS[meal]}
          items={mealItems[meal]}
          foodOptions={foodOptions}
          macros={macros[meal]}
          onAdd={(f: any) => addItem(meal, f)}
          onRemove={(id: string) => removeItem(meal, id)}
          onQtyChange={(id: string, qty: number) => updateQty(meal, id, qty)}
        />
      ))}

      {/* Summary */}
      <div style={{ ...S.sec, ...S.card }}>
        <div style={{ fontSize: 10, color: 'var(--mu)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 12 }}>Daily Summary</div>
        {MEALS.filter(m => macros[m].kcal > 0).map(m => (
          <div key={m} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: 'var(--mu)' }}>
            <span>{MEAL_LABELS[m]}</span>
            <span style={{ color: 'var(--tx)', fontWeight: 500 }}>{macros[m].kcal} kcal</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, borderTop: '0.5px solid var(--b1)', paddingTop: 10, marginTop: 4 }}>
          <span>Total</span><span style={{ color: 'var(--ac)' }}>{total.kcal} / {target} kcal</span>
        </div>
        <div style={{ height: 5, background: 'var(--s2)', borderRadius: 3, marginTop: 12, overflow: 'hidden' }}>
          <div style={{ height: 5, width: pct+'%', background: statusColor, borderRadius: 3, transition: 'width 0.4s' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--mu)', marginTop: 3 }}><span>0</span><span>{target} kcal</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
          {[{label:'Protein',val:total.p+'g',color:'var(--ac)'},{label:'Carbs',val:total.c+'g',color:'var(--warn)'},{label:'Fat',val:total.f+'g',color:'var(--purple)'}].map(m => (
            <div key={m.label} style={{ background: 'var(--s2)', borderRadius: 'var(--rs)', padding: 10, textAlign: 'center' as const }}>
              <div style={{ fontSize: 9, color: 'var(--mu)', letterSpacing: 0.5, textTransform: 'uppercase' as const, marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.val}</div>
            </div>
          ))}
        </div>
        {hasAny && <div style={{ marginTop: 12, padding: '9px 12px', borderRadius: 'var(--rs)', background: statusColor==='var(--good)'?'var(--good2)':statusColor==='var(--danger)'?'var(--danger2)':'var(--warn2)', fontSize: 12, fontWeight: 500, color: statusColor, textAlign: 'center' as const }}>{statusMsg}</div>}

        {/* Manual save button */}
        <button
          onClick={async () => {
            setSaveStatus('saving')
            await persistMeals(mealItems)
          }}
          disabled={saveStatus === 'saving'}
          style={{
            width: '100%', marginTop: 14, padding: 14,
            background: saveStatus === 'saved' ? 'var(--good2)' : 'var(--ac2)',
            border: `0.5px solid ${saveStatus === 'saved' ? 'var(--good)' : 'var(--ac)'}`,
            borderRadius: 'var(--rs)',
            color: saveStatus === 'saved' ? 'var(--good)' : 'var(--ac)',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.3s',
          }}>
          {saveStatus === 'saving' ? '...' : saveStatus === 'saved' ? '✓ Opgeslagen!' : '💾 Dag opslaan'}
        </button>
        <div style={{ fontSize: 11, color: 'var(--mu)', textAlign: 'center' as const, marginTop: 6 }}>
          Druk op opslaan voor je de app sluit
        </div>
      </div>
      <div style={{ height: 24 }} />
    </div>
  )
}
