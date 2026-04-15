'use client'
import { useState, useEffect } from 'react'
import { TRAINING_TARGETS, INGREDIENTS } from '@/lib/foods'
import { supabase, USER_ID } from '@/lib/supabase'

const S = {
  sec: { marginTop: 22 } as any,
  stitle: { fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const, color: 'var(--mu)', marginBottom: 8, padding: '0 2px' },
  card: { background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 14, marginTop: 8 } as any,
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
  const [qty, setQty] = useState(item.qty || 100)
  const kcal = Math.round(item.kcalPer * qty / 100)
  function handleQty(v: number) { setQty(v); onQtyChange(item.id, v) }
  return (
    <div style={{ background: 'var(--s2)', borderRadius: 'var(--rs)', padding: '10px 12px', marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
        <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: 20, padding: '0 4px', cursor: 'pointer' }}>×</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 36px 52px', alignItems: 'center', gap: 8 }}>
        <input type="range" min={item.isUnit ? 1 : 10} max={item.isUnit ? 20 : 500} step={item.isUnit ? 1 : 10} value={qty} onChange={e => handleQty(+e.target.value)} />
        <input type="number" value={qty} min={item.isUnit ? 1 : 10} max={item.isUnit ? 20 : 500} step={item.isUnit ? 1 : 10} onChange={e => handleQty(+e.target.value)}
          style={{ padding: '4px', fontSize: 12, fontWeight: 600, border: '0.5px solid var(--b2)', borderRadius: 6, background: 'var(--s1)', color: 'var(--tx)', textAlign: 'center', width: '100%' }} />
        <span style={{ fontSize: 10, color: 'var(--mu)' }}>{item.unit}</span>
        <span style={{ fontSize: 11, color: 'var(--ac)', textAlign: 'right' }}>{kcal} kcal</span>
      </div>
      <div style={{ fontSize: 10, color: 'var(--mu)', marginTop: 4 }}>
        P {Math.round(item.pPer * qty / 100 * 10)/10}g · C {Math.round(item.cPer * qty / 100 * 10)/10}g · F {Math.round(item.fPer * qty / 100 * 10)/10}g
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
    const r = item.qty / 100
    return { kcal: acc.kcal + Math.round(item.kcalPer * r), p: acc.p + item.pPer * r, c: acc.c + item.cPer * r, f: acc.f + item.fPer * r }
  }, { kcal: 0, p: 0, c: 0, f: 0 })
}

