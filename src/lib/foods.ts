export const INGREDIENTS: Record<string, {
  l: string, u: string, mn: number, mx: number, st: number,
  k: number, p: number, c: number, f: number, isU?: boolean
}> = {
  maultasche: { l: 'Maultaschen (Bürger)', u: 'pcs', mn: 1, mx: 6, st: 1, k: 196, p: 8.6, c: 25, f: 6.4, isU: true },
  apfelmus: { l: 'Apfelmus (bio)', u: 'g', mn: 0, mx: 200, st: 10, k: 0.46, p: 0, c: 0.11, f: 0 },
  egg: { l: 'Eggs', u: 'pcs', mn: 1, mx: 6, st: 1, k: 75, p: 6.5, c: 0.4, f: 5.2, isU: true },
  oil: { l: 'Oil (sunflower)', u: 'tsp', mn: 0, mx: 4, st: 1, k: 45, p: 0, c: 0, f: 5, isU: true },
  farfalle: { l: 'Barilla Farfalle (dry)', u: 'g', mn: 40, mx: 200, st: 10, k: 3.59, p: 0.13, c: 0.71, f: 0.02 },
  pesto: { l: 'Barilla Pesto Rosso', u: 'g', mn: 10, mx: 120, st: 5, k: 3.28, p: 0.038, c: 0.107, f: 0.295 },
  schnitzel: { l: 'Schnitzel (breaded)', u: 'g', mn: 80, mx: 300, st: 10, k: 2.1, p: 0.16, c: 0.14, f: 0.1 },
  potato: { l: 'Potatoes (fresh)', u: 'g', mn: 0, mx: 400, st: 25, k: 0.77, p: 0.02, c: 0.17, f: 0 },
  carrot: { l: 'Carrots', u: 'g', mn: 0, mx: 200, st: 25, k: 0.41, p: 0.01, c: 0.09, f: 0 },
  paprika: { l: 'Paprika', u: 'g', mn: 0, mx: 200, st: 25, k: 0.31, p: 0.01, c: 0.06, f: 0 },
  nuernberger: { l: 'Nürnberger Rostbratwurst', u: 'pcs', mn: 2, mx: 14, st: 1, k: 70, p: 2.9, c: 0.2, f: 6.3, isU: true },
  rahm: { l: 'Iglo Rahm-Gemüse', u: 'g', mn: 50, mx: 500, st: 25, k: 0.54, p: 0.018, c: 0.054, f: 0.024 },
  fisch: { l: 'Iglo Fischstäbchen', u: 'pcs', mn: 3, mx: 15, st: 1, k: 50, p: 3.3, c: 3.4, f: 1.9, isU: true },
  broccoli: { l: 'Broccoli', u: 'g', mn: 50, mx: 300, st: 25, k: 0.34, p: 0.03, c: 0.04, f: 0 },
  rice: { l: 'Oryza Basmati & Wildreis (dry)', u: 'g', mn: 30, mx: 150, st: 10, k: 3.52, p: 0.095, c: 0.74, f: 0.011 },
  chicken: { l: 'Chicken breast (fresh)', u: 'g', mn: 50, mx: 300, st: 25, k: 1.1, p: 0.23, c: 0, f: 0.02 },
  turkey: { l: 'Turkey breast (fresh)', u: 'g', mn: 50, mx: 300, st: 25, k: 1.07, p: 0.24, c: 0, f: 0.01 },
  skyr: { l: 'Skyr (plain)', u: 'g', mn: 50, mx: 400, st: 25, k: 0.6, p: 0.1, c: 0.04, f: 0 },
  lyoner: { l: 'Hähnchen Lyoner (bio)', u: 'slices', mn: 0, mx: 8, st: 1, k: 42, p: 3.5, c: 0.5, f: 3, isU: true },
  toast: { l: 'Vollkorn Toast (G&G)', u: 'slices', mn: 1, mx: 6, st: 1, k: 62, p: 2.4, c: 10.3, f: 0.9, isU: true },
  tilsiter: { l: 'Tilsiter (slice ~20g)', u: 'slices', mn: 0, mx: 6, st: 1, k: 65, p: 4.8, c: 0.1, f: 5, isU: true },
  mais: { l: 'Mais (canned)', u: 'g', mn: 0, mx: 150, st: 25, k: 0.86, p: 0.03, c: 0.16, f: 0.01 },
  beans: { l: 'Green beans', u: 'g', mn: 0, mx: 200, st: 25, k: 0.31, p: 0.02, c: 0.05, f: 0 },
  oats: { l: 'Oats', u: 'g', mn: 30, mx: 150, st: 10, k: 3.72, p: 0.13, c: 0.6, f: 0.07 },
  milk: { l: 'Whole milk', u: 'ml', mn: 100, mx: 400, st: 50, k: 0.61, p: 0.033, c: 0.047, f: 0.034 },
  muesli: { l: 'Muesli', u: 'g', mn: 30, mx: 150, st: 10, k: 3.55, p: 0.09, c: 0.63, f: 0.06 },
  banana: { l: 'Banana', u: 'pcs', mn: 1, mx: 3, st: 1, k: 100, p: 1.2, c: 23, f: 0.3, isU: true },
  isoclear: { l: 'ESN Isoclear (powder)', u: 'g', mn: 15, mx: 60, st: 5, k: 3.48, p: 0.81, c: 0.023, f: 0 },
  designerwhey: { l: 'ESN Designer Whey (powder)', u: 'g', mn: 15, mx: 60, st: 5, k: 3.87, p: 0.77, c: 0.063, f: 0.054 },
  nuts: { l: 'Mixed nuts', u: 'g', mn: 10, mx: 80, st: 5, k: 6.28, p: 0.18, c: 0.2, f: 0.55 },
  cucumber: { l: 'Cucumber', u: 'g', mn: 50, mx: 300, st: 50, k: 0.12, p: 0.007, c: 0.018, f: 0.001 },
  pizza: { l: 'Pizza slice (restaurant avg)', u: 'slices', mn: 1, mx: 6, st: 1, k: 285, p: 12, c: 33, f: 11, isU: true },
  steak: { l: 'Steak', u: 'g', mn: 100, mx: 400, st: 25, k: 2.71, p: 0.26, c: 0, f: 0.17 },
  wrap: { l: 'Tortilla wrap', u: 'pcs', mn: 1, mx: 2, st: 1, k: 220, p: 6, c: 38, f: 5, isU: true },
  tomatosoup: { l: 'Tomato soup', u: 'ml', mn: 200, mx: 600, st: 50, k: 0.4, p: 0.015, c: 0.065, f: 0.012 },
  vegsoup: { l: 'Vegetable soup', u: 'ml', mn: 200, mx: 600, st: 50, k: 0.3, p: 0.01, c: 0.05, f: 0.005 },
  salad: { l: 'Mixed salad', u: 'g', mn: 50, mx: 250, st: 25, k: 0.15, p: 0.01, c: 0.02, f: 0.002 },
  ehrmann: { l: 'Ehrmann HP Pudding', u: 'pots', mn: 1, mx: 2, st: 1, k: 180, p: 20, c: 15, f: 4, isU: true },
  corny: { l: 'Corny Schoko-Banana', u: 'bars', mn: 1, mx: 3, st: 1, k: 190, p: 3, c: 28, f: 7, isU: true },
  chocolate: { l: 'Chocolate (Tafel ~100g)', u: 'squares', mn: 1, mx: 20, st: 1, k: 28, p: 0.4, c: 3, f: 1.6, isU: true },
  chips: { l: 'Chips (Lays/Pringles)', u: 'g', mn: 10, mx: 200, st: 10, k: 5.36, p: 0.06, c: 0.53, f: 0.34 },
  biscuits: { l: 'Biscuits (e.g. Leibniz)', u: 'pcs', mn: 1, mx: 10, st: 1, k: 48, p: 0.7, c: 7.2, f: 1.8, isU: true },
  icecream: { l: 'Ice cream (scoop)', u: 'scoops', mn: 1, mx: 5, st: 1, k: 130, p: 2, c: 18, f: 5.5, isU: true },
  beer: { l: 'Beer (0.5L Pils)', u: 'bottles', mn: 1, mx: 5, st: 1, k: 215, p: 1.7, c: 16, f: 0, isU: true },
  wine: { l: 'Wine (glass 150ml)', u: 'glasses', mn: 1, mx: 5, st: 1, k: 122, p: 0.1, c: 3.8, f: 0, isU: true },
  kroketten: { l: 'Kroketten', u: 'pcs', mn: 1, mx: 10, st: 1, k: 65, p: 1.2, c: 7, f: 3.5, isU: true },
  fries: { l: 'Fries (restaurant portion)', u: 'g', mn: 50, mx: 300, st: 25, k: 3.12, p: 0.04, c: 0.38, f: 0.15 },
}

