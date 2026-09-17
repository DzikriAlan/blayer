import type { ReactNode } from 'react'
import Loader from './Loader'
import PlaceholderSection from './PlaceholderSection'

interface Props {
  status: string
  statusTitle?: string
  statusSubtitle?: string
  skeleton?: ReactNode
  children: ReactNode
}

export default function LoadData({ status, statusTitle, statusSubtitle, skeleton, children }: Readonly<Props>) {
  if (status === 'loading') {
    return skeleton ? <>{skeleton}</> : <Loader active />
  }

  if (status === 'error') {
    return (
      <PlaceholderSection
        title={statusTitle ?? 'Terjadi Kesalahan'}
        subtitle={statusSubtitle ?? 'Silakan coba lagi.'}
      />
    )
  }

  if (status === 'empty') {
    return (
      <PlaceholderSection
        title={statusTitle ?? 'Data Kosong'}
        subtitle={statusSubtitle ?? 'Belum ada data tersedia.'}
      />
    )
  }

  return <>{children}</>
}
