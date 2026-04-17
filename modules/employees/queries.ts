import 'server-only'

import { fetchWithAuth } from '@/lib/fetch'
import type { Role } from '@/modules/auth/types'

import type { Employee, GetCurrentEmployeeResponse } from './types'

function normalizeRoles(rawRoles: string[] = []): Role[] {
  return rawRoles
    .map(role => role.toLowerCase())
    .filter((role): role is Role =>
      role === 'owner' || role === 'admin' || role === 'seller'
    )
}

export async function getEmployees(): Promise<Employee[]> {
  const data = await fetchWithAuth<Employee[]>('/admin/employees')

  return data.map(employee => ({
    ...employee,
    roles: normalizeRoles(employee.roles)
  }))
}

export async function getCurrentEmployee(): Promise<GetCurrentEmployeeResponse> {
  const data = await fetchWithAuth<GetCurrentEmployeeResponse>('/employees/me')

  return {
    ...data,
    roles: normalizeRoles(data.roles)
  }
}
