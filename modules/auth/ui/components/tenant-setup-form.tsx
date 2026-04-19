'use client'

import { useActionState, useEffect, useTransition } from 'react'

import { useRouter } from 'next/navigation'

import { BuildingIcon, OctagonAlertIcon } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { tenantSetup } from '@/modules/auth/actions/tenant-setup'
import { tenantSetupSchema, type TenantSetupInput } from '@/modules/auth/schemas'
import type { ActionResponse } from '@/modules/auth/types'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const initialState: ActionResponse<{ redirectTo: string }> = { success: false }

export function TenantSetupForm() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(tenantSetup, initialState)
  const [isTransitioning, startTransition] = useTransition()

  const form = useForm<TenantSetupInput>({
    resolver: zodResolver(tenantSetupSchema),
    defaultValues: { name: '', ruc: '', address: '' }
  })

  useEffect(() => {
    if (state.success && state.data?.redirectTo) {
      router.push(state.data.redirectTo)
    }
  }, [state, router])

  return (
    <div className='flex min-h-svh w-full flex-col bg-[#faf9f8] md:flex-row'>
      {/* Panel izquierdo */}
      <div className='relative hidden w-1/2 items-center justify-center overflow-hidden bg-[#2b1608] p-12 md:flex'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,#5c4130_0%,#2b1608_60%)] opacity-90' />
        <div className='relative z-10 max-w-md text-white'>
          <h1 className='mb-6 text-6xl leading-none font-black tracking-tight'>Telar</h1>
          <p className='text-2xl leading-relaxed font-light text-[#e6bea8]'>
            Registra tu empresa para comenzar a gestionar tu negocio.
          </p>
          <div className='mt-12 flex gap-4'>
            <div className='h-1 w-4 rounded-full bg-[#e6bea84d]' />
            <div className='h-1 w-4 rounded-full bg-[#e6bea84d]' />
            <div className='h-1 w-12 rounded-full bg-[#e6bea8]' />
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className='flex flex-1 items-center justify-center p-6 md:p-12 lg:p-24'>
        <div className='w-full max-w-md space-y-8'>
          <div className='space-y-2'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4f3f2]'>
              <BuildingIcon className='size-6 text-[#2b1608]' />
            </div>
            <h2 className='text-4xl leading-tight font-bold tracking-tight text-[#2b1608]'>
              Tu empresa
            </h2>
            <p className='font-medium text-[#50453f]'>
              Completa los datos de tu negocio para continuar.
            </p>
          </div>

          {state.error && (
            <Alert variant='destructive' className='bg-red-50'>
              <OctagonAlertIcon className='size-4' />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <form
            id='tenant-setup-form'
            className='space-y-6'
            onSubmit={form.handleSubmit(data => {
              startTransition(() => {
                const formData = new FormData()
                formData.append('name', data.name)
                if (data.ruc) formData.append('ruc', data.ruc)
                if (data.address) formData.append('address', data.address)
                formAction(formData)
              })
            })}
          >
            <div className='space-y-5'>
              <Controller
                name='name'
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className='space-y-1.5'>
                    <label
                      htmlFor='company-name'
                      className='ml-1 block text-sm font-semibold text-[#50453f]'
                    >
                      Nombre de la empresa <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      {...field}
                      id='company-name'
                      name='name'
                      placeholder='Ej. Textilería Telar S.A.C.'
                      className='h-12 rounded-xl border-[#d3c3bb] bg-white'
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error?.message && (
                      <p className='text-sm text-red-600'>{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                name='ruc'
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className='space-y-1.5'>
                    <label
                      htmlFor='ruc'
                      className='ml-1 block text-sm font-semibold text-[#50453f]'
                    >
                      RUC{' '}
                      <span className='font-normal text-[#82746e]'>(opcional)</span>
                    </label>
                    <Input
                      {...field}
                      id='ruc'
                      name='ruc'
                      placeholder='Ej. 20123456789'
                      maxLength={11}
                      className='h-12 rounded-xl border-[#d3c3bb] bg-white'
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error?.message && (
                      <p className='text-sm text-red-600'>{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />

              <Controller
                name='address'
                control={form.control}
                render={({ field, fieldState }) => (
                  <div className='space-y-1.5'>
                    <label
                      htmlFor='address'
                      className='ml-1 block text-sm font-semibold text-[#50453f]'
                    >
                      Dirección{' '}
                      <span className='font-normal text-[#82746e]'>(opcional)</span>
                    </label>
                    <Input
                      {...field}
                      id='address'
                      name='address'
                      placeholder='Ej. Calle Zepita 23, Lima'
                      className='h-12 rounded-xl border-[#d3c3bb] bg-white'
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error?.message && (
                      <p className='text-sm text-red-600'>{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />
            </div>

            <Button
              type='submit'
              form='tenant-setup-form'
              disabled={isPending || isTransitioning}
              className='h-12 w-full rounded-xl bg-[linear-gradient(45deg,#2b1608_0%,#5c4130_100%)] text-lg font-bold text-white hover:opacity-95'
            >
              {isPending || isTransitioning ? 'Guardando...' : 'Registrar empresa'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
