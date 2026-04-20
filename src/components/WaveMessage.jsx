import { useEffect, useState } from 'react'

export default function WaveMessage({ message }) {
  const [visible, setVisible] = useState(false)
  const [text, setText] = useState('')

  useEffect(() => {
    if (!message) return
    setText(message.text)
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 1800)
    return () => clearTimeout(t)
  }, [message])

  const color = message?.color || '#ff0'

  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%,-50%)',
      color, fontSize: 20, letterSpacing: 4,
      textShadow: `0 0 12px ${color}`,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.4s',
      pointerEvents: 'none', fontFamily: 'monospace',
    }}>
      {text}
    </div>
  )
}
