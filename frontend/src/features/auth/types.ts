export interface LoginRequest {
  email: string
  password: string
}

export interface AccessTokenResponse {
  access: string
}

export interface AuthError {
  detail: string
}
