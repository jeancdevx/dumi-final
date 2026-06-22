'use client'

import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { getClientSession } from '@/modules/auth/lib/session-client'
import type { Role } from '@/modules/auth/types'
import { getCurrentEmployeeClient } from '@/modules/employees/lib/employees-client'
import type { GetCurrentEmployeeResponse } from '@/modules/employees/types'

import { ClientOnly } from '@/components/client-only'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Spinner } from '@/components/ui/spinner'

import { AppSidebar } from './app-sidebar'

interface DashboardShellClientProps {
  allowedRoles: Role[]
  children: React.ReactNode
}

function DashboardShellFallback() {
  return (
    <div className='text-muted-foreground flex min-h-screen items-center justify-center gap-2 text-sm'>
      <Spinner />
      Cargando panel...
    </div>
  )
}

export function DashboardShellClient({
  allowedRoles,
  children
}: DashboardShellClientProps) {
  return (
    <ClientOnly fallback={<DashboardShellFallback />}>
      <DashboardShellClientContent allowedRoles={allowedRoles}>
        {children}
      </DashboardShellClientContent>
    </ClientOnly>
  )
}

function DashboardShellClientContent({
  allowedRoles,
  children
}: DashboardShellClientProps) {
  const router = useRouter()
  const session = useMemo(() => getClientSession(), [])
  const [employee, setEmployee] = useState<GetCurrentEmployeeResponse | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      router.replace('/sign-in')
      return
    }

    if (!session.tenantId) {
      router.replace('/tenant-setup')
      return
    }

    const hasRole = session.roles.some(role => allowedRoles.includes(role))
    if (!hasRole) {
      router.replace('/unauthorized')
    }
  }, [allowedRoles, router, session])

  useEffect(() => {
    if (!session) return
    if (!session.roles.some(role => allowedRoles.includes(role))) return

    let isCurrent = true

    async function loadEmployee() {
      setIsLoading(true)
      const result = await getCurrentEmployeeClient()

      if (!isCurrent) return

      if (result.success && result.data) {
        setEmployee(result.data)
      } else {
        router.replace('/sign-in')
      }

      setIsLoading(false)
    }

    void loadEmployee()

    return () => {
      isCurrent = false
    }
  }, [allowedRoles, router, session])

  if (isLoading || !employee) {
    return <DashboardShellFallback />
  }

  return (
    <SidebarProvider>
      <AppSidebar user={employee} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
