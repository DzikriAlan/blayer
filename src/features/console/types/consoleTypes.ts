export interface PayloadPostConsoleLogin {
  username: string
  password: string
}

export interface DataConsoleSession {
  token: string
  username: string
  expiresAt: string
  isDefaultCredentials: boolean
}
