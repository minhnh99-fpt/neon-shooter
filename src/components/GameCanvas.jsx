import { useRef, useCallback, useEffect } from 'react'
import { useGameLoop } from '../game/useGameLoop'
import { useInput } from '../game/useInput'
import { rectHit } from '../game/collision'
import {
  isBossWave, makeStars, makePlayer,
  makeDroneWave, makeBoss, makeParticles, makePowerup,
} from '../game/entities'
import { COLORS, FIRE_RATE_DEFAULT, FIRE_RATE_RAPID, POWERUP_DURATION, SHIELD_DURATION } from '../constants'

export default function GameCanvas({ state, onHUDUpdate, onWaveMsg, onGameOver, onBossUpdate }) {
  const canvasRef = useRef(null)
  const keys = useInput()

  // toàn bộ game state trong 1 ref để tránh re-render
  const g = useRef({})

  const W = () => window.innerWidth
  const H = () => window.innerHeight

  const initGame = useCallback(() => {
    const w = W(), h = H()
    g.current = {
      player: makePlayer(w, h),
      bullets: [], eBullets: [], enemies: [],
      particles: [], powerups: [],
      stars: makeStars(w, h),
      score: 0, lives: 3, wave: 0,
      fireTimer: 0, fireRate: FIRE_RATE_DEFAULT,
      spread: false, shieldActive: false, shieldTimer: 0,
      waveTimer: 0, waveClearing: false,
      bossHP: 0, bossMaxHP: 0, bossTier: 0, isBoss: false,
    }
    spawnWave()
    pushHUD()
  }, [])

  useEffect(() => {
    if (state === 'playing') initGame()
  }, [state, initGame])

  function pushHUD() {
    const { score, lives, wave, isBoss } = g.current
    onHUDUpdate({ score, lives, wave, isBoss })
  }

  function spawnWave() {
    const s = g.current
    s.wave++
    s.enemies = []; s.eBullets = []
    s.isBoss = isBossWave(s.wave)
    if (s.isBoss) {
      const boss = makeBoss(s.wave, W())
      s.bossHP = boss.hp; s.bossMaxHP = boss.maxHp; s.bossTier = boss.tier
      s.enemies.push(boss)
      onWaveMsg({ text: '⚠ BOSS INCOMING ⚠', color: '#f00' })
      onBossUpdate({ hp: boss.hp, maxHp: boss.maxHp, tier: boss.tier, visible: true })
    } else {
      s.enemies = makeDroneWave(s.wave, W())
      onWaveMsg({ text: 'WAVE ' + s.wave, color: '#ff0' })
      onBossUpdate({ visible: false })
    }
    pushHUD()
  }

  function playerShoot() {
    const s = g.current
    if (s.fireTimer > 0) return
    s.fireTimer = s.fireRate
    if (s.spread) {
      s.bullets.push({ x: s.player.x - 12, y: s.player.y - 20, vx: -1.5, vy: -10 })
      s.bullets.push({ x: s.player.x,      y: s.player.y - 24, vx: 0,    vy: -11 })
      s.bullets.push({ x: s.player.x + 12, y: s.player.y - 20, vx: 1.5,  vy: -10 })
    } else {
      s.bullets.push({ x: s.player.x, y: s.player.y - 20, vx: 0, vy: -12 })
    }
  }

  function update() {
    const s = g.current
    const w = W(), h = H()

    if (s.player.invTime > 0) s.player.invTime--
    if (s.shieldTimer > 0) { s.shieldTimer--; if (s.shieldTimer === 0) s.shieldActive = false }
    if (s.fireTimer > 0) s.fireTimer--

    // player move
    const spd = s.player.speed
    if ((keys.current['ArrowLeft']  || keys.current['a']) && s.player.x > s.player.w / 2) s.player.x -= spd
    if ((keys.current['ArrowRight'] || keys.current['d']) && s.player.x < w - s.player.w / 2) s.player.x += spd
    if ((keys.current['ArrowUp']    || keys.current['w']) && s.player.y > h / 2) s.player.y -= spd
    if ((keys.current['ArrowDown']  || keys.current['s']) && s.player.y < h - 30) s.player.y += spd
    if (keys.current[' '] || keys.current['ArrowUp'] || keys.current['w']) playerShoot()

    // stars scroll
    for (const st of s.stars) { st.y += st.sp; if (st.y > h) { st.y = 0; st.x = Math.random() * w } }

    // player bullets
    for (let i = s.bullets.length - 1; i >= 0; i--) {
      const b = s.bullets[i]; b.x += b.vx; b.y += b.vy
      if (b.y < -10) { s.bullets.splice(i, 1); continue }
      let hit = false
      for (let j = s.enemies.length - 1; j >= 0; j--) {
        const e = s.enemies[j]
        if (rectHit(b.x, b.y, 4, 14, e.x, e.y, e.w, e.h)) {
          hit = true; e.hp--
          s.score += e.isBoss ? 50 : 10
          s.particles.push(...makeParticles(b.x, b.y, e.isBoss ? '#ff0' : '#f0f', 6))
          if (e.hp <= 0) {
            if (e.isBoss) {
              s.particles.push(...makeParticles(e.x, e.y, '#ff0', 60))
              s.score += 500 * e.tier
              onBossUpdate({ visible: false })
              onWaveMsg({ text: 'BOSS DEFEATED! +BONUS', color: '#0f0' })
              const types = ['rapid', 'shield', 'spread']
              for (let k = 0; k < 2; k++)
                s.powerups.push({ x: e.x + (k - 0.5) * 40, y: e.y, type: types[Math.floor(Math.random() * types.length)], vy: 1.5, life: 480 })
            } else {
              s.particles.push(...makeParticles(e.x, e.y, '#f0f'))
              if (Math.random() < 0.3) s.powerups.push(makePowerup(e.x, e.y))
            }
            s.enemies.splice(j, 1)
          } else if (e.isBoss) {
            s.bossHP = e.hp
            onBossUpdate({ hp: e.hp, maxHp: e.maxHp, tier: e.tier, visible: true })
          }
          break
        }
      }
      if (hit) s.bullets.splice(i, 1)
      pushHUD()
    }

    // enemy bullets
    for (let i = s.eBullets.length - 1; i >= 0; i--) {
      const b = s.eBullets[i]; b.x += b.vx; b.y += b.vy
      if (b.y > h + 10) { s.eBullets.splice(i, 1); continue }
      if (s.player.invTime === 0 && rectHit(b.x, b.y, 4, 10, s.player.x, s.player.y, s.player.w, s.player.h)) {
        if (!s.shieldActive) {
          s.lives--; s.player.invTime = 120
          s.particles.push(...makeParticles(s.player.x, s.player.y, '#0ff', 20))
          pushHUD()
          if (s.lives <= 0) { onGameOver(s.score, s.wave); return }
        }
        s.eBullets.splice(i, 1)
      }
    }

    // enemies move & shoot
    for (const e of s.enemies) {
      e.x += e.dx
      if (e.x > w - e.w / 2 || e.x < e.w / 2) e.dx *= -1
      if (e.isBoss) {
        e.phase = Math.floor(Date.now() / 2000) % 3
        e.fireTimer--
        if (e.fireTimer <= 0) {
          e.fireTimer = Math.max(8, 25 - s.wave)
          if (e.phase === 0) s.eBullets.push({ x: e.x, y: e.y + e.h / 2, vx: 0, vy: 5 })
          else if (e.phase === 1) for (let a = -1; a <= 1; a++) s.eBullets.push({ x: e.x, y: e.y + e.h / 2, vx: a * 2.5, vy: 5 })
          else for (let a = -2; a <= 2; a++) s.eBullets.push({ x: e.x, y: e.y + e.h / 2, vx: a * 2, vy: 4.5 })
        }
      } else {
        e.fireTimer--
        if (e.fireTimer <= 0) {
          e.fireTimer = Math.max(20, 80 + Math.floor(Math.random() * 60) - s.wave * 2)
          s.eBullets.push({ x: e.x, y: e.y + e.h / 2, vx: (Math.random() - 0.5) * 2, vy: 3.5 + s.wave * 0.3 })
        }
        if (rectHit(e.x, e.y, e.w, e.h, s.player.x, s.player.y, s.player.w, s.player.h) && s.player.invTime === 0) {
          if (!s.shieldActive) {
            s.lives--; s.player.invTime = 120; pushHUD()
            if (s.lives <= 0) { onGameOver(s.score, s.wave); return }
          }
        }
      }
    }

    // powerups
    for (let i = s.powerups.length - 1; i >= 0; i--) {
      const p = s.powerups[i]; p.y += p.vy; p.life--
      if (p.y > h || p.life <= 0) { s.powerups.splice(i, 1); continue }
      if (rectHit(p.x, p.y, 20, 20, s.player.x, s.player.y, s.player.w, s.player.h)) {
        if (p.type === 'rapid') { s.fireRate = FIRE_RATE_RAPID; setTimeout(() => { s.fireRate = FIRE_RATE_DEFAULT }, POWERUP_DURATION) }
        else if (p.type === 'shield') { s.shieldActive = true; s.shieldTimer = SHIELD_DURATION }
        else if (p.type === 'spread') { s.spread = true; setTimeout(() => { s.spread = false }, POWERUP_DURATION) }
        s.particles.push(...makeParticles(p.x, p.y, COLORS.pow[p.type], 10))
        s.powerups.splice(i, 1)
      }
    }

    // particles
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i]
      p.x += p.vx; p.y += p.vy; p.life -= 0.04; p.vx *= 0.95; p.vy *= 0.95
      if (p.life <= 0) s.particles.splice(i, 1)
    }

    // wave clear
    if (s.enemies.length === 0 && !s.waveClearing) { s.waveClearing = true; s.waveTimer = 90 }
    if (s.waveClearing) { s.waveTimer--; if (s.waveTimer <= 0) { s.waveClearing = false; spawnWave() } }
  }

  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = W(), h = H()
    canvas.width = w; canvas.height = h

    ctx.fillStyle = '#000010'; ctx.fillRect(0, 0, w, h)
    if (state !== 'playing') return

    const s = g.current

    // stars
    for (const st of s.stars) {
      ctx.globalAlpha = 0.7; ctx.fillStyle = '#fff'
      ctx.fillRect(st.x, st.y, st.s, st.s)
    }
    ctx.globalAlpha = 1

    // scanlines
    ctx.fillStyle = 'rgba(0,255,255,0.02)'
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1)

    // enemies
    for (const e of s.enemies) drawEnemy(ctx, e, s.bossHP, s.bossMaxHP)

    // bullets
    for (const b of s.bullets) drawBullet(ctx, b, '#0ff')
    for (const b of s.eBullets) drawBullet(ctx, b, '#f60')

    // powerups
    for (const p of s.powerups) drawPowerup(ctx, p)

    // particles
    for (const p of s.particles) {
      ctx.globalAlpha = p.life; ctx.fillStyle = p.col
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
    }
    ctx.globalAlpha = 1

    // player
    drawPlayer(ctx, s.player, s.shieldActive)
  }

  useGameLoop(() => {
    if (state === 'playing') update()
    draw()
  })

  return <canvas ref={canvasRef} style={{ display: 'block' }} />
}

