'use client'
import { useState, useEffect } from 'react'
import { supabase, USER_ID } from '@/lib/supabase'
import { ANIMALS, CROPS, DECORATIONS, FARM_LEVELS, FarmState, calcPendingFarmCoins, getCropStage } from '@/lib/farm'
import PixelFarm from './PixelFarm'

const PARTNER_ID = 'franziska_brinkmeier'

const DEFAULT_FARM: FarmState = {
  training_coins: 0,
  farm_coins: 0,
  animals: [],
  crops: [],
  decorations: [],
  farm_level: 1,
  total_training_coins_earned: 0,
  last_production_check: new Date().toISOString(),
}

type ShopTab = 'animals' | 'crops' | 'decorations' | 'expand'

export default function FarmTab() {
  const [farm, setFarm] = useState<FarmState>(DEFAULT_FARM)
  const [partnerFarm, setPartnerFarm] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [shopTab, setShopTab] = useState<ShopTab>('animals')
  const [showShop, setShowShop] = useState(false)
  const [pendingCoins, setPendingCoins] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [namingAnimal, setNamingAnimal] = useState<string | null>(null)
  const [log, setLog] = useState<any[]>([])

  useEffect(() => {
    loadFarm()
    loadLog()
  }, [])

  useEffect(() => {
    if (!loading) {
      const pending = calcPendingFarmCoins(farm)
      setPendingCoins(pending)
    }
  }, [farm, loading])

  async function loadFarm() {
    const [{ data: myData }, { data: partnerData }] = await Promise.all([
      supabase.from('farm_state').select('*').eq('user_id', USER_ID).single(),
      supabase.from('farm_state').select('*').eq('user_id', PARTNER_ID).single(),
    ])

    if (myData) {
      setFarm({
        training_coins: myData.training_coins || 0,
        farm_coins: myData.farm_coins || 0,
        animals: myData.animals || [],
        crops: myData.crops || [],
        decorations: myData.decorations || [],
        farm_level: myData.farm_level || 1,
        total_training_coins_earned: myData.total_training_coins_earned || 0,
        last_production_check: myData.last_production_check || new Date().toISOString(),
      })
    } else {
      // Create initial farm
      await supabase.from('farm_state').insert({ user_id: USER_ID, ...DEFAULT_FARM })
    }
    if (partnerData) setPartnerFarm(partnerData)
    setLoading(false)
  }

  async function loadLog() {
    const { data } = await supabase.from('farm_log')
      .select('*').in('user_id', [USER_ID, PARTNER_ID])
      .order('created_at', { ascending: false }).limit(10)
    setLog(data || [])
  }

  async function saveFarm(updated: FarmState) {
    setFarm(updated)
    await supabase.from('farm_state').upsert({
      user_id: USER_ID,
      training_coins: updated.training_coins,
      farm_coins: updated.farm_coins,
      animals: updated.animals,
      crops: updated.crops,
      decorations: updated.decorations,
      farm_level: updated.farm_level,
      total_training_coins_earned: updated.total_training_coins_earned,
      last_production_check: updated.last_production_check,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }

  async function addLog(description: string, coinsDelta: number, coinType: string) {
    await supabase.from('farm_log').insert({
      user_id: USER_ID, event_type: 'purchase', description, coins_delta: coinsDelta, coin_type: coinType
    })
    loadLog()
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function collectProduction() {
    if (pendingCoins <= 0) return
    const updated = {
      ...farm,
      farm_coins: farm.farm_coins + pendingCoins,
      last_production_check: new Date().toISOString(),
    }
    await saveFarm(updated)
    setPendingCoins(0)
    showToast(`+${pendingCoins} 🌾 Farm Coins collected!`)
    await addLog(`Collected ${pendingCoins} farm coins from animals`, pendingCoins, 'farm')
  }

  async function buyAnimal(type: string) {
    const info = ANIMALS[type as keyof typeof ANIMALS]
    if (!info) return
    if (farm.training_coins < info.cost) { showToast('Not enough 🏅 Training Coins!'); return }
    const maxSlots = FARM_LEVELS[farm.farm_level - 1].slots
    if (farm.animals.length >= maxSlots) { showToast('Farm full! Expand first.'); return }

    setNamingAnimal(type)
  }

  async function confirmBuyAnimal(type: string, name: string) {
    const info = ANIMALS[type as keyof typeof ANIMALS]
    const newAnimal = {
      id: `${type}_${Date.now()}`,
      type,
      name: name || info.label,
      placedAt: new Date().toISOString(),
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      productionRate: info.rate,
      lastCollected: new Date().toISOString(),
    }
    const updated = {
      ...farm,
      training_coins: farm.training_coins - info.cost,
      animals: [...farm.animals, newAnimal],
    }
    await saveFarm(updated)
    setNamingAnimal(null)
    setNameInput('')
    showToast(`${info.emoji} ${name || info.label} joined the farm!`)
    await addLog(`Bought ${info.label} "${name}"`, -info.cost, 'training')
  }

  async function buyCrop(type: string) {
    const info = CROPS[type as keyof typeof CROPS]
    if (!info) return
    if (farm.training_coins < info.cost) { showToast('Not enough 🏅 Training Coins!'); return }
    const newCrop = {
      id: `${type}_${Date.now()}`,
      type,
      plantedAt: new Date().toISOString(),
      x: 30 + Math.random() * 40,
      y: 10 + Math.random() * 60,
      growthHours: info.growthHours,
      collected: false,
    }
    const updated = {
      ...farm,
      training_coins: farm.training_coins - info.cost,
      crops: [...farm.crops.filter(c => !c.collected), newCrop],
    }
    await saveFarm(updated)
    showToast(`${info.emoji} ${info.label} planted! Ready in ${info.growthHours}h`)
    await addLog(`Planted ${info.label}`, -info.cost, 'training')
  }

  async function buyDecoration(type: string) {
    const info = DECORATIONS[type as keyof typeof DECORATIONS]
    if (!info) return
    if (farm.farm_coins < info.cost) { showToast('Not enough 🌾 Farm Coins!'); return }
    const newDec = {
      id: `${type}_${Date.now()}`,
      type,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
    }
    const updated = {
      ...farm,
      farm_coins: farm.farm_coins - info.cost,
      decorations: [...farm.decorations, newDec],
    }
    await saveFarm(updated)
    showToast(`${info.emoji} ${info.label} added to the farm!`)
    await addLog(`Bought ${info.label}`, -info.cost, 'farm')
  }

  async function harvestCrop(cropId: string) {
    const crop = farm.crops.find(c => c.id === cropId)
    if (!crop) return
    const stage = getCropStage(crop)
    if (stage !== 'ready') { showToast('Not ready yet!'); return }
    const info = CROPS[crop.type as keyof typeof CROPS]
    const updated = {
      ...farm,
      farm_coins: farm.farm_coins + info.reward,
      crops: farm.crops.map(c => c.id === cropId ? { ...c, collected: true } : c),
    }
    await saveFarm(updated)
    showToast(`+${info.reward} 🌾 Harvested ${info.label}!`)
    await addLog(`Harvested ${info.label}`, info.reward, 'farm')
  }

  async function expandFarm() {
    const nextLevel = FARM_LEVELS[farm.farm_level]
    if (!nextLevel) { showToast('Max level reached!'); return }
    if (farm.training_coins < nextLevel.cost!) { showToast(`Need ${nextLevel.cost} 🏅 coins to expand!`); return }
    const updated = {
      ...farm,
      training_coins: farm.training_coins - nextLevel.cost!,
      farm_level: farm.farm_level + 1,
    }
    await saveFarm(updated)
    showToast(`🎉 Farm expanded to ${nextLevel.name}!`)
    await addLog(`Expanded farm to level ${farm.farm_level + 1}`, -nextLevel.cost!, 'training')
  }

  const currentLevel = FARM_LEVELS[farm.farm_level - 1]
  const nextLevel = FARM_LEVELS[farm.farm_level]
  const totalCoins = farm.training_coins + (partnerFarm?.training_coins || 0)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--mu)', fontSize: 14 }}>
      Loading farm... 🌱
    </div>
  )

  return (
    <div style={{ paddingTop: 16 }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 64, left: 16, right: 16, zIndex: 300, background: 'var(--ac)', color: '#000', padding: '10px 16px', borderRadius: 20, fontSize: 14, fontWeight: 700, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {toast}
        </div>
      )}

      {/* Naming modal */}
      {namingAnimal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 320 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
              Name your {ANIMALS[namingAnimal as keyof typeof ANIMALS]?.label} {ANIMALS[namingAnimal as keyof typeof ANIMALS]?.emoji}
            </div>
            <div style={{ fontSize: 12, color: 'var(--mu)', marginBottom: 16 }}>
              Cost: {ANIMALS[namingAnimal as keyof typeof ANIMALS]?.cost} 🏅 Training Coins
            </div>
            <input
              placeholder={ANIMALS[namingAnimal as keyof typeof ANIMALS]?.label}
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', background: 'var(--s2)', border: '0.5px solid var(--b2)', borderRadius: 12, color: 'var(--tx)', fontSize: 14, marginBottom: 14 }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => confirmBuyAnimal(namingAnimal, nameInput || ANIMALS[namingAnimal as keyof typeof ANIMALS]?.label)}
                style={{ flex: 2, padding: 12, background: 'var(--ac)', border: 'none', borderRadius: 12, color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Welcome to the farm! 🎉
              </button>
              <button onClick={() => { setNamingAnimal(null); setNameInput('') }}
                style={{ flex: 1, padding: 12, background: 'transparent', border: '0.5px solid var(--b2)', borderRadius: 12, color: 'var(--mu)', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coin header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: '12px 14px' }}>
          <div style={{ fontSize: 9, color: 'var(--mu)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 4 }}>Training Coins</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ac)' }}>🏅 {farm.training_coins}</div>
          <div style={{ fontSize: 10, color: 'var(--mu)', marginTop: 2 }}>From your workouts</div>
        </div>
        <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: '12px 14px' }}>
          <div style={{ fontSize: 9, color: 'var(--mu)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 4 }}>Farm Coins</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#6aa84f' }}>🌾 {farm.farm_coins}</div>
          <div style={{ fontSize: 10, color: 'var(--mu)', marginTop: 2 }}>From your animals</div>
        </div>
      </div>

      {/* Partner coins */}
      {partnerFarm && (
        <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: '10px 14px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--mu)' }}>🌸 Franziska's coins</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#d4a0d0' }}>🏅 {partnerFarm.training_coins} · 🌾 {partnerFarm.farm_coins}</div>
        </div>
      )}

      {/* Collect production */}
      {pendingCoins > 0 && (
        <button onClick={collectProduction} style={{
          width: '100%', marginBottom: 12, padding: '12px 0',
          background: 'linear-gradient(135deg, #2d5a1b, #4a8a2d)',
          border: '0.5px solid #6aa84f', borderRadius: 'var(--r)',
          color: '#ffffff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          🌾 Collect {pendingCoins} Farm Coins from animals!
        </button>
      )}

      {/* Farm canvas */}
      <div style={{ background: '#0d1b2a', borderRadius: 'var(--r)', overflow: 'hidden', marginBottom: 12, border: '0.5px solid #1a3a5a', position: 'relative' as const }}>
        <div style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#6aa84f', fontWeight: 600 }}>{currentLevel.name}</span>
          <span style={{ fontSize: 10, color: 'var(--mu)' }}>{farm.animals.length}/{currentLevel.slots} animals · {farm.crops.filter(c => !c.collected).length} crops</span>
        </div>
        <PixelFarm farm={farm} width={320} height={200} />

        {/* Ready crops overlay */}
        {farm.crops.filter(c => !c.collected && getCropStage(c) === 'ready').map(crop => (
          <button key={crop.id} onClick={() => harvestCrop(crop.id)} style={{
            position: 'absolute', bottom: 8, right: 8,
            background: 'var(--ac)', border: 'none', borderRadius: 20,
            padding: '6px 12px', color: '#000', fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}>
            🌾 Harvest {CROPS[crop.type as keyof typeof CROPS]?.label}!
          </button>
        ))}
      </div>

      {/* Growing crops status */}
      {farm.crops.filter(c => !c.collected).length > 0 && (
        <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: 'var(--mu)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>Growing Crops</div>
          {farm.crops.filter(c => !c.collected).map(crop => {
            const info = CROPS[crop.type as keyof typeof CROPS]
            const stage = getCropStage(crop)
            const elapsed = (Date.now() - new Date(crop.plantedAt).getTime()) / 3600000
            const pct = Math.min(100, Math.round((elapsed / crop.growthHours) * 100))
            return (
              <div key={crop.id} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>{info?.emoji} {info?.label}</span>
                  <span style={{ color: stage === 'ready' ? 'var(--good)' : 'var(--mu)' }}>
                    {stage === 'ready' ? '✓ Ready!' : `${pct}% · ${Math.max(0, info.growthHours - elapsed).toFixed(1)}h left`}
                  </span>
                </div>
                <div style={{ height: 4, background: 'var(--s2)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: 4, width: `${pct}%`, background: stage === 'ready' ? 'var(--good)' : '#6aa84f', borderRadius: 2 }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Animals */}
      {farm.animals.length > 0 && (
        <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: 'var(--mu)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>Your Animals</div>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
            {farm.animals.map(animal => {
              const info = ANIMALS[animal.type as keyof typeof ANIMALS]
              return (
                <div key={animal.id} style={{ background: 'var(--s2)', borderRadius: 10, padding: '8px 12px', textAlign: 'center' as const }}>
                  <div style={{ fontSize: 24 }}>{info?.emoji}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--tx)', marginTop: 2 }}>{animal.name}</div>
                  <div style={{ fontSize: 9, color: '#6aa84f' }}>+{info?.rate}/hr</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Shop button */}
      <button onClick={() => setShowShop(!showShop)} style={{
        width: '100%', padding: 14,
        background: showShop ? 'var(--s2)' : 'var(--ac)',
        border: `0.5px solid ${showShop ? 'var(--b2)' : 'var(--ac)'}`,
        borderRadius: 'var(--r)', color: showShop ? 'var(--mu)' : '#000',
        fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 12,
      }}>
        {showShop ? '▲ Close Shop' : '🛒 Open Shop'}
      </button>

      {showShop && (
        <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 14, marginBottom: 12 }}>
          {/* Shop tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {(['animals', 'crops', 'decorations', 'expand'] as ShopTab[]).map(t => (
              <button key={t} onClick={() => setShopTab(t)} style={{
                flex: 1, padding: '7px 0', fontSize: 10, fontWeight: 600, letterSpacing: 0.5,
                textTransform: 'uppercase' as const, borderRadius: 10, cursor: 'pointer',
                background: shopTab === t ? 'var(--ac)' : 'var(--s2)',
                border: `0.5px solid ${shopTab === t ? 'var(--ac)' : 'var(--b1)'}`,
                color: shopTab === t ? '#000' : 'var(--mu)',
              }}>{t}</button>
            ))}
          </div>

          {shopTab === 'animals' && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--mu)', marginBottom: 10 }}>🏅 Training Coins · {farm.animals.length}/{currentLevel.slots} slots used</div>
              {Object.entries(ANIMALS).map(([key, info]) => {
                const maxForLevel = info.maxPerLevel[farm.farm_level - 1]
                const owned = farm.animals.filter(a => a.type === key).length
                const canBuy = farm.training_coins >= info.cost && farm.animals.length < currentLevel.slots && owned < maxForLevel
                return (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '10px 12px', background: 'var(--s2)', borderRadius: 10 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 24 }}>{info.emoji}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>{info.label}</div>
                        <div style={{ fontSize: 10, color: '#6aa84f' }}>+{info.rate} 🌾/hr · owned: {owned}/{maxForLevel}</div>
                      </div>
                    </div>
                    <button onClick={() => canBuy && buyAnimal(key)} style={{
                      padding: '7px 12px', background: canBuy ? 'var(--ac)' : 'var(--s1)',
                      border: `0.5px solid ${canBuy ? 'var(--ac)' : 'var(--b1)'}`,
                      borderRadius: 10, color: canBuy ? '#000' : 'var(--mu)',
                      fontSize: 11, fontWeight: 700, cursor: canBuy ? 'pointer' : 'default',
                      opacity: maxForLevel === 0 ? 0.3 : 1,
                    }}>
                      {maxForLevel === 0 ? '🔒' : `🏅 ${info.cost}`}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {shopTab === 'crops' && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--mu)', marginBottom: 10 }}>🏅 Training Coins to plant · 🌾 Farm Coins on harvest</div>
              {Object.entries(CROPS).map(([key, info]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '10px 12px', background: 'var(--s2)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 24 }}>{info.emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{info.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--mu)' }}>{info.growthHours}h grow · +{info.reward} 🌾 harvest</div>
                    </div>
                  </div>
                  <button onClick={() => farm.training_coins >= info.cost && buyCrop(key)} style={{
                    padding: '7px 12px',
                    background: farm.training_coins >= info.cost ? 'var(--ac)' : 'var(--s1)',
                    border: `0.5px solid ${farm.training_coins >= info.cost ? 'var(--ac)' : 'var(--b1)'}`,
                    borderRadius: 10, color: farm.training_coins >= info.cost ? '#000' : 'var(--mu)',
                    fontSize: 11, fontWeight: 700, cursor: farm.training_coins >= info.cost ? 'pointer' : 'default',
                  }}>🏅 {info.cost}</button>
                </div>
              ))}
            </div>
          )}

          {shopTab === 'decorations' && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--mu)', marginBottom: 10 }}>🌾 Farm Coins to buy</div>
              {Object.entries(DECORATIONS).map(([key, info]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '10px 12px', background: 'var(--s2)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 24 }}>{info.emoji}</span>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{info.label}</div>
                  </div>
                  <button onClick={() => farm.farm_coins >= info.cost && buyDecoration(key)} style={{
                    padding: '7px 12px',
                    background: farm.farm_coins >= info.cost ? '#6aa84f' : 'var(--s1)',
                    border: `0.5px solid ${farm.farm_coins >= info.cost ? '#6aa84f' : 'var(--b1)'}`,
                    borderRadius: 10, color: farm.farm_coins >= info.cost ? '#fff' : 'var(--mu)',
                    fontSize: 11, fontWeight: 700, cursor: farm.farm_coins >= info.cost ? 'pointer' : 'default',
                  }}>🌾 {info.cost}</button>
                </div>
              ))}
            </div>
          )}

          {shopTab === 'expand' && (
            <div>
              {FARM_LEVELS.map((level, i) => {
                const isOwned = farm.farm_level > i
                const isCurrent = farm.farm_level === i + 1
                const isNext = farm.farm_level === i
                const canAfford = farm.training_coins >= (level.cost || 0)
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '12px 14px', background: isCurrent ? 'rgba(255,200,50,0.1)' : 'var(--s2)', border: `0.5px solid ${isCurrent ? 'var(--warn)' : 'var(--b1)'}`, borderRadius: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>
                        {isOwned || isCurrent ? '✓ ' : ''}{level.name}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--mu)', marginTop: 2 }}>{level.label} · {level.slots} animal slots</div>
                    </div>
                    {isOwned ? (
                      <span style={{ fontSize: 11, color: 'var(--good)' }}>Owned</span>
                    ) : isCurrent ? (
                      <span style={{ fontSize: 11, color: 'var(--warn)', fontWeight: 700 }}>Current</span>
                    ) : isNext ? (
                      <button onClick={expandFarm} style={{
                        padding: '8px 12px', background: canAfford ? 'var(--ac)' : 'var(--s1)',
                        border: `0.5px solid ${canAfford ? 'var(--ac)' : 'var(--b1)'}`,
                        borderRadius: 10, color: canAfford ? '#000' : 'var(--mu)',
                        fontSize: 11, fontWeight: 700, cursor: canAfford ? 'pointer' : 'default',
                      }}>🏅 {level.cost}</button>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--mu)' }}>🔒</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Recent activity log */}
      {log.length > 0 && (
        <div style={{ background: 'var(--s1)', border: '0.5px solid var(--b1)', borderRadius: 'var(--r)', padding: 12 }}>
          <div style={{ fontSize: 10, color: 'var(--mu)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>Farm Activity</div>
          {log.slice(0, 6).map((entry, i) => (
            <div key={i} style={{ fontSize: 11, color: 'var(--mu)', marginBottom: 5, display: 'flex', justifyContent: 'space-between' }}>
              <span>{entry.user_id === USER_ID ? '🏋️' : '🌸'} {entry.description}</span>
              <span style={{ color: entry.coins_delta > 0 ? 'var(--good)' : 'var(--danger)' }}>
                {entry.coins_delta > 0 ? '+' : ''}{entry.coins_delta}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: 24 }} />
    </div>
  )
}
