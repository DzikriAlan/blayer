import {
  PROVIDER_TIMEOUT_MS,
  ProviderError,
  type ProviderMessage,
  type ProviderRunInput,
  type ProviderRunResult,
  type ProviderTool,
} from './provider.types'

const getBaseUrl = () =>
  (process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/+$/, '')

interface ChatToolCall {
  id?: unknown
  function?: { name?: unknown; arguments?: unknown }
}

interface ChatCompletion {
  choices?: {
    message?: { content?: unknown; tool_calls?: ChatToolCall[] }
    finish_reason?: unknown
  }[]
  usage?: { prompt_tokens?: unknown; completion_tokens?: unknown }
}

const getNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0

const getMessages = (instructions: string, messages: ProviderMessage[]) => [
  { role: 'system', content: instructions },
  ...messages.map((message) => {
    if (message.role === 'tool') {
      return {
        role: 'tool',
        tool_call_id: message.toolCallId ?? '',
        content: message.content,
      }
    }

    if (message.role === 'assistant' && message.toolCalls?.length) {
      return {
        role: 'assistant',
        content: message.content || null,
        tool_calls: message.toolCalls.map((toolCall) => ({
          id: toolCall.id,
          type: 'function',
          function: {
            name: toolCall.name,
            arguments: JSON.stringify(toolCall.input),
          },
        })),
      }
    }

    return { role: message.role, content: message.content }
  }),
]

const getTools = (tools: ProviderTool[]) =>
  tools.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }))

// Argumen tool datang sebagai string JSON. Model bisa mengeluarkan JSON yang
// tidak utuh, jadi hasilnya selalu di-parse dengan penjagaan.
const getToolInput = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return {}

  try {
    const parsed = JSON.parse(value) as unknown

    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

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
        messages: getMessages(input.instructions, input.messages),
        ...(input.tools.length ? { tools: getTools(input.tools) } : {}),
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
  const rawToolCalls = choice?.message?.tool_calls ?? []

  const toolCalls = rawToolCalls.map((toolCall, index) => ({
    id: typeof toolCall.id === 'string' ? toolCall.id : `call_${index}`,
    name:
      typeof toolCall.function?.name === 'string' ? toolCall.function.name : '',
    input: getToolInput(toolCall.function?.arguments),
  }))

  if (typeof content !== 'string' && !toolCalls.length) {
    throw new ProviderError(
      'PROVIDER_FAILED',
      'Jawaban provider tidak memuat teks.',
      502
    )
  }

  return {
    text: typeof content === 'string' ? content.trim() : '',
    toolCalls,
    inputTokens: getNumber(payload.usage?.prompt_tokens),
    outputTokens: getNumber(payload.usage?.completion_tokens),
    stopReason:
      typeof choice?.finish_reason === 'string' ? choice.finish_reason : 'stop',
  }
}
