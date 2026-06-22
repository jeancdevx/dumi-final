import { AuthRouteGuard } from '@/modules/auth/ui/components/auth-route-guard'
import { TenantSetupForm } from '@/modules/auth/ui/components/tenant-setup-form'

export const metadata = {
  title: 'Registrar empresa — Telar',
  description: 'Configura los datos de tu empresa en Telar'
}

export default function TenantSetupPage() {
  return (
    <AuthRouteGuard mode='tenant-setup'>
      <TenantSetupForm />
    </AuthRouteGuard>
  )
}
