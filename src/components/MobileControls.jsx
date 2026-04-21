import { useEffect, useRef, useState } from 'react'

// detect touch device
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export default function MobileControls({ onMove, onShoot }) {
  const [visible, setVisible] = useState(false)
  const joystickRef = useRef(null)
  const stickRef = useRef(null)
  const touchIdRef = useRef(null)
  const centerRef = useRef({ x: 0, y: 0 })
  const shootTouchRef = useRef(null)
  const shootInterval = useRef(null)

  useEffect(() => {
    setVisible(isTouchDevice())
  }, [])

  if (!visible) return null

  const RADIUS = 50

  function onJoyStart(e) {
    e.preventDefault()
    const touch = e.changedTouches[0]
    touchIdRef.current = touch.identifier
    const rect = joystickRef.current.getBoundingClientRect()
    centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }

  function onJoyMove(e) {
    e.preventDefault()
    let touch = null
    for (const t of e.changedTouches) {
      if (t.identifier === touchIdRef.current) { touch = t; break }
    }
    if (!touch) return
    const dx = touch.clientX - centerRef.current.x
    const dy = touch.clientY - centerRef.current.y
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), RADIUS)
    const angle = Math.atan2(dy, dx)
    const nx = Math.cos(angle) * dist
    const ny = Math.sin(angle) * dist
    stickRef.current.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`
    // normalize -1 to 1
    onMove({ x: nx / RADIUS, y: ny / RADIUS })
  }

  function onJoyEnd(e) {
    e.preventDefault()
    stickRef.current.style.transform = 'translate(-50%, -50%)'
    onMove({ x: 0, y: 0 })
    touchIdRef.current = null
  }

  function onShootStart(e) {
    e.preventDefault()
    shootTouchRef.current = e.changedTouches[0].identifier
    onShoot()
    shootInterval.current = setInterval(onShoot, 100)
  }

  function onShootEnd(e) {
    e.preventDefault()
    clearInterval(shootInterval.current)
  }

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 180, pointerEvents: 'none',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0 32px',
    }}>
      {/* Joystick */}
      <div
        ref={joystickRef}
        onTouchStart={onJoyStart}
        onTouchMove={onJoyMove}
        onTouchEnd={onJoyEnd}
        style={{
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(0,255,255,0.08)',
          border: '2px solid rgba(0,255,255,0.3)',
          position: 'relative', pointerEvents: 'all',
          boxShadow: '0 0 16px rgba(0,255,255,0.15)',
        }}
      >
        <div
          ref={stickRef}
          style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(0,255,255,0.35)',
            border: '2px solid #0ff',
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 12px #0ff',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Fire button */}
      <div
        onTouchStart={onShootStart}
        onTouchEnd={onShootEnd}
        style={{
          width: 90, height: 90, borderRadius: '50%',
          background: 'rgba(255,0,255,0.12)',
          border: '2px solid rgba(255,0,255,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#f0f', fontSize: 13, letterSpacing: 2,
          fontFamily: 'monospace', pointerEvents: 'all',
          boxShadow: '0 0 16px rgba(255,0,255,0.2)',
          userSelect: 'none',
        }}
      >
        FIRE
      </div>
    </div>
  )
}
