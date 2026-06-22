'use client'

import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { AlertCircle } from 'lucide-react'

import { getClientSession } from '@/modules/auth/lib/session-client'
import { getEmployeesClient } from '@/modules/employees/lib/employees-client'
import type { Employee } from '@/modules/employees/types'

import { ClientOnly } from '@/components/client-only'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

import { CreateEmployeeForm } from './create-employee-form'
import { EmployeesTable } from './employees-table'

export function EmployeesPageClient() {
  return (
    <ClientOnly
      fallback={<EmployeesPageFallback text='Verificando sesión...' />}
    >
      <EmployeesPageClientContent />
    </ClientOnly>
  )
}

function EmployeesPageFallback({ text }: { text: string }) {
  return (
    <div className='text-muted-foreground flex flex-1 items-center justify-center gap-2 p-6 text-sm'>
      <Spinner />
      {text}
    </div>
  )
}

function EmployeesPageClientContent() {
  const router = useRouter()
  const session = useMemo(() => getClientSession(), [])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!session) {
      router.replace('/sign-in')
      return
    }

    if (!session.tenantId) {
      router.replace('/tenant-setup')
      return
    }

    const canViewEmployees =
      session.roles.includes('owner') || session.roles.includes('admin')

    if (!canViewEmployees) {
      router.replace('/unauthorized')
    }
  }, [router, session])

  useEffect(() => {
    if (!session) return

    let isCurrent = true

    async function loadEmployees() {
      setIsLoading(true)
      setError(null)

      const result = await getEmployeesClient()

      if (!isCurrent) return

      if (result.success) {
        setEmployees(result.data ?? [])
      } else {
        setEmployees([])
        setError(result.error || 'No se pudo cargar la lista de empleados')
      }

      setIsLoading(false)
    }

    void loadEmployees()

    return () => {
      isCurrent = false
    }
  }, [reloadKey, session])

  if (!session) {
    return <EmployeesPageFallback text='Verificando sesión...' />
  }

  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Empleados</h1>
          <p className='text-muted-foreground'>
            Visualiza y gestiona el estado de los empleados de tu organización
          </p>
        </div>
        <CreateEmployeeForm
          canAssignAdminRole={session.roles.includes('owner')}
          onCreated={() => setReloadKey(key => key + 1)}
        />
      </div>

      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error al cargar empleados</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='mt-2'
              onClick={() => setReloadKey(key => key + 1)}
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className='text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm'>
          <Spinner />
          Cargando empleados...
        </div>
      ) : (
        <EmployeesTable
          employees={employees}
          currentUserRoles={session.roles}
          currentUserEmail={session.email}
          currentUserSub={session.userId}
          onStatusUpdated={() => setReloadKey(key => key + 1)}
        />
      )}
    </div>
  )
}
