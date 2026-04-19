import type { Metadata } from 'next'

import { CustomerSignUpForm } from '@/modules/ecommerce/auth/ui/components/customer-sign-up-form'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Crear cuenta | TELAR',
  description: 'Crea tu cuenta para comprar en TELAR'
}

export default function SignUpPage() {
  return (
    <Card>
      <CardHeader className='text-center'>
        <CardTitle className='text-2xl'>Crear cuenta</CardTitle>
        <CardDescription>
          Ingresa tus datos para crear tu cuenta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CustomerSignUpForm />
      </CardContent>
    </Card>
  )
}
