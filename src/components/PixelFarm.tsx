'use client'
import { useEffect, useRef } from 'react'
import { FarmState, ANIMALS, CROPS, getCropStage } from '@/lib/farm'

const PALETTE = {
  grass:      '#5a8a3c',
  grassLight: '#6aa84f',
  soil:       '#8b5e3c',
  soilDark:   '#6b4226',
  path:       '#c8a96e',
  water:      '#4a90d9',
  sky:        '#1a1a2e',
  skyDay:     '#2d5a8e',
  fence:      '#8b6914',
  fenceLight: '#c8a020',
  wheat1:     '#c8a020',
  wheat2:     '#e8c840',
  green1:     '#2d7a2d',
  green2:     '#4aaa4a',
  red:        '#cc2222',
  white:      '#f0f0f0',
  brown:      '#8b4513',
  darkBrown:  '#5c2d0a',
  pink:       '#ffaacc',
  orange:     '#ff8800',
  yellow:     '#ffdd00',
  black:      '#111111',
  gray:       '#888888',
  lightGray:  '#cccccc',
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

function drawGrass(ctx: CanvasRenderingContext2D, W: number, H: number) {
  // Sky
  ctx.fillStyle = '#1a2a4a'
  ctx.fillRect(0, 0, W, H * 0.25)

  // Stars
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  const stars = [[20,8],[45,15],[80,5],[110,12],[140,7],[170,3],[200,10],[230,6],[260,14],[290,4]]
  stars.forEach(([x, y]) => ctx.fillRect(x % W, y, 1, 1))

  // Ground base
  ctx.fillStyle = PALETTE.grass
  ctx.fillRect(0, H * 0.25, W, H * 0.75)

  // Grass texture stripes
  ctx.fillStyle = PALETTE.grassLight
  for (let i = 0; i < W; i += 8) {
    ctx.fillRect(i, H * 0.25, 2, H * 0.75)
  }

  // Dirt path horizontal
  ctx.fillStyle = PALETTE.path
  ctx.fillRect(0, H * 0.72, W, 10)
  ctx.fillStyle = '#b8955a'
  ctx.fillRect(0, H * 0.72, W, 2)
}

function drawFence(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const y = H * 0.28
  // Fence posts
  ctx.fillStyle = PALETTE.fence
  for (let x = 0; x < W; x += 20) {
    px(ctx, x, y, 4, 16, PALETTE.fenceLight)
    px(ctx, x+1, y+16, 2, 8, PALETTE.fence)
  }
  // Rails
  px(ctx, 0, y+4, W, 3, PALETTE.fenceLight)
  px(ctx, 0, y+10, W, 2, PALETTE.fence)
}

function drawPixelChicken(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const ox = frame % 2 === 0 ? 0 : 1
  // Body
  px(ctx, x+2, y+4, 8, 6, PALETTE.white)
  // Head
  px(ctx, x+7, y+1, 5, 4, PALETTE.white)
  // Beak
  px(ctx, x+11, y+2, 2, 2, PALETTE.orange)
  // Eye
  px(ctx, x+9, y+2, 1, 1, PALETTE.black)
  // Comb
  px(ctx, x+8, y, 3, 2, PALETTE.red)
  // Wing
  px(ctx, x+3, y+5, 4, 3, PALETTE.lightGray)
  // Legs
  px(ctx, x+4+ox, y+10, 2, 3, PALETTE.orange)
  px(ctx, x+7-ox, y+10, 2, 3, PALETTE.orange)
  // Feet
  px(ctx, x+3+ox, y+12, 3, 1, PALETTE.orange)
  px(ctx, x+6-ox, y+12, 3, 1, PALETTE.orange)
}

function drawPixelCow(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const ox = frame % 2 === 0 ? 0 : 1
  // Body
  px(ctx, x+2, y+4, 14, 9, PALETTE.white)
  // Spots
  px(ctx, x+5, y+5, 3, 3, '#333333')
  px(ctx, x+10, y+7, 2, 2, '#333333')
  // Head
  px(ctx, x+13, y+2, 7, 6, PALETTE.white)
  // Snout
  px(ctx, x+17, y+5, 4, 3, PALETTE.pink)
  px(ctx, x+18, y+6, 1, 1, '#cc6688')
  px(ctx, x+20, y+6, 1, 1, '#cc6688')
  // Eye
  px(ctx, x+14, y+3, 2, 2, PALETTE.black)
  px(ctx, x+14, y+3, 1, 1, '#ffffff')
  // Horns
  px(ctx, x+14, y, 2, 3, PALETTE.wheat1)
  px(ctx, x+18, y, 2, 3, PALETTE.wheat1)
  // Legs
  px(ctx, x+3, y+13, 3, 5+ox, PALETTE.lightGray)
  px(ctx, x+8, y+13, 3, 4-ox, PALETTE.lightGray)
  px(ctx, x+12, y+13, 3, 4+ox, PALETTE.lightGray)
  px(ctx, x+16, y+13, 3, 5-ox, PALETTE.lightGray)
  // Hooves
  px(ctx, x+3, y+18, 3, 2, PALETTE.darkBrown)
  px(ctx, x+8, y+17, 3, 2, PALETTE.darkBrown)
  px(ctx, x+12, y+18, 3, 2, PALETTE.darkBrown)
  px(ctx, x+16, y+17, 3, 2, PALETTE.darkBrown)
  // Udder
  px(ctx, x+6, y+12, 5, 3, PALETTE.pink)
  // Tail
  px(ctx, x, y+6, 2, 1, PALETTE.lightGray)
  px(ctx, x-1, y+5, 2, 2, PALETTE.lightGray)
}

function drawPixelSheep(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const ox = frame % 2 === 0 ? 0 : 1
  // Fluffy body — multiple white blocks
  px(ctx, x+2, y+3, 10, 8, PALETTE.white)
  px(ctx, x, y+5, 4, 5, PALETTE.white)
  px(ctx, x+10, y+4, 4, 6, PALETTE.white)
  px(ctx, x+3, y+2, 8, 3, PALETTE.white)
  // Head
  px(ctx, x+10, y+2, 5, 5, '#e8e0d0')
  // Eye
  px(ctx, x+11, y+3, 2, 2, PALETTE.black)
  px(ctx, x+11, y+3, 1, 1, PALETTE.white)
  // Ear
  px(ctx, x+14, y+3, 2, 3, PALETTE.pink)
  // Nose
  px(ctx, x+13, y+5, 2, 1, PALETTE.pink)
  // Legs
  px(ctx, x+3, y+11, 2, 4+ox, '#888')
  px(ctx, x+6, y+11, 2, 3-ox, '#888')
  px(ctx, x+9, y+11, 2, 4+ox, '#888')
  px(ctx, x+12, y+11, 2, 3-ox, '#888')
}

function drawPixelPig(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const ox = frame % 2 === 0 ? 0 : 1
  const pink = '#ffaacc'
  const dpink = '#ee88aa'
  px(ctx, x+2, y+4, 12, 8, pink)
  px(ctx, x+11, y+2, 7, 6, pink)
  px(ctx, x+15, y+4, 4, 4, dpink)
  px(ctx, x+16, y+5, 1, 1, PALETTE.black)
  px(ctx, x+18, y+5, 1, 1, PALETTE.black)
  px(ctx, x+12, y+3, 2, 2, PALETTE.black)
  px(ctx, x+1, y+4, 3, 3, pink)
  px(ctx, x, y+3, 2, 2, pink)
  px(ctx, x+3, y+12, 3, 4+ox, dpink)
  px(ctx, x+7, y+12, 3, 3-ox, dpink)
  px(ctx, x+11, y+12, 3, 4+ox, dpink)
  px(ctx, x+14, y+12, 3, 3-ox, dpink)
  // Curly tail
  px(ctx, x+1, y+5, 1, 2, dpink)
  px(ctx, x+2, y+4, 1, 1, dpink)
}

function drawPixelHorse(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const ox = frame % 2 === 0 ? 0 : 2
  const brown = '#8b4513'
  const dbrown = '#5c2d0a'
  px(ctx, x+2, y+3, 16, 10, brown)
  px(ctx, x+15, y, 7, 7, brown)
  px(ctx, x+19, y+4, 4, 3, '#c8a882')
  px(ctx, x+16, y+1, 2, 2, PALETTE.black)
  px(ctx, x+16, y+1, 1, 1, PALETTE.white)
  px(ctx, x+14, y-2, 3, 4, dbrown)
  px(ctx, x+15, y-4, 2, 3, dbrown)
  px(ctx, x+13, y-1, 5, 2, '#222')
  px(ctx, x+3, y+13, 3, 6+ox, brown)
  px(ctx, x+7, y+13, 3, 5-ox, brown)
  px(ctx, x+12, y+13, 3, 6+ox, brown)
  px(ctx, x+16, y+13, 3, 5-ox, brown)
  px(ctx, x+3, y+18, 3, 2, dbrown)
  px(ctx, x+7, y+17, 3, 2, dbrown)
  px(ctx, x+12, y+18, 3, 2, dbrown)
  px(ctx, x+16, y+17, 3, 2, dbrown)
  px(ctx, x, y+6, 2, 5, dbrown)
}

function drawPixelLlama(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const ox = frame % 2 === 0 ? 0 : 1
  const cream = '#f5deb3'
  const dcream = '#c8a882'
  px(ctx, x+3, y+5, 12, 9, cream)
  px(ctx, x+12, y-2, 4, 9, cream)
  px(ctx, x+10, y+8, 4, 3, '#ffd700')
  px(ctx, x+13, y-1, 2, 2, PALETTE.black)
  px(ctx, x+14, y-2, 3, 3, cream)
  px(ctx, x+15, y-3, 2, 2, cream)
  px(ctx, x+4, y+14, 3, 5+ox, dcream)
  px(ctx, x+8, y+14, 3, 4-ox, dcream)
  px(ctx, x+12, y+14, 3, 5+ox, dcream)
  px(ctx, x+15, y+14, 3, 4-ox, dcream)
  px(ctx, x+2, y+7, 2, 1, cream)
}

function drawAnimal(ctx: CanvasRenderingContext2D, type: string, x: number, y: number, frame: number) {
  switch (type) {
    case 'chicken': drawPixelChicken(ctx, x, y, frame); break
    case 'cow':     drawPixelCow(ctx, x, y, frame); break
    case 'sheep':   drawPixelSheep(ctx, x, y, frame); break
    case 'pig':     drawPixelPig(ctx, x, y, frame); break
    case 'horse':   drawPixelHorse(ctx, x, y, frame); break
    case 'llama':   drawPixelLlama(ctx, x, y, frame); break
  }
}

function drawCrop(ctx: CanvasRenderingContext2D, type: string, stage: string, x: number, y: number) {
  // Soil patch
  px(ctx, x, y+8, 14, 6, PALETTE.soilDark)
  px(ctx, x+1, y+9, 12, 4, PALETTE.soil)

  if (stage === 'seed') {
    px(ctx, x+6, y+7, 2, 3, '#6b4226')
  } else if (stage === 'sprout') {
    px(ctx, x+6, y+2, 2, 8, PALETTE.green1)
    px(ctx, x+4, y+4, 3, 2, PALETTE.green2)
    px(ctx, x+7, y+5, 3, 2, PALETTE.green2)
  } else if (stage === 'growing') {
    px(ctx, x+6, y, 2, 10, PALETTE.green1)
    px(ctx, x+3, y+2, 4, 3, PALETTE.green2)
    px(ctx, x+7, y+4, 4, 3, PALETTE.green2)
    if (type === 'wheat') {
      px(ctx, x+5, y-2, 4, 3, PALETTE.wheat1)
    }
  } else { // ready
    px(ctx, x+6, y, 2, 10, PALETTE.green1)
    px(ctx, x+3, y+1, 4, 4, PALETTE.green2)
    px(ctx, x+7, y+3, 4, 4, PALETTE.green2)
    if (type === 'wheat') {
      px(ctx, x+4, y-4, 6, 5, PALETTE.wheat2)
    } else if (type === 'sunflower') {
      px(ctx, x+4, y-6, 6, 6, PALETTE.yellow)
      px(ctx, x+5, y-5, 4, 4, '#c8800a')
    } else if (type === 'apple_tree') {
      px(ctx, x+2, y-8, 10, 10, PALETTE.green2)
      px(ctx, x+3, y-7, 8, 8, PALETTE.green1)
      px(ctx, x+4, y-5, 2, 2, PALETTE.red)
      px(ctx, x+8, y-6, 2, 2, PALETTE.red)
    } else {
      px(ctx, x+5, y-3, 4, 4, PALETTE.orange)
    }
    // Sparkle — ready to harvest
    px(ctx, x+12, y-2, 2, 2, PALETTE.yellow)
    px(ctx, x+11, y-1, 4, 1, PALETTE.yellow)
    px(ctx, x+12, y-3, 1, 4, PALETTE.yellow)
  }
}

function drawFarmhouse(ctx: CanvasRenderingContext2D, x: number, y: number, level: number) {
  const w = level >= 3 ? 40 : 28
  const h = level >= 3 ? 30 : 22
  // Walls
  px(ctx, x, y+h*0.4, w, h*0.6, '#d4a876')
  px(ctx, x+1, y+h*0.4+1, w-2, h*0.6-2, '#e8c090')
  // Roof
  ctx.fillStyle = '#cc4444'
  ctx.beginPath()
  ctx.moveTo(x-4, y+h*0.42)
  ctx.lineTo(x+w/2, y)
  ctx.lineTo(x+w+4, y+h*0.42)
  ctx.closePath()
  ctx.fill()
  // Door
  px(ctx, x+w/2-3, y+h*0.7, 6, h*0.3, PALETTE.brown)
  px(ctx, x+w/2-2, y+h*0.72, 4, h*0.28, PALETTE.darkBrown)
  px(ctx, x+w/2+1, y+h*0.78, 1, 1, PALETTE.wheat1)
  // Windows
  px(ctx, x+4, y+h*0.5, 6, 5, '#aaddff')
  px(ctx, x+w-10, y+h*0.5, 6, 5, '#aaddff')
  px(ctx, x+5, y+h*0.52, 1, 3, PALETTE.brown)
  px(ctx, x+7, y+h*0.5, 4, 1, PALETTE.brown)
  if (level >= 2) {
    // Chimney
    px(ctx, x+w-10, y-6, 5, h*0.42+6, '#aa3333')
    px(ctx, x+w-11, y-8, 7, 4, '#992222')
    // Smoke
    ctx.fillStyle = 'rgba(200,200,200,0.3)'
    ctx.beginPath()
    ctx.arc(x+w-8, y-12, 5, 0, Math.PI*2)
    ctx.fill()
  }
}

function drawBarn(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, x, y+15, 36, 22, '#cc4422')
  px(ctx, x+1, y+16, 34, 20, '#dd5533')
  // Roof
  ctx.fillStyle = '#882211'
  ctx.beginPath()
  ctx.moveTo(x-3, y+17)
  ctx.lineTo(x+18, y)
  ctx.lineTo(x+39, y+17)
  ctx.closePath()
  ctx.fill()
  // Door X pattern
  px(ctx, x+10, y+22, 16, 15, PALETTE.darkBrown)
  px(ctx, x+11, y+23, 14, 13, PALETTE.brown)
  px(ctx, x+11, y+23, 14, 1, PALETTE.darkBrown)
  px(ctx, x+17, y+23, 2, 13, PALETTE.darkBrown)
  // Loft door
  px(ctx, x+14, y+8, 8, 6, PALETTE.darkBrown)
}

