import type { NextApiRequest, NextApiResponse } from 'next'

import { withApi } from '@/shared/lib/apiHandler'
import { getAdminGuard } from '@/shared/lib/agentAuth'
import { AGENT_MODELS, DEFAULT_AGENT_MODEL } from '@/shared/lib/agentCatalog'
import { sendMethodNotAllowed, sendSuccess } from '@/shared/lib/apiResponse'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (!getAdminGuard(req, res)) return
  if (req.method !== 'GET') return sendMethodNotAllowed(res, req.method, ['GET'])

  return sendSuccess(res, {
    message: 'Katalog model berhasil dimuat',
    data: { defaultModel: DEFAULT_AGENT_MODEL, models: AGENT_MODELS },
  })
}

export default withApi('models', handler)
