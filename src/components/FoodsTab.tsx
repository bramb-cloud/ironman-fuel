'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase, USER_ID } from '@/lib/supabase'

export default function FoodsTab() {
  const [foods, setFoods] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [form, setForm] = useState({ name: '', kcal: '', protein: '', carbs: '', fat: '', barcode: '' })
  const [search, setSearch] = useState('')
  const [scanResult, setScanResult] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => { loadFoods() }, [])

  async function loadFoods() {
    const { data } = await supabase.from('custom_foods').select('*').eq('user_id', USER_ID).order('created_at', { ascending: false })
    setFoods(data || [])
  }

  async function saveFood() {
    if (!form.name || !form.kcal) return
    await supabase.from('custom_foods').insert({
      user_id: USER_ID,
      name: form.name,
      kcal_per_100g: parseFloat(form.kcal),
      protein_per_100g: parseFloat(form.protein) || 0,
      carbs_per_100g: parseFloat(form.carbs) || 0,
      fat_per_100g: parseFloat(form.fat) || 0,
      barcode: form.barcode || null,
    })
    setForm({ name: '', kcal: '', protein: '', carbs: '', fat: '', barcode: '' })
    setShowForm(false)
    loadFoods()
  }

  async function deleteFood(id: string) {
    await supabase.from('custom_foods').delete().eq('id', id)
    loadFoods()
  }

  async function startScanner() {
    setScanning(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch (e) {
      alert('Camera not available')
      setScanning(false)
    }
  }

  function stopScanner() {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    setScanning(false)
  }

  async function lookupBarcode(barcode: string) {
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      const data = await res.json()
      if (data.status === 1 && data.product) {
        const p = data.product
        const n = p.nutriments || {}
        setForm({
          name: p.product_name || p.abbreviated_product_name || '',
          kcal: Math.round(n['energy-kcal_100g'] || n['energy_100g'] / 4.184 || 0).toString(),
          protein: (n.proteins_100g || 0).toFixed(1),
          carbs: (n.carbohydrates_100g || 0).toFixed(1),
          fat: (n.fat_100g || 0).toFixed(1),
          barcode,
        })
        setScanResult(`Found: ${p.product_name}`)
        setShowForm(true)
      } else {
        setScanResult('Product not found — enter manually')
        setForm(f => ({ ...f, barcode }))
        setShowForm(true)
      }
    } catch {
      setScanResult('Lookup failed — enter manually')
      setForm(f => ({ ...f, barcode }))
      setShowForm(true)
    }
    stopScanner()
  }

  const filtered = foods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  const inputStyle = {
    width: '100%', padding: '11px 14px', background: 'var(--s2)',
    border: '0.5px solid var(--b2)', borderRadius: 'var(--rs)',
    color: 'var(--tx)', fontSize: 14, marginBottom: 10,
  } as any

  return (
    <div style={{ paddingTop: 20 }}>
      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setShowForm(!showForm)} style={{
          flex: 1, padding: 12, background: 'var(--ac2)', border: '0.5px solid var(--ac)',
          borderRadius: 'var(--rs)', color: 'var(--ac)', fontSize: 13, fontWeight: 600
        }}>+ Add manually</button>
        <button onClick={scanning ? stopScanner : startScanner} style={{
          flex: 1, padding: 12, background: scanning ? 'var(--danger2)' : 'var(--blue2)',
          border: `0.5px solid ${scanning ? 'var(--danger)' : 'var(--blue)'}`,
          borderRadius: 'var(--rs)', color: scanning ? 'var(--danger)' : 'var(--blue)', fontSize: 13, fontWeight: 600
        }}>{scanning ? '✕ Stop scan' : '📷 Scan barcode'}</button>
      </div>

      {/* Scanner */}
      {scanning && (
        <div style={{ marginBottom: 16 }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: 'var(--r)', border: '0.5px solid var(--b2)' }} />
          <div style={{ marginTop: 8 }}>
            <input placeholder="Or enter barcode number manually" style={inputStyle} onKeyDown={e => { if (e.key === 'Enter') lookupBarcode((e.target as any).value) }} />
          </div>
          {scanResult && <div style={{ fontSize: 12, color: 'var(--ac)', padding: '8px 0' }}>{scanResult}</div>}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b2)', borderRadius: 'var(--r)', padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Add custom food (per 100g)</div>
          <input placeholder="Food name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input placeholder="kcal *" type="number" value={form.kcal} onChange={e => setForm(f => ({ ...f, kcal: e.target.value }))} style={{ ...inputStyle, marginBottom: 0 }} />
            <input placeholder="Protein (g)" type="number" value={form.protein} onChange={e => setForm(f => ({ ...f, protein: e.target.value }))} style={{ ...inputStyle, marginBottom: 0 }} />
            <input placeholder="Carbs (g)" type="number" value={form.carbs} onChange={e => setForm(f => ({ ...f, carbs: e.target.value }))} style={{ ...inputStyle, marginBottom: 0 }} />
            <input placeholder="Fat (g)" type="number" value={form.fat} onChange={e => setForm(f => ({ ...f, fat: e.target.value }))} style={{ ...inputStyle, marginBottom: 0 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={saveFood} style={{ flex: 1, padding: 11, background: 'var(--ac2)', border: '0.5px solid var(--ac)', borderRadius: 'var(--rs)', color: 'var(--ac)', fontWeight: 600 }}>Save food</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '11px 14px', background: 'transparent', border: '0.5px solid var(--b1)', borderRadius: 'var(--rs)', color: 'var(--mu)' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Search */}
      <input placeholder="Search my foods..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />

      {/* Foods list */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--mu)', fontSize: 13 }}>
          {foods.length === 0 ? 'No custom foods yet — add one above' : 'No results'}
        </div>
      )}

      {filtered.map(f => (
        <div key={f.id} style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--rs)', padding: '12px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{f.name}</div>
            <div style={{ fontSize: 11, color: 'var(--mu)', marginTop: 3 }}>
              {f.kcal_per_100g} kcal · P {f.protein_per_100g}g · C {f.carbs_per_100g}g · F {f.fat_per_100g}g per 100g
              {f.barcode && <span style={{ marginLeft: 6, color: 'var(--blue)' }}>#{f.barcode}</span>}
            </div>
          </div>
          <button onClick={() => deleteFood(f.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: 20, padding: 4 }}>×</button>
        </div>
      ))}

      <div style={{ height: 24 }} />
    </div>
  )
}
