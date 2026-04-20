import { useEffect, useRef } from 'react'

export function useInput() {
  const keys = useRef({})

  useEffect(() => {
    const down = (e) => {
      keys.current[e.key] = true
      if (e.key === ' ') e.preventDefault()
    }
    const up = (e) => { keys.current[e.key] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  return keys
}
