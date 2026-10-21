import type { NextApiRequest, NextApiResponse } from 'next'

import { sendSuccess } from '../../../shared/response'
import { getQueryValue, parseDto } from '../../../shared/route'
import { searchVideosValidation, videoIdValidation } from '../dto/videos.dto'
import { videosService, type VideosService } from '../services/videos.service'

// Data video beranda bersifat publik, jadi rute ini tidak meminta sesi admin.
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  async loadVideosSearch(req: NextApiRequest, res: NextApiResponse) {
    const dto = parseDto(searchVideosValidation, req.query)
    const { data, pagination } = await this.videosService.fetchVideosSearch(dto)

    return sendSuccess(res, {
      message: `Video untuk "${dto.q.join(', ')}" berhasil dimuat`,
      data,
      pagination,
    })
  }

  async loadVideosDetail(req: NextApiRequest, res: NextApiResponse) {
    const { videoId } = parseDto(videoIdValidation, {
      videoId: getQueryValue(req.query.videoId),
    })

    return sendSuccess(res, {
      message: 'Video berhasil dimuat',
      data: await this.videosService.fetchVideosDetail(videoId),
    })
  }
}

export const videosController = new VideosController(videosService)