// ── draw helpers ──────────────────────────────────────────────────────────────

function drawPlayer(ctx, player, shieldActive) {
  const { x, y, w, h, invTime } = player
  if (invTime > 0 && Math.floor(invTime / 4) % 2 === 0) return
  ctx.save()
  if (shieldActive) {
    ctx.shadowColor = '#0ff'; ctx.shadowBlur = 20
    ctx.strokeStyle = 'rgba(0,255,255,0.2)'; ctx.lineWidth = 2
    ctx.beginPath(); ctx.ellipse(x, y, w, h * 0.8, 0, 0, Math.PI * 2); ctx.stroke()
  }
  ctx.shadowColor = '#0ff'; ctx.shadowBlur = 16; ctx.fillStyle = '#0ff'
  ctx.beginPath()
  ctx.moveTo(x, y - h / 2); ctx.lineTo(x - w / 2, y + h / 2)
  ctx.lineTo(x - w / 4, y + h / 3); ctx.lineTo(x, y + h / 4)
  ctx.lineTo(x + w / 4, y + h / 3); ctx.lineTo(x + w / 2, y + h / 2)
  ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#006'; ctx.beginPath(); ctx.ellipse(x, y - 4, 6, 8, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = 'rgba(0,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(x, y - 4, 3, 5, 0, 0, Math.PI * 2); ctx.fill()
  ctx.restore()
}

