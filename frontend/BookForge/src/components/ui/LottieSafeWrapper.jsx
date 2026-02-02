import React, { useState, useEffect, Suspense } from "react"

export default function LottieSafeWrapper({
  src,
  size = 24,
  autoplay = true,
  loop = true,
  className = "",
}) {
  const [Player, setPlayer] = useState(null)
  const [isMounted, setIsMounted] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let mounted = true
    const loadPlayer = async () => {
      try {
        if (typeof window !== "undefined") {
          const mod = await import("@lottiefiles/react-lottie-player")
          const LottiePlayer = mod.Player || mod.default || mod
          if (mounted) setPlayer(() => LottiePlayer)
        }
      } catch (error) {
        console.error("Failed to load Lottie player:", error)
        if (mounted) setHasError(true)
      } finally {
        if (mounted) setIsMounted(true)
      }
    }

    loadPlayer()
    return () => {
      mounted = false
    }
  }, [])

  // Reserve space but show nothing while loading / on error
  if (!isMounted || !Player || hasError) {
    return <div style={{ height: size, width: size }} className={className} />
  }

  return (
    <Suspense fallback={<div style={{ height: size, width: size }} />}>
      <Player
        autoplay={autoplay}
        loop={loop}
        src={src}
        style={{ height: size, width: size }}
        className={className}
        onError={() => setHasError(true)}
      />
    </Suspense>
  )
}
