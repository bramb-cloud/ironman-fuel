'use client'
import { useEffect, useRef } from 'react'
import { FarmState, ANIMALS, CROPS, getCropStage } from '@/lib/farm'

// ── PIXEL HELPERS ──
function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, col: string, S: number) {
  ctx.fillStyle = col
  ctx.fillRect(x * S, y * S, w * S, h * S)
}

// ── CHICKEN (v1 — approved) ──
function drawChicken(ctx: CanvasRenderingContext2D, x: number, y: number, S: number, frame: number) {
  const ox = frame % 2 === 0 ? 0 : 1
  const p = (px2: number, py2: number, pw: number, ph: number, col: string) => px(ctx, x + px2, y + py2, pw, ph, col, S)
  p(2,4,8,6,'#f5f5f0'); p(4,12,2,3+ox,'#ffaa00'); p(7,12,2,3-ox,'#ffaa00')
  p(4,10,4,3,'#ddd8c8'); p(5,11,2,2,'#c8c0b0')
  p(3,7,2,3,'#e8e0d0'); p(2,8,2,2,'#d8d0c0'); p(3,6,2,2,'#f0ece0')
  p(9,4,3,4,'#f5f5f0'); p(8,2,5,4,'#f5f5f0'); p(9,1,4,4,'#f5f5f0')
  p(9,0,2,2,'#dd2222'); p(11,1,2,1,'#dd2222'); p(10,0,3,1,'#ee3333')
  p(11,4,2,2,'#cc1111'); p(12,3,1,3,'#dd2222')
  p(10,2,2,2,'#111'); p(10,2,1,1,'#fff')
  p(12,3,2,1,'#ffaa00'); p(13,3,2,1,'#ff8800')
  p(4,15,3,1,'#ff8800'); p(6,15,1,1,'#ffaa00')
  p(7,15,3,1,'#ff8800'); p(9,15,1,1,'#ffaa00')
}

// ── COW (v2 — approved) ──
function drawCow(ctx: CanvasRenderingContext2D, x: number, y: number, S: number, frame: number) {
  const ox = frame % 2 === 0 ? 0 : 1
  const p = (px2: number, py2: number, pw: number, ph: number, col: string) => px(ctx, x + px2, y + py2, pw, ph, col, S)
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect((x+2)*S, (y+17)*S, 20*S, 2*S)
  p(1,3,20,9,'#e8e0d0'); p(0,4,22,7,'#e8e0d0'); p(2,2,18,11,'#e8e0d0')
  p(4,8,14,4,'#f5f0e8')
  p(4,3,4,3,'#1a1a1a'); p(5,4,2,4,'#1a1a1a')
  p(12,4,3,3,'#1a1a1a'); p(13,3,2,4,'#1a1a1a')
  p(7,9,3,2,'#1a1a1a')
  p(1,10,20,2,'#ccc0b0')
  p(18,1,4,5,'#e8e0d0'); p(19,0,3,6,'#e0d8c8')
  p(19,-2,7,7,'#e8e0d0'); p(20,-3,6,8,'#e8e0d0'); p(18,-1,9,6,'#e0d8c8')
  p(20,-5,2,4,'#d8c870'); p(21,-5,1,3,'#c8b860')
  p(24,-5,2,4,'#d8c870'); p(25,-5,1,3,'#c8b860')
  p(18,-2,3,3,'#e0d8c8'); p(19,-1,1,2,'#f0b0c0')
  p(24,2,5,3,'#f0b8c8'); p(23,3,6,2,'#f0b8c8'); p(24,4,4,1,'#e0a8b8')
  p(25,3,1,1,'#b06070'); p(27,3,1,1,'#b06070')
  p(20,0,3,3,'#111'); p(20,0,1,1,'#fff'); p(22,2,1,1,'#444')
  p(20,-1,1,1,'#111'); p(21,-1,1,1,'#111')
  p(8,11,5,3,'#f0a8bc'); p(9,13,3,1,'#e098ac')
  p(9,14,1,2,'#e098ac'); p(11,14,1,2,'#e098ac')
  p(2,12,3,5+ox,'#d0c8b8'); p(6,12,3,4-ox,'#d0c8b8')
  p(11,12,3,5+ox,'#d0c8b8'); p(15,12,3,4-ox,'#d0c8b8')
  p(2,16,3,2,'#3a2a1a'); p(6,16,3,2,'#3a2a1a')
  p(11,16,3,2,'#3a2a1a'); p(15,16,3,2,'#3a2a1a')
  p(3,16,1,1,'#5a4030'); p(7,16,1,1,'#5a4030')
  p(0,5,2,4,'#d0c8b8'); p(0,8,2,3,'#b0a898'); p(1,10,1,2,'#a09888')
}

