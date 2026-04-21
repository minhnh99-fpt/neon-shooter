import { BOSS_EVERY } from '../constants'

export function isBossWave(wave) {
  return wave > 0 && wave % BOSS_EVERY === 0
}

export function makeStars(W, H) {
  return Array.from({ length: 120 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    s: Math.random() * 1.5 + 0.3,
    sp: Math.random() * 1.5 + 0.5,
  }))
}

export function makePlayer(W, H) {
  return { x: W / 2, y: H - 80, w: 56, h: 72, speed: 5, invTime: 0 }
}

export function makeDroneWave(wave, W) {
  const rows = Math.min(2 + Math.floor(wave / 2), 5)
  const cols = Math.min(5 + wave, 10)
  const enemies = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      enemies.push({
        x: 60 + c * (W - 120) / cols,
        y: 60 + r * 52,
        w: 48, h: 40,
        hp: 1 + (wave > 3 ? 1 : 0),
        type: 'drone',
        dx: (Math.random() > 0.5 ? 1 : -1) * 0.8,
        fireTimer: Math.floor(Math.random() * 120),
        isBoss: false,
      })
  return enemies
}

export function makeBoss(wave, W) {
  const tier = wave / BOSS_EVERY
  const hp = 30 + tier * 20
  return {
    x: W / 2, y: 100,
    w: 70 + tier * 5, h: 52 + tier * 4,
    hp, maxHp: hp,
    type: 'boss',
    dx: 1.5 + tier * 0.3,
    fireTimer: 0,
    isBoss: true,
    phase: 0,
    tier,
  }
}

export function makeParticles(x, y, col, n = 12) {
  return Array.from({ length: n }, () => ({
    x, y,
    vx: (Math.random() - 0.5) * 5,
    vy: (Math.random() - 0.5) * 5,
    life: 1, col,
  }))
}

export function makePowerup(x, y) {
  const types = ['rapid', 'shield', 'spread']
  return {
    x, y,
    type: types[Math.floor(Math.random() * types.length)],
    vy: 1.5, life: 360,
  }
}
