import { requireRole } from '@/modules/auth/lib/dal'
import { AppSidebar } from '@/modules/dashboard/ui/components/app-sidebar'
import { getCurrentEmployee } from '@/modules/employees/queries'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default async function AdminDashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  await requireRole(['owner'])

  const employee = await getCurrentEmployee()

  if (!employee) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar user={employee} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}
