import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { ECOMMERCE_ROUTES } from '@/modules/ecommerce/auth/constants'
import { getCustomerSession } from '@/modules/ecommerce/auth/lib/dal'
import { CustomerSignInForm } from '@/modules/ecommerce/auth/ui/components/customer-sign-in-form'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Iniciar sesión | TELAR',
  description: 'Inicia sesión en tu cuenta de TELAR'
}

export default async function CustomerSignInPage() {
  const session = await getCustomerSession()

  // Si ya está autenticado como cliente, redirigir al catálogo
  if (session) {
    redirect(ECOMMERCE_ROUTES.CATALOG)
  }

  return (
    <Card>
      <CardHeader className='text-center'>
        <CardTitle className='text-2xl'>Iniciar sesión</CardTitle>
        <CardDescription>
          Ingresa tus credenciales para acceder a tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CustomerSignInForm />
      </CardContent>
    </Card>
  )
}