// ── SHEEP (v5 — approved) ──
function drawSheep(ctx: CanvasRenderingContext2D, x: number, y: number, S: number, frame: number) {
  const ox = frame % 2 === 0 ? 0 : 1
  const p = (px2: number, py2: number, pw: number, ph: number, col: string) => px(ctx, x + px2, y + py2, pw, ph, col, S)
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect((x+1)*S, (y+17)*S, 18*S, 2*S)
  p(2,6,14,8,'#f4f0e8'); p(1,7,16,6,'#f4f0e8'); p(3,5,12,9,'#f4f0e8')
  p(2,5,2,2,'#f4f0e8'); p(5,4,3,3,'#f4f0e8'); p(9,4,3,3,'#f4f0e8'); p(13,5,2,2,'#f4f0e8')
  p(4,7,3,3,'#e4e0d4'); p(9,6,3,3,'#e4e0d4'); p(13,8,3,3,'#e4e0d4')
  p(5,11,5,2,'#d8d4c8'); p(11,10,3,2,'#d8d4c8')
  p(2,9,2,3,'#e4e0d4'); p(15,7,2,4,'#e4e0d4')
  p(2,13,14,1,'#c8c4b8')
  p(13,7,3,4,'#c8b888')
  p(12,2,8,7,'#c8b888'); p(13,1,7,8,'#c8b888'); p(12,2,8,6,'#d8c898')
  p(12,8,8,1,'#a89868')
  p(13,0,2,3,'#c8b888'); p(14,0,1,2,'#e8a0aa')
  p(18,0,2,3,'#c8b888'); p(18,0,1,2,'#e8a0aa')
  p(14,3,2,2,'#1a1208'); p(14,3,1,1,'#fff')
  p(17,3,2,2,'#1a1208'); p(17,3,1,1,'#fff')
  p(15,6,1,1,'#a07858'); p(17,6,1,1,'#a07858')
  p(15,7,3,1,'#a07858')
  p(3,13,2,5+ox,'#888878'); p(7,13,2,4-ox,'#888878')
  p(10,13,2,5+ox,'#888878'); p(13,13,2,4-ox,'#888878')
  p(3,17,2,1,'#484840'); p(7,17,2,1,'#484840')
  p(10,17,2,1,'#484840'); p(13,17,2,1,'#484840')
  p(1,7,2,4,'#f4f0e8'); p(0,8,2,3,'#e4e0d4')
}

// ── PIG (v5 — approved) ──
function drawPig(ctx: CanvasRenderingContext2D, x: number, y: number, S: number, frame: number) {
  const ox = frame % 2 === 0 ? 0 : 1
  const p = (px2: number, py2: number, pw: number, ph: number, col: string) => px(ctx, x + px2, y + py2, pw, ph, col, S)
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect((x+1)*S, (y+17)*S, 18*S, 2*S)
  p(2,6,15,8,'#f0a8c0'); p(1,7,17,6,'#f0a8c0'); p(3,5,13,9,'#f0a8c0')
  p(4,8,11,5,'#f8c4d4'); p(5,7,9,6,'#f8c4d4')
  p(2,12,15,2,'#d888a8'); p(1,10,1,4,'#d888a8'); p(16,10,1,3,'#d888a8')
  p(2,13,15,1,'#c87898')
  p(14,7,3,3,'#f0a8c0')
  p(13,2,8,7,'#f0a8c0'); p(14,1,7,8,'#f0a8c0'); p(13,2,8,6,'#f8b8c8')
  p(13,8,8,1,'#d888a8')
  p(14,-1,3,4,'#f0a8c0'); p(15,-1,2,3,'#dd6688'); p(15,0,1,2,'#cc4466')
  p(18,-1,3,3,'#f0a8c0'); p(19,-1,2,2,'#dd6688'); p(19,0,1,1,'#cc4466')
  p(15,3,2,2,'#1a0810'); p(15,3,1,1,'#fff')
  p(18,3,2,2,'#1a0810'); p(18,3,1,1,'#fff')
  p(15,2,3,1,'#1a0810'); p(18,2,2,1,'#1a0810')
  p(15,6,5,3,'#d878a0'); p(14,7,6,2,'#d878a0'); p(15,8,4,1,'#c86890')
  p(16,7,1,1,'#882244'); p(19,7,1,1,'#882244')
  ctx.fillStyle = 'rgba(220,80,120,0.2)'
  ctx.fillRect((x+13)*S, (y+5)*S, 2*S, 2*S); ctx.fillRect((x+20)*S, (y+5)*S, 2*S, 2*S)
  p(2,13,3,4+ox,'#d888a8'); p(6,13,3,3-ox,'#d888a8')
  p(10,13,3,4+ox,'#d888a8'); p(13,13,3,3-ox,'#d888a8')
  p(2,17,3,1,'#b06880'); p(6,17,3,1,'#b06880')
  p(10,17,3,1,'#b06880'); p(13,17,3,1,'#b06880')
  p(1,8,1,2,'#d888a8'); p(0,10,2,1,'#d888a8'); p(1,11,1,1,'#d888a8')
}

