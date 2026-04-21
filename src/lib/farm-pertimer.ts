export type Animal = {
  id: string
  type: string
  name: string
  placedAt: string
  x: number // 0-100 position on farm
  y: number
  productionRate: number // farm coins per hour
  lastCollected: string
}

export type Crop = {
  id: string
  type: string
  plantedAt: string
  x: number
  y: number
  growthHours: number
  collected: boolean
}

export type Decoration = {
  id: string
  type: string
  x: number
  y: number
}

export type FarmState = {
  training_coins: number
  farm_coins: number
  animals: Animal[]
  crops: Crop[]
  decorations: Decoration[]
  farm_level: number
  total_training_coins_earned: number
  last_production_check: string
}

export const ANIMALS = {
  chicken: { label: 'Chicken', emoji: '🐔', cost: 15, rate: 0.5, maxPerLevel: [2,4,6,10], pixel: 'chicken' },
  cow:     { label: 'Cow',     emoji: '🐄', cost: 40, rate: 1.5, maxPerLevel: [1,2,4,6],  pixel: 'cow' },
  sheep:   { label: 'Sheep',   emoji: '🐑', cost: 60, rate: 1.0, maxPerLevel: [1,2,3,5],  pixel: 'sheep' },
  pig:     { label: 'Pig',     emoji: '🐷', cost: 100,rate: 2.0, maxPerLevel: [0,1,2,4],  pixel: 'pig' },
  horse:   { label: 'Horse',   emoji: '🐴', cost: 150,rate: 3.0, maxPerLevel: [0,0,1,2],  pixel: 'horse' },
  llama:   { label: 'Llama',   emoji: '🦙', cost: 200,rate: 5.0, maxPerLevel: [0,0,0,1],  pixel: 'llama' },
}

export const CROPS = {
  wheat:      { label: 'Wheat',      emoji: '🌾', cost: 5,  growthHours: 4,  reward: 3  },
  carrot:     { label: 'Carrot',     emoji: '🥕', cost: 5,  growthHours: 6,  reward: 4  },
  sunflower:  { label: 'Sunflower',  emoji: '🌻', cost: 25, growthHours: 24, reward: 20 },
  apple_tree: { label: 'Apple Tree', emoji: '🍎', cost: 75, growthHours: 72, reward: 50 },
  potato:     { label: 'Potato',     emoji: '🥔', cost: 5,  growthHours: 8,  reward: 6  },
}

export const DECORATIONS = {
  flower_patch: { label: 'Flower Patch', emoji: '🌺', cost: 10 },
  stone_path:   { label: 'Stone Path',   emoji: '🪨', cost: 20 },
  fountain:     { label: 'Fountain',     emoji: '⛲', cost: 30 },
  weathervane:  { label: 'Weathervane',  emoji: '🎠', cost: 40 },
  trophy:       { label: 'Trophy',       emoji: '🏆', cost: 75 },
}

export const FARM_LEVELS = [
  { level: 1, name: 'Starter Plot',   slots: 4,  label: 'Your first field' },
  { level: 2, name: 'Growing Farm',   slots: 8,  label: 'Barn unlocked', cost: 50 },
  { level: 3, name: 'Proper Farm',    slots: 14, label: 'Big fields', cost: 100 },
  { level: 4, name: 'Ironman Ranch',  slots: 20, label: 'Full estate', cost: 200 },
]

export function calcPendingFarmCoins(farm: FarmState): number {
  const now = Date.now()
  return farm.animals.reduce((total, animal) => {
    const info = ANIMALS[animal.type as keyof typeof ANIMALS]
    if (!info) return total
    const since = new Date(animal.lastCollected || animal.placedAt).getTime()
    const hours = (now - since) / 3600000
    return total + Math.floor(hours * info.rate)
  }, 0)
}

export function getCropStage(crop: Crop): 'seed' | 'sprout' | 'growing' | 'ready' {
  const elapsed = (Date.now() - new Date(crop.plantedAt).getTime()) / 3600000
  const pct = elapsed / crop.growthHours
  if (pct >= 1) return 'ready'
  if (pct >= 0.6) return 'growing'
  if (pct >= 0.2) return 'sprout'
  return 'seed'
}
