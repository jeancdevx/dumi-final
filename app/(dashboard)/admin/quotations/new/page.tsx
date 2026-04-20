import Link from 'next/link'

import { ChevronRight, Home } from 'lucide-react'

import { getClients } from '@/modules/clients/queries'
import { getClothesWithVariants } from '@/modules/clothes/queries'
import { CreateQuotationForm } from '@/modules/quotations/ui/components/create-quotation-form'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export const dynamic = 'force-dynamic'

export default async function NewQuotationPage() {
  const [clients, clothes] = await Promise.all([
    getClients(),
    getClothesWithVariants()
  ])

  return (
    <div className='flex flex-1 flex-col gap-6 p-6'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/admin'>
                <Home className='h-4 w-4' />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className='h-4 w-4' />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/admin/quotations'>Cotizaciones</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className='h-4 w-4' />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Nueva cotización</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Nueva cotización</h1>
        <p className='text-muted-foreground'>
          Crea una cotización seleccionando cliente y prendas
        </p>
      </div>

      <CreateQuotationForm clients={clients} clothes={clothes} />
    </div>
  )
}