// ── HORSE (v2 — approved) ──
function drawHorse(ctx: CanvasRenderingContext2D, x: number, y: number, S: number, frame: number) {
  const ox = frame % 2 === 0 ? 0 : 2
  const p = (px2: number, py2: number, pw: number, ph: number, col: string) => px(ctx, x + px2, y + py2, pw, ph, col, S)
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect((x+2)*S, (y+22)*S, 20*S, 2*S)
  p(1,5,18,9,'#8b4513'); p(0,6,20,7,'#8b4513'); p(2,4,16,10,'#8b4513')
  p(3,6,4,4,'#9b5523'); p(14,5,4,5,'#9b5523')
  p(2,12,18,2,'#6a2c08')
  p(16,0,5,7,'#8b4513'); p(17,-1,4,8,'#8b4513'); p(15,1,5,6,'#8b4513')
  p(15,0,2,8,'#111'); p(16,-1,1,9,'#1a1a1a'); p(14,1,2,6,'#111')
  p(17,-2,1,5,'#222'); p(13,3,2,4,'#1a1a1a')
  p(17,-3,6,8,'#8b4513'); p(18,-4,6,9,'#8b4513'); p(16,-2,7,7,'#8b4513')
  p(22,2,5,4,'#c8906a'); p(21,3,6,3,'#c8906a')
  p(23,4,2,1,'#6b3010'); p(25,3,1,2,'#6b3010')
  p(18,-1,3,3,'#111'); p(18,-1,1,1,'#fff'); p(20,1,1,1,'#333')
  p(18,-2,1,1,'#111'); p(19,-2,2,1,'#111')
  p(18,-5,3,4,'#8b4513'); p(19,-4,2,3,'#8b4513'); p(19,-3,1,2,'#c89060')
  p(21,-4,2,3,'#8b4513')
  p(3,14,3,6+ox,'#7a3c10'); p(7,14,3,5-ox,'#7a3c10')
  p(12,14,3,6+ox,'#7a3c10'); p(16,14,3,5-ox,'#7a3c10')
  p(3,19,1,1,'#8b4513'); p(7,19,1,1,'#8b4513')
  p(3,20,3,2,'#1a1008'); p(7,20,3,2,'#1a1008')
  p(12,20,3,2,'#1a1008'); p(16,20,3,2,'#1a1008')
  p(7,18,3,2,'#f0ece0')
  p(0,7,2,8,'#111'); p(1,6,2,10,'#111'); p(0,15,3,4,'#1a1a1a')
}