export type Ingredient = { k: string; d: number }

export function calcMacros(ings: Ingredient[], vals: Record<string, number>) {
  let kcal = 0, p = 0, c = 0, f = 0
  ings.forEach(ig => {
    const v = vals[ig.k] !== undefined ? vals[ig.k] : ig.d
    const info = INGREDIENTS[ig.k]
    if (!info) return
    kcal += info.k * v
    p += info.p * v
    c += info.c * v
    f += info.f * v
  })
  return {
    kcal: Math.round(kcal),
    p: Math.round(p * 10) / 10,
    c: Math.round(c * 10) / 10,
    f: Math.round(f * 10) / 10
  }
}

export const FIXED_DINNERS = [
  { name: 'Maultaschen airfryer + Apfelmus', tip: 'Lower fat. Good on rest days.', ings: [{ k: 'maultasche', d: 3 }, { k: 'apfelmus', d: 100 }] },
  { name: 'Maultaschen with eggs in pan', tip: 'Good protein from eggs. Minimal oil.', ings: [{ k: 'maultasche', d: 3 }, { k: 'egg', d: 2 }, { k: 'oil', d: 1 }] },
  { name: 'Pasta with Pesto Rosso (Barilla)', tip: 'High carb — best on ride or run days.', ings: [{ k: 'farfalle', d: 100 }, { k: 'pesto', d: 40 }] },
  { name: 'Schnitzel + veggies + potatoes', tip: 'Best macro balance of your fixed dinners.', ings: [{ k: 'schnitzel', d: 150 }, { k: 'potato', d: 200 }, { k: 'carrot', d: 100 }, { k: 'paprika', d: 100 }] },
  { name: 'Nürnberger + Iglo Rahm-Gemüse', tip: 'High fat, low carb. Load carbs at breakfast.', ings: [{ k: 'nuernberger', d: 8 }, { k: 'rahm', d: 250 }] },
  { name: 'Fish sticks + broccoli + rice', tip: 'Solid balanced dinner. Good protein and carbs.', ings: [{ k: 'fisch', d: 10 }, { k: 'broccoli', d: 200 }, { k: 'rice', d: 80 }] },
  { name: 'Going out — Schnitzel', tip: 'Eat light all day. Skip or share the fries.', ings: [{ k: 'schnitzel', d: 200 }, { k: 'potato', d: 150 }, { k: 'kroketten', d: 0 }] },
  { name: 'Going out — Pizza', tip: 'Highest carb dinner. Keep rest of day lean.', ings: [{ k: 'pizza', d: 3 }] },
  { name: 'Going out — Steak', tip: 'Best protein when eating out. Great choice.', ings: [{ k: 'steak', d: 250 }, { k: 'paprika', d: 100 }, { k: 'fries', d: 0 }] },
  { name: 'Döner', tip: 'Skip extra sauce. Easy on the bread.', ings: [{ k: 'schnitzel', d: 100 }, { k: 'farfalle', d: 0 }, { k: 'salad', d: 100 }, { k: 'pizza', d: 1 }] },
]

