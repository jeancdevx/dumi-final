export type Role = 'owner' | 'admin' | 'seller'

// Payload del idToken de Cognito
export interface CognitoJWTPayload {
  sub: string
  email: string
  email_verified: boolean
  name: string
  family_name: string
  'cognito:username': string
  'cognito:groups'?: Role[]
  'custom:tenant_id'?: string
  aud: string
  iss: string
  token_use: 'id'
  auth_time: number
  exp: number
  iat: number
}

export interface UserSession {
  userId: string
  email: string
  name: string
  familyName: string
  roles: Role[]
  tenantId: string | null
}

export interface ActionResponse<T = void> {
  success: boolean
  error?: string
  data?: T
  redirectTo?: string
}
