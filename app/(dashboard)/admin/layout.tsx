import { DashboardShellClient } from '@/modules/dashboard/ui/components/dashboard-shell-client'

export default function AdminDashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShellClient allowedRoles={['owner', 'admin']}>
      {children}
    </DashboardShellClient>
  )
}
