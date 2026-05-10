import { useState, useCallback } from 'react'

export function useShare() {
  const [copied, setCopied] = useState(false)

  // Demostrativo: solo aportaría valor real si share se pasara como prop a un hijo con React.memo
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
    setTimeout(() => setCopied(false), 1500)
  }, [])

  return { share, copied }
}
