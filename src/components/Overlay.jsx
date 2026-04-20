export default function Overlay({ state, score, wave, onStart }) {
  if (state === 'playing') return null
  const isGameOver = state === 'gameover'
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: '#0ff', textAlign: 'center',
      background: 'rgba(0,0,10,0.85)', fontFamily: 'monospace',
    }}>
      <h1 style={{ fontSize: '2rem', textShadow: '0 0 16px #0ff', marginBottom: 8, letterSpacing: 4 }}>
        {isGameOver ? 'GAME OVER' : 'NEON VOID'}
      </h1>
      <p style={{ color: '#f0f', textShadow: '0 0 8px #f0f', marginBottom: 24, fontSize: 13 }}>
        {isGameOver
          ? <>Score: <span style={{ color: '#ff0' }}>{score}</span> &nbsp;|&nbsp; Wave: {wave}</>
          : <>ARROW KEYS / WASD to move &nbsp;|&nbsp; SPACE to fire<br />Survive the cyberpunk onslaught</>
        }
      </p>
      <button onClick={onStart} style={{
        background: 'transparent', border: '1px solid #0ff',
        color: '#0ff', padding: '10px 32px', fontFamily: 'monospace',
        fontSize: 14, cursor: 'pointer', letterSpacing: 2,
      }}
        onMouseEnter={e => e.target.style.background = 'rgba(0,255,255,0.07)'}
        onMouseLeave={e => e.target.style.background = 'transparent'}
      >
        {isGameOver ? 'RETRY' : 'LAUNCH'}
      </button>
    </div>
  )
}