export const SUGGESTED_DINNERS = [
  { name: 'Scrambled eggs + toast', ings: [{ k: 'egg', d: 3 }, { k: 'toast', d: 2 }, { k: 'oil', d: 1 }] },
  { name: 'Fried eggs + potatoes', ings: [{ k: 'egg', d: 2 }, { k: 'potato', d: 250 }, { k: 'oil', d: 1 }] },
  { name: 'Rice + fried egg + soy sauce', ings: [{ k: 'rice', d: 80 }, { k: 'egg', d: 2 }, { k: 'oil', d: 1 }] },
  { name: 'Omelette + Tilsiter + veg', ings: [{ k: 'egg', d: 3 }, { k: 'tilsiter', d: 1 }, { k: 'paprika', d: 100 }, { k: 'carrot', d: 100 }] },
  { name: 'Toast + Tilsiter + Lyoner', ings: [{ k: 'toast', d: 3 }, { k: 'tilsiter', d: 2 }, { k: 'lyoner', d: 3 }] },
  { name: 'Bread + Lyoner + hardboiled eggs', ings: [{ k: 'toast', d: 3 }, { k: 'lyoner', d: 3 }, { k: 'egg', d: 2 }] },
  { name: 'Fried rice + egg + veg', ings: [{ k: 'rice', d: 80 }, { k: 'egg', d: 2 }, { k: 'paprika', d: 100 }, { k: 'mais', d: 80 }, { k: 'oil', d: 1 }] },
  { name: 'Potatoes + Skyr + cucumber', ings: [{ k: 'potato', d: 300 }, { k: 'skyr', d: 150 }, { k: 'cucumber', d: 100 }] },
  { name: 'Veg stir fry + rice', ings: [{ k: 'rice', d: 80 }, { k: 'carrot', d: 100 }, { k: 'paprika', d: 100 }, { k: 'beans', d: 100 }, { k: 'oil', d: 1 }] },
  { name: 'Airfryer chicken + rice + veg', ings: [{ k: 'chicken', d: 175 }, { k: 'rice', d: 80 }, { k: 'paprika', d: 100 }, { k: 'carrot', d: 100 }] },
  { name: 'Airfryer chicken + potatoes + carrots', ings: [{ k: 'chicken', d: 175 }, { k: 'potato', d: 250 }, { k: 'carrot', d: 150 }] },
  { name: 'Airfryer turkey + potatoes + beans', ings: [{ k: 'turkey', d: 175 }, { k: 'potato', d: 250 }, { k: 'beans', d: 150 }] },
  { name: 'Turkey stir fry + rice + veg', ings: [{ k: 'turkey', d: 175 }, { k: 'rice', d: 80 }, { k: 'paprika', d: 100 }, { k: 'mais', d: 80 }] },
  { name: 'Boiled potatoes + fried egg + veg', ings: [{ k: 'potato', d: 250 }, { k: 'egg', d: 2 }, { k: 'paprika', d: 100 }, { k: 'carrot', d: 100 }] },
  { name: 'Chicken rice bowl + mais + paprika', ings: [{ k: 'chicken', d: 175 }, { k: 'rice', d: 80 }, { k: 'mais', d: 80 }, { k: 'paprika', d: 100 }] },
  { name: 'Potatoes + carrots + fried egg', ings: [{ k: 'potato', d: 250 }, { k: 'carrot', d: 150 }, { k: 'egg', d: 2 }, { k: 'oil', d: 1 }] },
  { name: 'Baked potatoes + Tilsiter + mais', ings: [{ k: 'potato', d: 300 }, { k: 'tilsiter', d: 2 }, { k: 'mais', d: 80 }, { k: 'paprika', d: 100 }] },
  { name: 'Potatoes + beans + egg', ings: [{ k: 'potato', d: 250 }, { k: 'beans', d: 150 }, { k: 'egg', d: 2 }] },
  { name: 'Airfryer wedges + Skyr dip + veg', ings: [{ k: 'potato', d: 300 }, { k: 'skyr', d: 150 }, { k: 'paprika', d: 100 }] },
  { name: 'Skyr + banana + ESN Isoclear (lazy)', tip: 'High protein, zero cooking.', ings: [{ k: 'skyr', d: 200 }, { k: 'banana', d: 1 }, { k: 'isoclear', d: 30 }] },
  { name: 'Lyoner + Tilsiter + rice', ings: [{ k: 'lyoner', d: 4 }, { k: 'tilsiter', d: 2 }, { k: 'rice', d: 80 }] },
  { name: 'Chicken + broccoli + rice', ings: [{ k: 'chicken', d: 175 }, { k: 'broccoli', d: 200 }, { k: 'rice', d: 80 }] },
  { name: 'Turkey + broccoli + potatoes', ings: [{ k: 'turkey', d: 175 }, { k: 'broccoli', d: 200 }, { k: 'potato', d: 200 }] },
  { name: 'Egg + mais + paprika rice bowl', ings: [{ k: 'rice', d: 80 }, { k: 'egg', d: 2 }, { k: 'mais', d: 80 }, { k: 'paprika', d: 100 }, { k: 'oil', d: 1 }] },
]