export default function TodayTab({ todayLog, settings, onUpdate, streak }: any) {
  const [breakfast, setBreakfast] = useState<any[]>([])
  const [lunch, setLunch] = useState<any[]>([])
  const [snack, setSnack] = useState<any[]>([])
  const [dinner, setDinner] = useState<any[]>([])
  const [extras, setExtras] = useState<any[]>([])
  const [foodOptions, setFoodOptions] = useState<any[]>([])

  const training = TRAINING_TARGETS[todayLog.training_day || 'rest']
  const target = settings['kcal_'+(todayLog.training_day||'rest')] || training.kcal

  useEffect(() => { buildFoodOptions() }, [])

  async function buildFoodOptions() {
    const builtin = Object.entries(INGREDIENTS).map(([key, info]) => ({
      id: 'builtin_'+key, name: info.l,
      kcalPer: info.isU ? info.k : info.k * 100,
      pPer: info.isU ? info.p : info.p * 100,
      cPer: info.isU ? info.c : info.c * 100,
      fPer: info.isU ? info.f : info.f * 100,
      unit: info.u, isUnit: !!info.isU, defaultQty: info.isU ? info.mn : 100, isCustom: false,
    }))
    const { data: custom } = await supabase.from('custom_foods').select('*').eq('user_id', USER_ID)
    const customFoods = (custom || []).map((f: any) => ({
      id: 'custom_'+f.id, name: f.name,
      kcalPer: f.kcal_per_100g, pPer: f.protein_per_100g, cPer: f.carbs_per_100g, fPer: f.fat_per_100g,
      unit: 'g', isUnit: false, defaultQty: 100, isCustom: true,
    }))
    setFoodOptions([...customFoods, ...builtin])
  }

  function addItem(meal: string, food: any) {
    const item = { id: food.id+'_'+Date.now(), name: food.name, kcalPer: food.kcalPer, pPer: food.pPer, cPer: food.cPer, fPer: food.fPer, unit: food.unit, isUnit: food.isUnit, qty: food.defaultQty || 100 }
    const set = { breakfast: setBreakfast, lunch: setLunch, snack: setSnack, dinner: setDinner, extras: setExtras }[meal]
    if (set) set((prev: any[]) => [...prev, item])
  }
  function removeItem(meal: string, id: string) {
    const set = { breakfast: setBreakfast, lunch: setLunch, snack: setSnack, dinner: setDinner, extras: setExtras }[meal]
    if (set) set((prev: any[]) => prev.filter((i: any) => i.id !== id))
  }
  function updateQty(meal: string, id: string, qty: number) {
    const set = { breakfast: setBreakfast, lunch: setLunch, snack: setSnack, dinner: setDinner, extras: setExtras }[meal]
    if (set) set((prev: any[]) => prev.map((i: any) => i.id === id ? { ...i, qty } : i))
  }

  const bfM = sumMacros(breakfast), lnM = sumMacros(lunch), snM = sumMacros(snack), dnM = sumMacros(dinner), exM = sumMacros(extras)
  const total = {
    kcal: bfM.kcal + lnM.kcal + snM.kcal + dnM.kcal + exM.kcal,
    p: Math.round((bfM.p+lnM.p+snM.p+dnM.p+exM.p)*10)/10,
    c: Math.round((bfM.c+lnM.c+snM.c+dnM.c+exM.c)*10)/10,
    f: Math.round((bfM.f+lnM.f+snM.f+dnM.f+exM.f)*10)/10,
  }
  const diff = total.kcal - target
  const pct = Math.min(Math.round((total.kcal/target)*100),100)
  const hasAny = breakfast.length+lunch.length+snack.length+dinner.length > 0
  const preFuelWarning = ['ride','run','longride'].includes(todayLog.training_day) && lnM.c < 40 && lunch.length > 0

  let statusColor = 'var(--mu)', statusMsg = 'Add meals to see your daily total'
  if (hasAny) {
    if (diff < -300) { statusColor='var(--warn)'; statusMsg=Math.abs(diff)+' kcal under — Gilberts fatigue risk' }
    else if (diff < 0) { statusColor='var(--good)'; statusMsg=Math.abs(diff)+' kcal under target — good deficit ✓' }
    else if (diff <= 150) { statusColor='var(--warn)'; statusMsg=diff+' kcal over target — acceptable' }
    else { statusColor='var(--danger)'; statusMsg=diff+' kcal over target — swap something' }
  }

  return (
    <div>
      <div style={S.sec}>
        <div style={S.stitle}>Training Day</div>
        <select style={S.select} value={todayLog.training_day||'rest'} onChange={e => onUpdate({ training_day: e.target.value })}>
          <option value="rest">🛋️ Rest day — {settings.kcal_rest} kcal</option>
          <option value="strength">🏋️ Strength session — {settings.kcal_strength} kcal</option>
          <option value="ride">🚴 Zone 2 ride — {settings.kcal_ride} kcal</option>
          <option value="run">🏃 Zone 2 run — {settings.kcal_run} kcal</option>
          <option value="longride">🚴 Long ride (Sat) — {settings.kcal_longride} kcal</option>
        </select>
        <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--s1)', borderRadius: 'var(--rs)', border: '0.5px solid var(--b1)', fontSize: 12, color: 'var(--mu2)', lineHeight: 1.5 }}>
          <span style={{ color: training.color, fontWeight: 600 }}>{training.label} · </span>{training.tip}
        </div>
        {preFuelWarning && (
          <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--warn2)', borderRadius: 'var(--rs)', border: '0.5px solid var(--warn)', fontSize: 12, color: 'var(--warn)' }}>
            ⚠️ Low carbs at lunch on a training day — eat something before your session.
          </div>
        )}
      </div>

      <div style={{ ...S.sec, ...S.card }}>
        <div style={{ fontSize: 11, color: 'var(--mu)', marginBottom: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const }}>Macro Targets</div>
        <MacroBar label="Protein" current={total.p} target={training.protein} color="var(--ac)" />
        <MacroBar label="Carbs" current={total.c} target={training.carbs} color="var(--warn)" />
        <MacroBar label="Fat" current={total.f} target={training.fat} color="var(--purple)" />
      </div>

      <div style={{ ...S.sec, ...S.card }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--mu)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const }}>Water</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: (todayLog.water_ml||0) >= (settings.water_target_ml||2500) ? 'var(--good)' : 'var(--tx)' }}>
            {((todayLog.water_ml||0)/1000).toFixed(1)}L / {((settings.water_target_ml||2500)/1000).toFixed(1)}L
          </div>
        </div>
        <div style={{ height: 6, background: 'var(--s2)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ height: 6, width: Math.min(100,((todayLog.water_ml||0)/(settings.water_target_ml||2500))*100)+'%', background: 'var(--blue)', borderRadius: 3, transition: 'width 0.4s' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[250,500,750].map(ml => (
            <button key={ml} onClick={() => onUpdate({ water_ml: (todayLog.water_ml||0)+ml })} style={{ flex: 1, padding: '9px 0', background: 'var(--s2)', border: '0.5px solid var(--b2)', borderRadius: 'var(--rs)', color: 'var(--blue)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>+{ml}ml</button>
          ))}
          <button onClick={() => onUpdate({ water_ml: 0 })} style={{ padding: '9px 12px', background: 'transparent', border: '0.5px solid var(--b1)', borderRadius: 'var(--rs)', color: 'var(--mu)', fontSize: 12, cursor: 'pointer' }}>Reset</button>
        </div>
      </div>

      <MealSection title="Breakfast" items={breakfast} foodOptions={foodOptions} macros={bfM} onAdd={(f:any)=>addItem('breakfast',f)} onRemove={(id:string)=>removeItem('breakfast',id)} onQtyChange={(id:string,qty:number)=>updateQty('breakfast',id,qty)} />
      <MealSection title="Lunch" items={lunch} foodOptions={foodOptions} macros={lnM} onAdd={(f:any)=>addItem('lunch',f)} onRemove={(id:string)=>removeItem('lunch',id)} onQtyChange={(id:string,qty:number)=>updateQty('lunch',id,qty)} />
      <MealSection title="Snack" items={snack} foodOptions={foodOptions} macros={snM} onAdd={(f:any)=>addItem('snack',f)} onRemove={(id:string)=>removeItem('snack',id)} onQtyChange={(id:string,qty:number)=>updateQty('snack',id,qty)} />
      <MealSection title="Dinner" items={dinner} foodOptions={foodOptions} macros={dnM} onAdd={(f:any)=>addItem('dinner',f)} onRemove={(id:string)=>removeItem('dinner',id)} onQtyChange={(id:string,qty:number)=>updateQty('dinner',id,qty)} />
      <MealSection title="Extras" items={extras} foodOptions={foodOptions} macros={exM} onAdd={(f:any)=>addItem('extras',f)} onRemove={(id:string)=>removeItem('extras',id)} onQtyChange={(id:string,qty:number)=>updateQty('extras',id,qty)} />

      <div style={{ ...S.sec, ...S.card }}>
        <div style={{ fontSize: 10, color: 'var(--mu)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 12 }}>Daily Summary</div>
        {[{label:'Breakfast',m:bfM},{label:'Lunch',m:lnM},{label:'Snack',m:snM},{label:'Dinner',m:dnM},...(extras.length?[{label:'Extras ('+extras.length+')',m:exM}]:[])].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: 'var(--mu)' }}>
            <span>{row.label}</span><span style={{ color: 'var(--tx)', fontWeight: 500 }}>{row.m.kcal} kcal</span>
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
        <button onClick={() => onUpdate({ meals: [{breakfast:bfM,lunch:lnM,snack:snM,dinner:dnM,extras:exM,total}] })} style={{ width: '100%', marginTop: 14, padding: 12, background: 'var(--ac2)', border: '0.5px solid var(--ac)', borderRadius: 'var(--rs)', color: 'var(--ac)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Save Today&#39;s Log ✓
        </button>
      </div>
      <div style={{ height: 24 }} />
    </div>
  )
}
