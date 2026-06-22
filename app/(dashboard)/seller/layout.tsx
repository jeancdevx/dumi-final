import { DashboardShellClient } from '@/modules/dashboard/ui/components/dashboard-shell-client'

export default function SellerDashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShellClient allowedRoles={['seller']}>
      {children}
    </DashboardShellClient>
  )
}
