export default function HUD({ score, wave, lives, isBossWave }) {
  const shields = '♦'.repeat(Math.max(0, lives)) + '♢'.repeat(Math.max(0, 5 - lives))
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%',
      display: 'flex', justifyContent: 'space-between',
      padding: '10px 16px', color: '#0ff', fontSize: 14,
      textShadow: '0 0 8px #0ff', pointerEvents: 'none', fontFamily: 'monospace',
    }}>
      <span>SCORE: {score}</span>
      <span style={isBossWave ? { color: '#f00', textShadow: '0 0 8px #f00' } : {}}>
        {isBossWave ? `BOSS WAVE ${Math.floor(wave / 5)}` : `WAVE ${wave}`}
      </span>
      <span style={{ color: '#f0f', textShadow: '0 0 8px #f0f' }}>SHIELDS: {shields}</span>
    </div>
  )
}
