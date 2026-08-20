export const throwApiError = async (res: Response) => {
  let message = ''

  try {
    const body = (await res.json()) as { message?: string }
    message = typeof body?.message === 'string' ? body.message : ''
  } catch {
  }

  throw new Error(message || res.statusText || 'Permintaan gagal.')
}
