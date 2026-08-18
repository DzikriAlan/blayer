import { useMutation } from '@tanstack/react-query'
import { useUploadsStates } from '../states/uploadsStates'
import { postUploadsBanner } from '../services/uploadsServices'
import type { PayloadPostUploadsBanner } from '../types/uploadsTypes'

export const useUploadsControllers = () => {
  const { setUploadsBanner } = useUploadsStates()

  const storeUploadsBanner = useMutation({
    mutationFn: (payload: PayloadPostUploadsBanner) =>
      postUploadsBanner(payload),
    onMutate: () => {
      setUploadsBanner({ status: 'loading' })
    },
    onSuccess: (data) => {
      setUploadsBanner({
        data: data ?? null,
        status: data ? 'success' : 'empty',
      })
    },
    onError: (error) => {
      setUploadsBanner({
        status: 'error',
        statusSubtitle:
          error instanceof Error && error.message
            ? error.message
            : 'Banner gagal diunggah. Coba lagi atau pakai gambar lain.',
      })
    },
  })

  return { storeUploadsBanner }
}
