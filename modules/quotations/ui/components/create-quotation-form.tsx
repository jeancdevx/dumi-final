'use client'

import { useTransition } from 'react'

import { useRouter } from 'next/navigation'

import { Save, User } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import type { Client } from '@/modules/clients/types'
import type { Clothes } from '@/modules/clothes/types'
import { createQuotationClient } from '@/modules/quotations/lib/quotations-client'
import {
  createQuotationSchema,
  type CreateQuotationInput
} from '@/modules/quotations/schemas'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Spinner } from '@/components/ui/spinner'

import { ClientSelector } from './client-selector'
import { QuotationItemsField } from './quotation-items-field'

interface CreateQuotationFormProps {
  clients: Client[]
  clothes: Clothes[]
  basePath?: string
}

export function CreateQuotationForm({
  clients,
  clothes,
  basePath = '/admin/quotations'
}: CreateQuotationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<CreateQuotationInput>({
    resolver: zodResolver(createQuotationSchema),
    defaultValues: {
      customerId: '',
      details: []
    }
  })

  const watchedDetails =
    useWatch({ control: form.control, name: 'details' }) ?? []
  const watchedCustomerId = useWatch({
    control: form.control,
    name: 'customerId'
  })

  const canSubmit = watchedCustomerId && watchedDetails.length > 0 && !isPending

  const onSubmit = (values: CreateQuotationInput) => {
    startTransition(async () => {
      const result = await createQuotationClient(values)

      if (result.success) {
        toast.success('Cotización creada exitosamente')
        router.refresh()
        router.push(basePath)
      } else {
        toast.error(result.error || 'Error al crear la cotización')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <User className='h-5 w-5' />
              Cliente
            </CardTitle>
            <CardDescription>
              Selecciona el cliente para esta cotización
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name='customerId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                    <ClientSelector
                      clients={clients}
                      value={field.value || ''}
                      onChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Items */}
        <QuotationItemsField clothes={clothes} />

        {/* Submit */}
        <div className='flex justify-end gap-3'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type='submit' disabled={!canSubmit}>
            {isPending ? (
              <>
                <Spinner className='mr-2 h-4 w-4' />
                Creando...
              </>
            ) : (
              <>
                <Save className='mr-2 h-4 w-4' />
                Crear cotización
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
