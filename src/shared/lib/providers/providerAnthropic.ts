import Anthropic from '@anthropic-ai/sdk'

import { getAgentModel } from '../agentCatalog'
import {
  PROVIDER_TIMEOUT_MS,
  ProviderError,
  type ProviderRunInput,
  type ProviderRunResult,
} from './providerTypes'

// Penolakan model sengaja tidak dialihkan ke model cadangan. Agent dijalankan
// pada versi yang sudah dipublikasikan, dan mengganti modelnya diam-diam akan
// membuat catatan versi, token, dan biaya tidak lagi mewakili yang benar-benar
// berjalan. Penolakan dikembalikan apa adanya sebagai eksekusi gagal.
export const runAnthropic = async (
  input: ProviderRunInput
): Promise<ProviderRunResult> => {
  const capability = getAgentModel(input.model)

  const client = new Anthropic({
    apiKey: input.apiKey,
    timeout: PROVIDER_TIMEOUT_MS,
    maxRetries: 1,
  })

  try {
    const response = await client.messages.create({
      model: input.model,
      max_tokens: input.maxTokens,
      system: input.instructions,
      messages: [{ role: 'user', content: input.input }],
      ...(capability?.supportsAdaptiveThinking
        ? { thinking: { type: 'adaptive' as const } }
        : {}),
      ...(capability?.supportsEffort
        ? { output_config: { effort: input.effort } }
        : {}),
      ...(capability?.supportsSampling && input.temperature !== null
        ? { temperature: input.temperature }
        : {}),
    })

    if (response.stop_reason === 'refusal') {
      throw new ProviderError(
        'AGENT_REFUSED',
        'Model menolak permintaan ini karena kebijakan keamanannya.',
        422
      )
    }

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim()

    return {
      text,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      stopReason: response.stop_reason ?? 'end_turn',
    }
  } catch (error) {
    if (error instanceof ProviderError) throw error

    if (error instanceof Anthropic.AuthenticationError) {
      throw new ProviderError(
        'PROVIDER_UNAUTHORIZED',
        'Kredensial provider ditolak. Periksa kunci Anthropic project ini.',
        502
      )
    }

    if (error instanceof Anthropic.RateLimitError) {
      throw new ProviderError(
        'PROVIDER_RATE_LIMITED',
        'Provider sedang membatasi permintaan. Coba lagi sebentar lagi.',
        503
      )
    }

    if (error instanceof Anthropic.APIError) {
      throw new ProviderError(
        'PROVIDER_FAILED',
        `Provider menolak permintaan (${error.status ?? 'tanpa status'}).`,
        502
      )
    }

    throw new ProviderError(
      'PROVIDER_UNREACHABLE',
      'Provider tidak bisa dihubungi.',
      502
    )
  }
}
