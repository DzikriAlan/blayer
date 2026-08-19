import type { NextPage } from 'next'
import Head from 'next/head'

import AuthForm from '@/features/auth/components/authForm'

const Login: NextPage = () => {
  return (
    <>
      <Head>
        <title>Masuk — BLAYER</title>
        <meta
          name="description"
          content="Masuk ke Blayer dengan username dan kata sandi, atau dengan akun Google."
        />
        <meta name="robots" content="noindex" />
      </Head>
      <AuthForm mode="login" />
    </>
  )
}

export default Login