interface PixelFarmProps {
  farm: FarmState
  onAnimalClick?: (animal: any) => void
  onCropClick?: (crop: any) => void
  width?: number
  height?: number
}

export default function PixelFarm({ farm, onAnimalClick, onCropClick, width = 320, height = 220 }: PixelFarmProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)
  const animRef = useRef<number>(0)

  // Deterministic positions from farm data
  function getAnimalPos(animal: any, W: number, H: number) {
    const baseX = (animal.x / 100) * (W - 40) + 8
    const baseY = H * 0.38 + (animal.y / 100) * (H * 0.28)
    return { baseX, baseY }
  }

  function getCropPos(crop: any, W: number, H: number) {
    const x = (crop.x / 100) * (W - 30) + 8
    const y = H * 0.42 + (crop.y / 100) * (H * 0.2)
    return { x, y }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false

    const W = width
    const H = height

    // Animal wander state
    const wanderState: Record<string, { ox: number; oy: number; dx: number; dy: number; timer: number }> = {}
    farm.animals.forEach(a => {
      wanderState[a.id] = { ox: 0, oy: 0, dx: (Math.random() - 0.5) * 0.3, dy: 0, timer: Math.random() * 60 }
    })

    function draw() {
      frameRef.current++
      const frame = Math.floor(frameRef.current / 20)
      ctx!.clearRect(0, 0, W, H)

      drawGrass(ctx!, W, H)

      // Farmhouse
      drawFarmhouse(ctx!, 6, H * 0.28, farm.farm_level)

      // Barn (level 2+)
      if (farm.farm_level >= 2) {
        drawBarn(ctx!, W - 50, H * 0.28)
      }

      drawFence(ctx!, W, H)

      // Crops
      farm.crops.filter(c => !c.collected).forEach(crop => {
        const { x, y } = getCropPos(crop, W, H)
        const stage = getCropStage(crop)
        drawCrop(ctx!, crop.type, stage, Math.round(x), Math.round(y))
      })

      // Animals — wander
      farm.animals.forEach(animal => {
        const { baseX, baseY } = getAnimalPos(animal, W, H)
        const w = wanderState[animal.id]
        if (!w) return

        w.timer--
        if (w.timer <= 0) {
          w.dx = (Math.random() - 0.5) * 0.4
          w.dy = (Math.random() - 0.5) * 0.1
          w.timer = 40 + Math.random() * 80
        }
        w.ox += w.dx
        w.oy += w.dy
        // Clamp wander
        w.ox = Math.max(-20, Math.min(20, w.ox))
        w.oy = Math.max(-5, Math.min(5, w.oy))

        const ax = Math.round(baseX + w.ox)
        const ay = Math.round(baseY + w.oy)
        drawAnimal(ctx!, animal.type, ax, ay, frame)

        // Name tag
        ctx!.fillStyle = 'rgba(0,0,0,0.5)'
        ctx!.fillRect(ax, ay - 10, animal.name.length * 4 + 4, 8)
        ctx!.fillStyle = '#ffffff'
        ctx!.font = '6px monospace'
        ctx!.fillText(animal.name, ax + 2, ay - 3)
      })

      // Decorations
      farm.decorations.forEach(dec => {
        const dx = (dec.x / 100) * (W - 20)
        const dy = H * 0.35 + (dec.y / 100) * (H * 0.35)
        ctx!.font = '14px serif'
        ctx!.fillText(dec.type === 'flower_patch' ? '🌺' : dec.type === 'fountain' ? '⛲' : dec.type === 'weathervane' ? '🎠' : dec.type === 'trophy' ? '🏆' : '🪨', dx, dy)
      })

      // Moon
      ctx!.fillStyle = '#ffffcc'
      ctx!.beginPath()
      ctx!.arc(W - 20, 15, 8, 0, Math.PI * 2)
      ctx!.fill()
      ctx!.fillStyle = '#1a2a4a'
      ctx!.beginPath()
      ctx!.arc(W - 17, 13, 6, 0, Math.PI * 2)
      ctx!.fill()

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [farm, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: '100%', imageRendering: 'pixelated', borderRadius: 12, display: 'block' }}
    />
  )
}
