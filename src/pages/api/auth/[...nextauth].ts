import NextAuth from 'next-auth'
import { authOptions } from '@/shared/lib/auth'

export default NextAuth(authOptions)