export const BREAKFASTS = [
  { name: 'Oats with milk', ings: [{ k: 'oats', d: 80 }, { k: 'milk', d: 200 }] },
  { name: 'Muesli with milk', ings: [{ k: 'muesli', d: 70 }, { k: 'milk', d: 200 }] },
  { name: 'Skyr with fruit', ings: [{ k: 'skyr', d: 200 }, { k: 'banana', d: 1 }] },
  { name: 'Scrambled eggs', ings: [{ k: 'egg', d: 3 }, { k: 'oil', d: 1 }] },
  { name: 'Fried eggs + Vollkorn toast', ings: [{ k: 'egg', d: 2 }, { k: 'toast', d: 2 }, { k: 'oil', d: 1 }] },
  { name: 'Toast + Tilsiter', ings: [{ k: 'toast', d: 2 }, { k: 'tilsiter', d: 2 }] },
  { name: 'Banana + ESN Isoclear (water)', ings: [{ k: 'banana', d: 1 }, { k: 'isoclear', d: 30 }] },
  { name: 'Banana + ESN Designer Whey (milk)', ings: [{ k: 'banana', d: 1 }, { k: 'designerwhey', d: 30 }, { k: 'milk', d: 300 }] },
  { name: 'Hardboiled eggs + cucumber', ings: [{ k: 'egg', d: 2 }, { k: 'cucumber', d: 150 }] },
  { name: 'Ehrmann High Protein Pudding', ings: [{ k: 'ehrmann', d: 1 }] },
]

