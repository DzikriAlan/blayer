import { routeRequest } from '@server/routes'

// Next.js hanya mengenali endpoint dari berkas di pages/api, jadi satu berkas
// ini yang menyerahkan setiap permintaan ke tabel rute di server/routes.
// Tidak ada logika API di sini — seluruhnya hidup di server/features.
export default routeRequest
