'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import {
  getClientSession,
  getRedirectPathByRole
} from '@/modules/auth/lib/session-client'

interface AuthRouteGuardProps {
  children: React.ReactNode
  mode: 'guest' | 'tenant-setup'
}

export function AuthRouteGuard({ children, mode }: AuthRouteGuardProps) {
  const router = useRouter()
  const [canRender, setCanRender] = useState(false)

  useEffect(() => {
    const session = getClientSession()

    if (mode === 'guest') {
      if (session?.tenantId) {
        router.replace(getRedirectPathByRole(session.roles))
        return
      }

      if (session && !session.tenantId) {
        router.replace('/tenant-setup')
        return
      }
    }

    if (mode === 'tenant-setup') {
      if (!session) {
        router.replace('/sign-in')
        return
      }

      if (session.tenantId) {
        router.replace(getRedirectPathByRole(session.roles))
        return
      }
    }

    queueMicrotask(() => setCanRender(true))
  }, [mode, router])

  if (!canRender) return null

  return children
}