export const LUNCHES = [
  { name: 'Rice + chicken', ings: [{ k: 'rice', d: 80 }, { k: 'chicken', d: 150 }, { k: 'paprika', d: 50 }] },
  { name: 'Toast + Lyoner + Tilsiter', ings: [{ k: 'toast', d: 3 }, { k: 'lyoner', d: 3 }, { k: 'tilsiter', d: 2 }] },
  { name: 'Toast + cucumber + Tilsiter (veg)', ings: [{ k: 'toast', d: 3 }, { k: 'cucumber', d: 100 }, { k: 'tilsiter', d: 2 }] },
  { name: 'Tomato soup + toast', ings: [{ k: 'tomatosoup', d: 400 }, { k: 'toast', d: 2 }] },
  { name: 'Vegetable soup + toast', ings: [{ k: 'vegsoup', d: 400 }, { k: 'toast', d: 2 }] },
  { name: 'Salad + chicken', ings: [{ k: 'salad', d: 150 }, { k: 'chicken', d: 180 }, { k: 'cucumber', d: 100 }] },
  { name: 'Salad + hardboiled eggs (veg)', ings: [{ k: 'salad', d: 150 }, { k: 'egg', d: 2 }, { k: 'cucumber', d: 100 }] },
  { name: 'Wrap + chicken', ings: [{ k: 'wrap', d: 1 }, { k: 'chicken', d: 150 }, { k: 'paprika', d: 80 }, { k: 'cucumber', d: 80 }] },
  { name: "McDonald's — Double Cheeseburger", ings: [], fixed: { kcal: 440, p: 25, c: 35, f: 20 } },
  { name: 'Leftovers from dinner', ings: [], fixed: { kcal: 380, p: 18, c: 38, f: 14 } },
] as any[]

export const SNACKS = [
  { name: 'Skyr', ings: [{ k: 'skyr', d: 150 }] },
  { name: 'Corny Schoko-Banana bar', ings: [{ k: 'corny', d: 1 }] },
  { name: 'Banana', ings: [{ k: 'banana', d: 1 }] },
  { name: 'Handful of nuts', ings: [{ k: 'nuts', d: 30 }] },
  { name: 'Ehrmann High Protein Pudding', ings: [{ k: 'ehrmann', d: 1 }] },
  { name: 'ESN Isoclear (water)', ings: [{ k: 'isoclear', d: 30 }] },
  { name: 'ESN Designer Whey (milk)', ings: [{ k: 'designerwhey', d: 30 }, { k: 'milk', d: 300 }] },
  { name: 'Cucumber + Tilsiter', ings: [{ k: 'cucumber', d: 150 }, { k: 'tilsiter', d: 2 }] },
  { name: 'Chocolate', ings: [{ k: 'chocolate', d: 4 }] },
  { name: 'Chips', ings: [{ k: 'chips', d: 50 }] },
  { name: 'Biscuits (Leibniz)', ings: [{ k: 'biscuits', d: 3 }] },
  { name: 'Ice cream', ings: [{ k: 'icecream', d: 2 }] },
  { name: 'Beer (0.5L)', ings: [{ k: 'beer', d: 1 }] },
  { name: 'Wine (glass)', ings: [{ k: 'wine', d: 1 }] },
]