function drawEnemy(ctx, e, bossHP, bossMaxHP) {
  ctx.save()
  if (e.isBoss) {
    ctx.shadowColor = '#ff0'; ctx.shadowBlur = 24; ctx.fillStyle = '#ff0'
    ctx.beginPath()
    ctx.moveTo(e.x, e.y - e.h / 2); ctx.lineTo(e.x + e.w / 2, e.y)
    ctx.lineTo(e.x + e.w / 3, e.y + e.h / 2); ctx.lineTo(e.x, e.y + e.h / 3)
    ctx.lineTo(e.x - e.w / 3, e.y + e.h / 2); ctx.lineTo(e.x - e.w / 2, e.y)
    ctx.closePath(); ctx.fill()
    ctx.fillStyle = 'rgba(255,0,0,0.25)'
    ctx.beginPath(); ctx.ellipse(e.x, e.y, e.w * 0.35, e.h * 0.35, 0, 0, Math.PI * 2); ctx.fill()
    const bw = e.w + 20, bh = 8
    ctx.fillStyle = '#333'; ctx.fillRect(e.x - bw / 2, e.y - e.h / 2 - 16, bw, bh)
    ctx.fillStyle = '#f00'; ctx.fillRect(e.x - bw / 2, e.y - e.h / 2 - 16, bw * (bossHP / bossMaxHP), bh)
  } else {
    ctx.shadowColor = '#f0f'; ctx.shadowBlur = 14; ctx.fillStyle = '#f0f'
    ctx.beginPath()
    ctx.moveTo(e.x, e.y + e.h / 2); ctx.lineTo(e.x - e.w / 2, e.y - e.h / 2)
    ctx.lineTo(e.x - e.w / 4, e.y - e.h / 4); ctx.lineTo(e.x, e.y)
    ctx.lineTo(e.x + e.w / 4, e.y - e.h / 4); ctx.lineTo(e.x + e.w / 2, e.y - e.h / 2)
    ctx.closePath(); ctx.fill()
  }
  ctx.restore()
}

function drawBullet(ctx, b, col) {
  ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 10
  ctx.fillStyle = col; ctx.fillRect(b.x - 2, b.y - 7, 4, 14)
  ctx.restore()
}

function drawPowerup(ctx, p) {
  const col = COLORS.pow[p.type]
  ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 12
  ctx.strokeStyle = col; ctx.lineWidth = 1.5
  ctx.strokeRect(p.x - 10, p.y - 10, 20, 20)
  ctx.fillStyle = col; ctx.font = '11px monospace'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(p.type === 'rapid' ? 'R' : p.type === 'shield' ? 'S' : 'X', p.x, p.y)
  ctx.restore()
}