// ── LLAMA (v1 — approved) ──
function drawLlama(ctx: CanvasRenderingContext2D, x: number, y: number, S: number, frame: number) {
  const ox = frame % 2 === 0 ? 0 : 1
  const p = (px2: number, py2: number, pw: number, ph: number, col: string) => px(ctx, x + px2, y + py2, pw, ph, col, S)
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect((x+3)*S, (y+21)*S, 14*S, 2*S)
  p(3,8,13,10,'#f5e8c8'); p(2,9,15,8,'#f5e8c8'); p(4,7,11,12,'#f5e8c8')
  p(3,10,3,3,'#ede0b8'); p(11,9,3,3,'#ede0b8'); p(7,13,4,2,'#ede0b8')
  p(5,8,2,2,'#e8dab0'); p(12,12,2,3,'#e8dab0')
  p(12,2,4,8,'#f5e8c8'); p(11,3,5,7,'#f5e8c8'); p(13,1,3,9,'#f5e8c8')
  p(11,0,7,5,'#f5e8c8'); p(12,0,6,5,'#f5e8c8'); p(10,1,8,4,'#f5e8c8')
  p(12,0,5,2,'#e8dab0'); p(11,1,2,1,'#e8dab0')
  p(12,0,2,3,'#f5e8c8'); p(13,0,1,2,'#ffaabb')
  p(16,0,2,3,'#f5e8c8'); p(16,1,1,1,'#ffaabb')
  p(13,2,2,2,'#111'); p(13,2,1,1,'#fff')
  p(16,3,3,2,'#e8dab0'); p(17,2,2,3,'#e8dab0')
  p(17,4,1,1,'#aa8866'); p(18,3,1,1,'#aa8866')
  p(16,5,3,1,'#aa8866')
  p(4,17,2,5+ox,'#d4c4a0'); p(7,17,2,4-ox,'#d4c4a0')
  p(11,17,2,5+ox,'#d4c4a0'); p(14,17,2,4-ox,'#d4c4a0')
  p(4,21,2,1,'#998870'); p(7,21,2,1,'#998870')
  p(11,21,2,1,'#998870'); p(14,21,2,1,'#998870')
  p(2,11,2,3,'#e8dab0'); p(1,12,2,2,'#ede0b8')
}

function drawAnimal(ctx: CanvasRenderingContext2D, type: string, x: number, y: number, S: number, frame: number) {
  switch (type) {
    case 'chicken': drawChicken(ctx, x, y, S, frame); break
    case 'cow':     drawCow(ctx, x, y, S, frame); break
    case 'sheep':   drawSheep(ctx, x, y, S, frame); break
    case 'pig':     drawPig(ctx, x, y, S, frame); break
    case 'horse':   drawHorse(ctx, x, y, S, frame); break
    case 'llama':   drawLlama(ctx, x, y, S, frame); break
  }
}

// ── CROP drawing ──
function drawCrop(ctx: CanvasRenderingContext2D, type: string, stage: string, cx: number, cy: number, S: number) {
  const p = (x: number, y: number, w: number, h: number, col: string) => px(ctx, cx+x, cy+y, w, h, col, S)
  // soil
  p(0,7,14,5,'#4a2c0e'); p(1,8,12,4,'#5a3818')
  if (stage === 'seed') {
    p(6,6,2,2,'#3a7020'); p(5,6,4,1,'#4aaa30')
  } else if (stage === 'sprout') {
    p(6,1,2,7,'#3a8820'); p(5,3,4,3,'#4aaa30'); p(6,0,2,2,'#4ab838')
  } else if (stage === 'growing') {
    p(6,0,2,8,'#2a7818'); p(5,2,4,4,'#3a9828'); p(4,1,6,3,'#4ab838')
    if (type === 'wheat') { p(5,-2,4,3,'#e0b820'); p(4,-1,6,2,'#d0a010') }
  } else {
    p(6,0,2,8,'#2a7818'); p(5,1,4,5,'#3a9828')
    if (type === 'wheat') {
      p(4,-4,6,4,'#e8c840'); p(3,-3,7,2,'#d4b030')
    } else if (type === 'sunflower') {
      p(5,-7,4,4,'#ffdd00'); p(6,-6,2,2,'#c88010')
    } else if (type === 'apple_tree') {
      p(3,-8,8,8,'#2a7818'); p(4,-7,6,6,'#3a9828')
      p(3,-4,2,2,'#cc2222'); p(7,-5,2,2,'#cc2222')
    } else {
      p(5,-3,4,3,'#ff8800')
    }
    // harvest sparkle
    p(12,-2,1,1,'#ffff80'); p(11,-1,3,1,'#ffe040'); p(12,-3,1,3,'#ffe040')
  }
}

