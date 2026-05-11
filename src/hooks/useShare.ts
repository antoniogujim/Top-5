import { useState, useCallback, useRef, useEffect } from 'react'

export function useShare() {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const share = useCallback(async (id: string, title: string) => {
    const url = `${window.location.origin}/ranking/${id}`

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // usuario canceló — no hacer nada
      }
      return
    }

    await navigator.clipboard.writeText(url)
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 1500)
  }, [])

  return { share, copied }
}
