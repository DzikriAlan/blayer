import {
  PROVIDER_TIMEOUT_MS,
  ProviderError,
  type ProviderRunInput,
  type ProviderRunResult,
} from './providerTypes'

const getBaseUrl = () =>
  (process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/+$/, '')

interface ChatCompletion {
  choices?: { message?: { content?: unknown }; finish_reason?: unknown }[]
  usage?: { prompt_tokens?: unknown; completion_tokens?: unknown }
}

const getNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0

// Bentuk Chat Completions dipakai apa adanya, jadi endpoint lain yang memakai
// bentuk yang sama (proxy, gateway, model lokal) cukup mengganti OPENAI_BASE_URL.
export const runOpenai = async (
  input: ProviderRunInput
): Promise<ProviderRunResult> => {
  let response: Response

  try {
    response = await fetch(`${getBaseUrl()}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${input.apiKey}`,
      },
      body: JSON.stringify({
        model: input.model,
        max_completion_tokens: input.maxTokens,
        messages: [
          { role: 'system', content: input.instructions },
          { role: 'user', content: input.input },
        ],
        ...(input.temperature !== null ? { temperature: input.temperature } : {}),
      }),
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    })
  } catch {
    throw new ProviderError(
      'PROVIDER_UNREACHABLE',
      'Provider tidak bisa dihubungi.',
      502
    )
  }

  if (response.status === 401 || response.status === 403) {
    throw new ProviderError(
      'PROVIDER_UNAUTHORIZED',
      'Kredensial provider ditolak. Periksa kunci OpenAI project ini.',
      502
    )
  }

  if (response.status === 429) {
    throw new ProviderError(
      'PROVIDER_RATE_LIMITED',
      'Provider sedang membatasi permintaan. Coba lagi sebentar lagi.',
      503
    )
  }

  if (!response.ok) {
    throw new ProviderError(
      'PROVIDER_FAILED',
      `Provider menolak permintaan (${response.status}).`,
      502
    )
  }

  let payload: ChatCompletion

  try {
    payload = (await response.json()) as ChatCompletion
  } catch {
    throw new ProviderError(
      'PROVIDER_FAILED',
      'Jawaban provider bukan JSON yang bisa dibaca.',
      502
    )
  }

  const choice = payload.choices?.[0]
  const content = choice?.message?.content

  if (typeof content !== 'string') {
    throw new ProviderError(
      'PROVIDER_FAILED',
      'Jawaban provider tidak memuat teks.',
      502
    )
  }

  return {
    text: content.trim(),
    inputTokens: getNumber(payload.usage?.prompt_tokens),
    outputTokens: getNumber(payload.usage?.completion_tokens),
    stopReason:
      typeof choice?.finish_reason === 'string' ? choice.finish_reason : 'stop',
  }
}