// ── FARM BACKGROUND — Stardew Valley style ──
function drawFarmBackground(ctx: CanvasRenderingContext2D, W: number, H: number, S: number) {
  const d = (x: number, y: number, w: number, h: number, col: string) => px(ctx, x, y, w, h, col, S)

  // Sky
  d(0,0,W,H,'#1a3a6a')
  d(0,0,W,6,'#0d1f40'); d(0,6,W,5,'#1a3060'); d(0,11,W,5,'#243878')
  // Stars
  ;[[8,2],[18,5],[30,1],[45,3],[60,2],[15,8],[35,7],[55,5]].forEach(([x,y]) => d(x,y,1,1,'rgba(255,255,210,0.8)'))
  // Moon
  d(W-14,3,6,6,'#fffce0'); d(W-13,4,4,4,'#fffce0'); d(W-12,2,4,7,'#fffce0'); d(W-11,3,3,5,'#1a3060')

  // Ground
  d(0,Math.floor(H*0.55),W,Math.ceil(H*0.45),'#2d5c18')
  d(0,Math.floor(H*0.55),W,1,'#4a8828'); d(0,Math.floor(H*0.55)+1,W,1,'#3a7020')
  for (let i=0; i<W; i+=4) d(i, Math.floor(H*0.55), 1, Math.ceil(H*0.45), 'rgba(60,130,20,0.12)')

  // Dirt path
  const py = Math.floor(H*0.78)
  d(0,py,W,4,'#8a6420'); d(0,py,W,1,'#a07c2c'); d(0,py+1,W,1,'#7a5818')
  for (let i=0; i<W; i+=5) d(i, py+1, 3, 1, 'rgba(140,110,30,0.25)')

  // Fence
  const fy = Math.floor(H*0.55)-2
  for (let i=1; i<W; i+=6) { d(i,fy,2,8,'#7a5010'); d(i,fy,2,1,'#9a7030') }
  d(0,fy+2,W,2,'#9a7030'); d(0,fy+5,W,1,'#7a5010')

  // Farmhouse
  const hx=2, hy=Math.floor(H*0.32)
  d(hx,hy+12,18,5,'#8a7050')
  d(hx,hy,18,13,'#e0c888'); d(hx+1,hy-1,16,14,'#d4b878')
  for (let i=0;i<4;i++) d(hx+1,hy+2+i*3,16,1,'rgba(0,0,0,0.08)')
  for (let i=0;i<=8;i++) d(hx+i,hy-i,18-i*2,2,'#b83018')
  d(hx+9,hy-8,2,9,'#b83018')
  d(hx+14,hy-8,3,10,'#8a3020'); d(hx+13,hy-9,5,3,'#7a2810')
  ctx.fillStyle='rgba(200,200,210,0.2)'
  ctx.beginPath(); ctx.arc((hx+15)*S,(hy-11)*S,5*S,0,Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc((hx+17)*S,(hy-13)*S,3*S,0,Math.PI*2); ctx.fill()
  d(hx+7,hy+9,4,4,'#5a3010'); d(hx+8,hy+9,2,4,'#3a1a08'); d(hx+9,hy+11,1,1,'#c8a020')
  d(hx+2,hy+4,5,5,'#88ccee'); d(hx+2,hy+4,5,1,'#7a5010'); d(hx+2,hy+7,5,1,'#7a5010'); d(hx+4,hy+4,1,5,'#7a5010')
  d(hx+13,hy+4,5,5,'#88ccee'); d(hx+13,hy+4,5,1,'#7a5010'); d(hx+13,hy+7,5,1,'#7a5010'); d(hx+15,hy+4,1,5,'#7a5010')
  ctx.fillStyle='rgba(255,200,80,0.12)'
  ctx.fillRect((hx+2)*S,(hy+4)*S,5*S,5*S); ctx.fillRect((hx+13)*S,(hy+4)*S,5*S,5*S)

  // Barn
  const bx=W-32, by=Math.floor(H*0.35)
  d(bx,by+3,28,12,'#c42818'); d(bx+1,by+2,26,13,'#b02010')
  for (let i=0;i<4;i++) d(bx+1,by+4+i*3,26,1,'rgba(0,0,0,0.15)')
  for (let i=0;i<=13;i++) d(bx+i,by+3-i,28-i*2,2,'#801808')
  d(bx+14,by-10,2,14,'#801808')
  d(bx+11,by-6,6,6,'#3a1a08'); d(bx+12,by-5,4,4,'#1a0808')
  d(bx+8,by+9,12,6,'#3a1a08'); d(bx+9,by+10,10,5,'#1a0808')
  ctx.strokeStyle='#5a2808'; ctx.lineWidth=S*0.7
  ctx.beginPath(); ctx.moveTo((bx+8)*S,(by+9)*S); ctx.lineTo((bx+20)*S,(by+15)*S); ctx.stroke()
  ctx.beginPath(); ctx.moveTo((bx+20)*S,(by+9)*S); ctx.lineTo((bx+8)*S,(by+15)*S); ctx.stroke()
  d(bx,by+3,28,1,'#e0c888')

  // Tilled soil
  const sx=Math.floor(W*0.28), sy=Math.floor(H*0.62)
  d(sx,sy,26,8,'#4a2c0e'); d(sx+1,sy+1,24,6,'#5a3818')
  for (let i=0;i<3;i++) d(sx+1,sy+2+i*2,24,1,'#3a2208')

  // Flowers
  ;[[Math.floor(W*0.22),Math.floor(H*0.58)],[Math.floor(W*0.25),Math.floor(H*0.56)]].forEach(([x,y]) => {
    d(x,y,1,1,'#ff88cc'); d(x+2,y-1,1,1,'#ff88cc'); d(x+4,y,1,1,'#ff88cc')
    d(x+2,y,1,1,'#ffff80'); d(x+1,y+1,1,1,'#4aaa30'); d(x+3,y+1,1,1,'#4aaa30')
  })

  // Apple tree
  const tx=Math.floor(W*0.56), ty=Math.floor(H*0.38)
  d(tx+1,ty+8,2,9,'#5a3010')
  d(tx-1,ty,7,9,'#2a7818'); d(tx-2,ty+2,9,7,'#3a9828'); d(tx,ty-1,5,5,'#2a7818')
  d(tx,ty+3,2,2,'#cc2222'); d(tx+3,ty+2,2,2,'#cc2222')

  // Well
  const wx=Math.floor(W*0.64), wy=Math.floor(H*0.61)
  d(wx,wy,5,5,'#8a6420'); d(wx+1,wy-1,3,2,'#a07830')
  d(wx-1,wy,1,5,'#5a4010'); d(wx+6,wy,1,5,'#5a4010')
  d(wx-2,wy-3,8,3,'#b83018'); d(wx-1,wy-4,6,2,'#b83018'); d(wx+2,wy-5,2,2,'#b83018')
  ctx.strokeStyle='rgba(160,130,60,0.6)'; ctx.lineWidth=1
  ctx.beginPath(); ctx.moveTo((wx+2)*S,(wy-1)*S); ctx.lineTo((wx+2)*S,(wy+2)*S); ctx.stroke()
  d(wx+1,wy+3,2,2,'#6a4010')
}

interface PixelFarmProps {
  farm: FarmState
  width?: number
  height?: number
}

export default function PixelFarm({ farm, width = 320, height = 220 }: PixelFarmProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const frameRef = useRef(0)
  const W = 80
  const H = 55
  const S = Math.floor(width / W)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false

    const wanderState: Record<string, { ox: number; oy: number; dx: number; dy: number; timer: number }> = {}
    farm.animals.forEach(a => {
      wanderState[a.id] = { ox: 0, oy: 0, dx: (Math.random()-0.5)*0.3, dy: 0, timer: Math.random()*60 }
    })

    function draw() {
      frameRef.current++
      const frame = Math.floor(frameRef.current / 18)
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      drawFarmBackground(ctx!, W, H, S)

      // Crops in soil area
      farm.crops.filter(c => !c.collected).slice(0,6).forEach((crop, i) => {
        const cx = Math.floor(W*0.28) + 2 + i * 4
        const cy = Math.floor(H*0.62) - 2
        drawCrop(ctx!, crop.type, getCropStage(crop), cx, cy, S)
      })

      // Animals wander on grass
      farm.animals.forEach(animal => {
        const baseX = Math.floor((animal.x / 100) * (W - 28) + 4)
        const baseY = Math.floor(H*0.6 + (animal.y / 100) * (H*0.14))
        const w = wanderState[animal.id]
        if (!w) return
        w.timer--
        if (w.timer <= 0) { w.dx = (Math.random()-0.5)*0.4; w.dy = (Math.random()-0.5)*0.1; w.timer = 40+Math.random()*80 }
        w.ox = Math.max(-16, Math.min(16, w.ox + w.dx))
        w.oy = Math.max(-4, Math.min(4, w.oy + w.dy))
        const ax = Math.round(baseX + w.ox)
        const ay = Math.round(baseY + w.oy)
        drawAnimal(ctx!, animal.type, ax, ay, S, frame)
        // Name tag
        ctx!.fillStyle = 'rgba(0,0,0,0.55)'
        ctx!.fillRect(ax*S, (ay-3)*S, animal.name.length*4+4, 7)
        ctx!.fillStyle = '#ffffff'
        ctx!.font = '6px monospace'
        ctx!.fillText(animal.name, ax*S+2, (ay-3)*S+5)
      })

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [farm, S])

  return (
    <canvas
      ref={canvasRef}
      width={W * S}
      height={H * S}
      style={{ width: '100%', imageRendering: 'pixelated', borderRadius: 12, display: 'block' }}
    />
  )
}
