'use client'

import { useEffect, useState } from 'react'

import { AlertCircle, Mail, ShieldCheck } from 'lucide-react'

import { getCurrentEmployeeClient } from '@/modules/employees/lib/employees-client'
import type { GetCurrentEmployeeResponse } from '@/modules/employees/types'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { UpdateMyProfileForm } from './update-my-profile-form'

const roleColors: Record<string, string> = {
  owner: 'border-amber-200 bg-amber-100 text-amber-800',
  admin: 'border-blue-200 bg-blue-100 text-blue-800',
  seller: 'border-green-200 bg-green-100 text-green-800'
}

function ProfileSkeleton() {
  return (
    <div className='flex flex-1 flex-col'>
      <Skeleton className='h-36 w-full rounded-none' />
      <div className='space-y-6 px-6 pb-6'>
        <div className='relative -mt-14 flex items-end gap-5'>
          <Skeleton className='h-28 w-28 rounded-2xl' />
          <div className='mb-2 space-y-2'>
            <Skeleton className='h-8 w-56' />
            <Skeleton className='h-4 w-72' />
          </div>
        </div>
        <div className='grid gap-6 lg:grid-cols-[300px_1fr]'>
          <Skeleton className='h-72' />
          <Skeleton className='h-80' />
        </div>
      </div>
    </div>
  )
}

export function ProfilePageClient() {
  const [employee, setEmployee] = useState<GetCurrentEmployeeResponse | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true

    async function loadProfile() {
      setIsLoading(true)
      setError(null)

      const result = await getCurrentEmployeeClient()

      if (!isCurrent) return

      if (result.success && result.data) {
        setEmployee(result.data)
      } else {
        setEmployee(null)
        setError(result.error || 'No se pudo cargar el perfil')
      }

      setIsLoading(false)
    }

    void loadProfile()

    return () => {
      isCurrent = false
    }
  }, [reloadKey])

  if (isLoading) return <ProfileSkeleton />

  if (error || !employee) {
    return (
      <div className='flex flex-1 flex-col gap-6 p-6'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error al cargar perfil</AlertTitle>
          <AlertDescription>
            <p>{error ?? 'Perfil no encontrado'}</p>
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
      </div>
    )
  }

  const initials =
    `${employee.names.charAt(0)}${employee.lastNames.charAt(0)}`.toUpperCase()
  const fullName = `${employee.names} ${employee.lastNames}`

  return (
    <div className='flex flex-1 flex-col'>
      <div className='relative h-36 bg-gradient-to-r from-neutral-900 to-neutral-700'>
        <div
          className='absolute inset-0 opacity-10'
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      <div className='px-6 pb-6'>
        <div className='relative -mt-14 mb-6 flex items-end gap-5'>
          <div className='bg-primary text-primary-foreground border-background flex h-28 w-28 items-center justify-center rounded-2xl border-4 text-3xl font-bold shadow-lg'>
            {initials}
          </div>
          <div className='mb-2'>
            <h1 className='text-2xl font-bold tracking-tight'>{fullName}</h1>
            <p className='text-muted-foreground text-sm'>{employee.email}</p>
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-[300px_1fr]'>
          <div className='space-y-4'>
            <div className='bg-card rounded-xl border p-5 shadow-sm'>
              <h2 className='text-muted-foreground mb-4 text-sm font-semibold tracking-widest uppercase'>
                Información
              </h2>

              <div className='space-y-4'>
                <div className='flex items-start gap-3'>
                  <div className='bg-muted mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg'>
                    <Mail className='text-muted-foreground h-4 w-4' />
                  </div>
                  <div>
                    <p className='text-muted-foreground text-xs'>
                      Correo electrónico
                    </p>
                    <p className='text-sm font-medium break-all'>
                      {employee.email}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className='flex items-start gap-3'>
                  <div className='bg-muted mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg'>
                    <ShieldCheck className='text-muted-foreground h-4 w-4' />
                  </div>
                  <div className='flex-1'>
                    <p className='text-muted-foreground mb-2 text-xs'>
                      Roles asignados
                    </p>
                    <div className='flex flex-wrap gap-1.5'>
                      {employee.roles.map(role => (
                        <span
                          key={role}
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            roleColors[role] ?? 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {role.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='bg-card rounded-xl border p-5 shadow-sm'>
              <h2 className='text-muted-foreground mb-3 text-sm font-semibold tracking-widest uppercase'>
                Estado de cuenta
              </h2>
              <div className='flex items-center gap-2'>
                <span className='relative flex h-2.5 w-2.5'>
                  <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75' />
                  <span className='relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500' />
                </span>
                <span className='text-sm font-medium text-green-700'>
                  Cuenta activa
                </span>
              </div>
            </div>
          </div>

          <div className='bg-card rounded-xl border p-6 shadow-sm'>
            <div className='mb-6'>
              <h2 className='text-lg font-semibold'>
                Editar información personal
              </h2>
              <p className='text-muted-foreground mt-1 text-sm'>
                Actualiza tus nombres y apellidos visibles en el sistema. Tu
                correo no puede ser modificado.
              </p>
            </div>
            <Separator className='mb-6' />
            <UpdateMyProfileForm
              currentEmployee={employee}
              onUpdated={updatedEmployee => setEmployee(updatedEmployee)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
