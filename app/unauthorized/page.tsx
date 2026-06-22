'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { ShieldX } from 'lucide-react'

import {
  getClientSession,
  getRedirectPathByRole
} from '@/modules/auth/lib/session-client'

import { Button } from '@/components/ui/button'

export default function UnauthorizedPage() {
  const [backPath, setBackPath] = useState<string | null>(null)

  useEffect(() => {
    const session = getClientSession()
    queueMicrotask(() => {
      setBackPath(session ? getRedirectPathByRole(session.roles) : null)
    })
  }, [])

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-6 p-6'>
      <div className='flex flex-col items-center gap-4 text-center'>
        <div className='bg-destructive/10 rounded-full p-4'>
          <ShieldX className='text-destructive h-12 w-12' />
        </div>
        <h1 className='text-3xl font-bold tracking-tight'>Acceso denegado</h1>
        <p className='text-muted-foreground max-w-md'>
          No tienes permisos para acceder a esta sección. Si crees que esto es
          un error, contacta con el administrador del sistema.
        </p>
      </div>
      <div className='flex gap-4'>
        {backPath ? (
          <Button asChild>
            <Link href={backPath}>Volver al panel</Link>
          </Button>
        ) : (
          <>
            <Button variant='outline' asChild>
              <Link href='/'>Ir al inicio</Link>
            </Button>
            <Button asChild>
              <Link href='/sign-in'>Iniciar sesión</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
