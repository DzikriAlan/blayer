import type { NextPage } from 'next'
import Head from 'next/head'

import AuthForm from '@/features/auth/components/authForm'

const Register: NextPage = () => {
  return (
    <>
      <Head>
        <title>Daftar — BLAYER</title>
        <meta
          name="description"
          content="Buat akun Blayer untuk mulai menyusun form dan melihat hasilnya."
        />
        <meta name="robots" content="noindex" />
      </Head>
      <AuthForm mode="register" />
    </>
  )
}

export default Register
