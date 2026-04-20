import { useState, useCallback, useEffect } from 'react'
import GameCanvas from './components/GameCanvas'
import HUD from './components/HUD'
import BossBar from './components/BossBar'
import WaveMessage from './components/WaveMessage'
import Overlay from './components/Overlay'

export default function App() {
  const [state, setState] = useState('idle')   // idle | playing | gameover
  const [hud, setHud] = useState({ score: 0, lives: 3, wave: 0, isBoss: false })
  const [waveMsg, setWaveMsg] = useState(null)
  const [boss, setBoss] = useState({ visible: false, hp: 0, maxHp: 0, tier: 1 })
  const [finalScore, setFinalScore] = useState(0)
  const [finalWave, setFinalWave] = useState(0)

  const handleStart = useCallback(() => setState('playing'), [])

  const handleGameOver = useCallback((score, wave) => {
    setFinalScore(score); setFinalWave(wave)
    setState('gameover')
  }, [])

  // space/enter để start từ overlay
  useEffect(() => {
    const handler = (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && state !== 'playing') handleStart()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state, handleStart])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <GameCanvas
        state={state}
        onHUDUpdate={setHud}
        onWaveMsg={setWaveMsg}
        onGameOver={handleGameOver}
        onBossUpdate={setBoss}
      />
      {state === 'playing' && (
        <>
          <HUD score={hud.score} wave={hud.wave} lives={hud.lives} isBossWave={hud.isBoss} />
          <BossBar hp={boss.hp} maxHp={boss.maxHp} tier={boss.tier} visible={boss.visible} />
        </>
      )}
      <WaveMessage message={waveMsg} />
      <Overlay
        state={state}
        score={finalScore}
        wave={finalWave}
        onStart={handleStart}
      />
    </div>
  )
}
