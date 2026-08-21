export interface PayloadPostAuthSession {
  next: string
}

export interface PayloadPostAuthPassword {
  username: string
  password: string
}

export interface PayloadPostAuthRegister {
  username: string
  password: string
}

export interface DataAuthSession {
  id: string
  email: string
  name: string
  avatarUrl: string
}

export interface AuthSession {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataAuthSession | null
}
