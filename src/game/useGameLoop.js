import { useEffect, useRef } from 'react'

export function useGameLoop(callback) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    let rafId
    const loop = () => {
      cbRef.current()
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [])
}
