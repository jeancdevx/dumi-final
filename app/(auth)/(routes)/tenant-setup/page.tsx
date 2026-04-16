import { redirect } from 'next/navigation'

import { getRedirectPathByRole, getSession } from '@/modules/auth/lib/dal'
import { TenantSetupForm } from '@/modules/auth/ui/components/tenant-setup-form'

export const metadata = {
  title: 'Registrar empresa — Telar',
  description: 'Configura los datos de tu empresa en Telar'
}

export default async function TenantSetupPage() {
  const session = await getSession()

  // Sin sesión → ir al login
  if (!session) {
    redirect('/sign-in')
  }

  // Ya tiene tenant → ir al dashboard
  if (session.tenantId) {
    redirect(getRedirectPathByRole(session.roles))
  }

  return <TenantSetupForm />
}
