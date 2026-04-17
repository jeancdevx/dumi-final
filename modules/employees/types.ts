import type { Role } from '@/modules/auth/types'

export interface Employee {
  id: string
  sub: string
  names: string
  lastNames: string
  email: string
  tenantId: string
  isActive: boolean
  roles: Role[]
  createdAt: string
  updatedAt: string
}

export interface CreateEmployeeResponse {
  id: string
  names: string
  lastNames: string
  email: string
}

export interface GetEmployeesResponse {
  employees: Employee[]
}

export interface GetCurrentEmployeeResponse {
  id: string
  names: string
  lastNames: string
  email: string
  roles: Role[]
}
