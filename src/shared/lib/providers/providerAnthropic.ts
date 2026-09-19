import Anthropic from '@anthropic-ai/sdk'

import { getAgentModel } from '../agentCatalog'
import {
  PROVIDER_TIMEOUT_MS,
  ProviderError,
  type ProviderMessage,
  type ProviderRunInput,
  type ProviderRunResult,
  type ProviderTool,
} from './providerTypes'

// Hasil tool harus tiba sebagai satu pesan user berisi semua tool_result
// sekaligus. Memecahnya jadi beberapa pesan membuat model berhenti memanggil
// tool secara paralel.
const getMessages = (messages: ProviderMessage[]) => {
  const result: Anthropic.MessageParam[] = []
  let toolResults: Anthropic.ToolResultBlockParam[] = []

  const flushToolResults = () => {
    if (!toolResults.length) return

    result.push({ role: 'user', content: toolResults })
    toolResults = []
  }

  messages.forEach((message) => {
    if (message.role === 'tool') {
      toolResults.push({
        type: 'tool_result',
        tool_use_id: message.toolCallId ?? '',
        content: message.content,
        ...(message.isError ? { is_error: true } : {}),
      })

      return
    }

    flushToolResults()

    if (message.role === 'user') {
      result.push({ role: 'user', content: message.content })
      return
    }

    const content: Anthropic.ContentBlockParam[] = []

    if (message.content) content.push({ type: 'text', text: message.content })

    message.toolCalls?.forEach((toolCall) =>
      content.push({
        type: 'tool_use',
        id: toolCall.id,
        name: toolCall.name,
        input: toolCall.input,
      })
    )

    if (content.length) result.push({ role: 'assistant', content })
  })

  flushToolResults()

  return result
}

const getTools = (tools: ProviderTool[]): Anthropic.Tool[] =>
  tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.inputSchema as Anthropic.Tool.InputSchema,
  }))

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
      messages: getMessages(input.messages),
      ...(input.tools.length ? { tools: getTools(input.tools) } : {}),
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

    const toolCalls = response.content
      .filter((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use')
      .map((block) => ({
        id: block.id,
        name: block.name,
        input: (block.input ?? {}) as Record<string, unknown>,
      }))

    return {
      text,
      toolCalls,
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
