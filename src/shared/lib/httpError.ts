/**
 * Menaikkan pesan error dari server ke lapisan yang menampilkannya.
 *
 * Sebelumnya service melempar `new Error(res.statusText)`, sehingga penolakan
 * yang paling perlu dibaca pengisi — "Field Nama wajib diisi", "Terlalu banyak
 * permintaan. Coba lagi dalam 42 detik." — hilang dan berganti jadi
 * "Please try again later." yang tidak bisa ditindaklanjuti siapa pun.
 */
export const throwApiError = async (res: Response) => {
  let message = ''

  try {
    const body = (await res.json()) as { message?: string }
    message = typeof body?.message === 'string' ? body.message : ''
  } catch {
    // Balasan tanpa JSON (mis. halaman error proxy) tetap harus jadi Error,
    // bukan melempar SyntaxError yang menyesatkan.
  }

  throw new Error(message || res.statusText || 'Permintaan gagal.')
}
