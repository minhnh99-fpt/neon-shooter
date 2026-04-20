export default function BossBar({ hp, maxHp, tier, visible }) {
  if (!visible) return null
  const pct = maxHp > 0 ? (hp / maxHp) * 100 : 0
  return (
    <div style={{
      position: 'absolute', bottom: 18, left: '50%',
      transform: 'translateX(-50%)', width: 340, textAlign: 'center',
      fontFamily: 'monospace',
    }}>
      <span style={{ color: '#ff0', fontSize: 11, letterSpacing: 3, textShadow: '0 0 8px #ff0' }}>
        BOSS LV.{tier}
      </span>
      <div style={{
        background: '#222', height: 10, border: '1px solid #ff0',
        marginTop: 4, boxShadow: '0 0 8px #ff04',
      }}>
        <div style={{
          background: '#ff0', height: '100%', width: `${pct}%`,
          transition: 'width 0.1s', boxShadow: '0 0 8px #ff0',
        }} />
      </div>
    </div>
  )
}
