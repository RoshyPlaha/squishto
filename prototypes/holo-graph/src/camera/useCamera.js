import { useEffect, useState } from 'react'

// Starts the front camera when any camera feature is on and stops it when none are.
export function useCamera(videoRef, enabled) {
  const [status, setStatus] = useState('off')

  useEffect(() => {
    if (!enabled) {
      setStatus('off')
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported')
      return
    }
    let stream
    let cancelled = false
    setStatus('starting')
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
      .then(async (s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop())
        stream = s
        videoRef.current.srcObject = s
        await videoRef.current.play().catch(() => {})
        setStatus('live')
      })
      .catch(() => !cancelled && setStatus('denied'))

    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [enabled, videoRef])

  return status
}
