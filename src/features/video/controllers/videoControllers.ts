import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

import { YtTopicError } from '@/shared/lib/ytTopicClient'
import { useVideoStates } from '../states/videoStates'
import { getVideo } from '../services/videoServices'

export const useVideoControllers = () => {
  const { payloadGetVideo, setVideo } = useVideoStates()

  const fetchVideo = useQuery({
    queryKey: ['video', payloadGetVideo.id],
    queryFn: () => getVideo(payloadGetVideo),
    enabled: !!payloadGetVideo.id,
    staleTime: 10 * 60 * 1000,
    // Video yang memang tidak ada tidak perlu dicoba ulang
    retry: (count, error) => !(error instanceof YtTopicError && [404, 422].includes(error.status)) && count < 2,
  })

  useEffect(() => {
    if (!payloadGetVideo.id || fetchVideo.isPending) return setVideo({ status: 'loading' })

    if (fetchVideo.isError) {
      const isMissing = fetchVideo.error instanceof YtTopicError && [404, 422].includes(fetchVideo.error.status)
      return setVideo({
        status: isMissing ? 'empty' : 'error',
        statusSubtitle: isMissing ? 'Video yang kamu cari tidak ada atau sudah dihapus.' : fetchVideo.error.message,
        data: null,
      })
    }

    setVideo({ data: fetchVideo.data ?? null, status: fetchVideo.data ? 'success' : 'empty' })
  }, [payloadGetVideo.id, fetchVideo.data, fetchVideo.isPending, fetchVideo.isError, fetchVideo.error, setVideo])

  return { fetchVideo }
}
