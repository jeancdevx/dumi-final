'use client'

import { useSyncExternalStore } from 'react'

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  return isMounted ? children : fallback
}