export const TRAINING_TARGETS: Record<string, {
  label: string
  kcal: number
  protein: number
  carbs: number
  fat: number
  tip: string
  color: string
}> = {
  rest: { label: 'Rest Day', kcal: 1750, protein: 160, carbs: 160, fat: 55, tip: 'Focus on protein and vegetables today. No need to load carbs.', color: '#888' },
  strength: { label: 'Strength Session', kcal: 1850, protein: 170, carbs: 170, fat: 55, tip: 'Slightly higher protein today. Eat a good meal within 45min post-workout.', color: '#c0a0ff' },
  ride: { label: 'Zone 2 Ride', kcal: 1950, protein: 155, carbs: 200, fat: 55, tip: 'Prioritize carbs today — fuel for the ride and recovery after.', color: '#c8f050' },
  run: { label: 'Zone 2 Run', kcal: 2050, protein: 160, carbs: 210, fat: 55, tip: 'Carbs before the run, protein after. Watch the knee — no valgus stress.', color: '#50c878' },
  longride: { label: 'Long Ride (Sat)', kcal: 2200, protein: 155, carbs: 250, fat: 60, tip: 'Highest carb day. Eat on the bike every hour. Post-ride meal is critical.', color: '#f0a050' },
}

export const ACHIEVEMENTS = [
  // Nutrition streaks
  { key: 'streak_3', title: '3 Day Streak', desc: 'Log meals and stay in range 3 days in a row', icon: '🔥', category: 'nutrition' },
  { key: 'streak_7', title: 'Week Warrior', desc: '7 day streak — full week logged and in range', icon: '🔥', category: 'nutrition' },
  { key: 'streak_14', title: 'Two Week Machine', desc: '14 days straight — this is becoming a habit', icon: '🔥', category: 'nutrition' },
  { key: 'streak_30', title: 'Month of Discipline', desc: '30 day streak — seriously impressive', icon: '🔥', category: 'nutrition' },
  { key: 'streak_100', title: 'Century Streak', desc: '100 consecutive days. Absolute beast.', icon: '🏆', category: 'nutrition' },
  { key: 'protein_7', title: 'Protein Week', desc: 'Hit protein target 7 days in a row', icon: '💪', category: 'nutrition' },
  { key: 'protein_14', title: 'Protein Machine', desc: 'Hit protein target 14 days in a row', icon: '💪', category: 'nutrition' },
  { key: 'protein_30', title: 'Protein Master', desc: 'Hit protein target 30 days in a row', icon: '💪', category: 'nutrition' },
  { key: 'water_7', title: 'Hydration Week', desc: 'Hit water target 7 days in a row', icon: '💧', category: 'nutrition' },
  { key: 'water_30', title: 'Hydration Master', desc: 'Hit water target 30 days in a row', icon: '💧', category: 'nutrition' },

  // Weight loss
  { key: 'weight_2kg', title: 'First 2kg', desc: 'Lost your first 2kg. The journey begins.', icon: '⚖️', category: 'body' },
  { key: 'weight_5kg', title: 'First 5kg', desc: '5kg down. People are starting to notice.', icon: '⚖️', category: 'body' },
  { key: 'weight_10kg', title: '10kg Down', desc: 'Halfway to race weight. Incredible progress.', icon: '⚖️', category: 'body' },
  { key: 'weight_15kg', title: '15kg Down', desc: 'Only 5kg to go. You can see the finish line.', icon: '⚖️', category: 'body' },
  { key: 'weight_20kg', title: 'Race Weight Achieved', desc: '20kg lost. You did it. Full transformation.', icon: '🏆', category: 'body' },
  { key: 'bf_30', title: 'Under 30% Body Fat', desc: 'Crossed the 30% threshold. Keep going.', icon: '📉', category: 'body' },
  { key: 'bf_25', title: 'Under 25% Body Fat', desc: 'Down to 25%. Real visible difference now.', icon: '📉', category: 'body' },
  { key: 'bf_20', title: 'Under 20% Body Fat', desc: 'Under 20%. You look like an athlete.', icon: '📉', category: 'body' },
  { key: 'bf_18', title: 'Race Body Composition', desc: '18% body fat — Ironman ready.', icon: '🏆', category: 'body' },

  // Running
  { key: 'run_first', title: 'First Run', desc: 'Completed your first logged run', icon: '🏃', category: 'run' },
  { key: 'run_5k', title: 'First 5K', desc: 'Ran 5km in a single session', icon: '🏃', category: 'run' },
  { key: 'run_10k', title: 'First 10K', desc: 'Ran 10km in a single session. Serious runner.', icon: '🏃', category: 'run' },
  { key: 'run_half', title: 'Half Marathon', desc: 'Ran 21.1km. This is huge for the Ironman.', icon: '🥈', category: 'run' },
  { key: 'run_marathon', title: 'Marathon', desc: '42.2km. One of the hardest things a human can do.', icon: '🥇', category: 'run' },
  { key: 'run_50km_month', title: '50km Month', desc: 'Ran 50km total in a single month', icon: '📅', category: 'run' },
  { key: 'run_100km_month', title: '100km Month', desc: 'Ran 100km in a month. Elite territory.', icon: '📅', category: 'run' },
  { key: 'run_500km_total', title: '500km Total', desc: 'Half a thousand kilometres on foot. Respect.', icon: '🗺️', category: 'run' },
  { key: 'run_germany', title: 'Run Germany', desc: 'Ran 876km total — the length of Germany', icon: '🇩🇪', category: 'run' },

  // Cycling
  { key: 'ride_first', title: 'First Ride', desc: 'Completed your first logged ride on the Cipollini', icon: '🚴', category: 'ride' },
  { key: 'ride_50k', title: 'First 50K Ride', desc: '50km in one session on the Cipollini', icon: '🚴', category: 'ride' },
  { key: 'ride_100k', title: 'Century Ride', desc: '100km in one session. A proper cyclist now.', icon: '🚴', category: 'ride' },
  { key: 'ride_180k', title: 'Ironman Bike Distance', desc: '180km in one ride. You are ready.', icon: '🏆', category: 'ride' },
  { key: 'ride_200km_month', title: '200km Month', desc: 'Rode 200km total in a month', icon: '📅', category: 'ride' },
  { key: 'ride_500km_month', title: '500km Month', desc: 'Rode 500km in a month. Serious training.', icon: '📅', category: 'ride' },
  { key: 'ride_1000km_total', title: '1000km Total', desc: 'One thousand kilometres on the Cipollini.', icon: '🗺️', category: 'ride' },
  { key: 'ride_rome', title: 'Cycle to Rome', desc: '1400km total — you could have ridden to Rome', icon: '🇮🇹', category: 'ride' },
  { key: 'ride_5000km_total', title: '5000km Total', desc: 'Five thousand kilometres. You are a machine.', icon: '🗺️', category: 'ride' },

  // Elevation
  { key: 'elev_everest', title: 'Climb Everest', desc: '8849m total elevation gain — you climbed Everest', icon: '🏔️', category: 'ride' },
  { key: 'elev_3everest', title: 'Everest × 3', desc: '26547m total elevation. Absolutely insane.', icon: '🏔️', category: 'ride' },

  // Training consistency
  { key: 'sessions_10', title: '10 Sessions', desc: 'Completed 10 training sessions', icon: '✅', category: 'consistency' },
  { key: 'sessions_50', title: '50 Sessions', desc: '50 training sessions logged. Committed.', icon: '✅', category: 'consistency' },
  { key: 'sessions_100', title: '100 Sessions', desc: '100 training sessions. This is your life now.', icon: '✅', category: 'consistency' },
  { key: 'perfect_week', title: 'Perfect Week', desc: 'All planned sessions completed in a week', icon: '⭐', category: 'consistency' },
  { key: 'perfect_month', title: 'Perfect Month', desc: 'All planned sessions completed in a month', icon: '⭐', category: 'consistency' },
  { key: 'never_miss_monday', title: 'Never Miss a Monday', desc: 'Logged weigh-in every Monday for 8 weeks', icon: '📆', category: 'consistency' },

  // Ironman journey
  { key: 'ironman_first_swim', title: 'First Open Water Swim', desc: 'Completed your first open water swim', icon: '🏊', category: 'ironman' },
  { key: 'ironman_sprint', title: 'Sprint Triathlon', desc: 'Completed a sprint triathlon. You are a triathlete.', icon: '🥉', category: 'ironman' },
  { key: 'ironman_olympic', title: 'Olympic Triathlon', desc: 'Completed an Olympic distance triathlon', icon: '🥈', category: 'ironman' },
  { key: 'ironman_703', title: 'Half Ironman 70.3', desc: 'Finished a 70.3. Half way to the dream.', icon: '🥇', category: 'ironman' },
  { key: 'ironman_finish', title: '🔱 IRONMAN FINISHER', desc: 'You are an Ironman. September 2027. You did it.', icon: '🔱', category: 'ironman' },
]
