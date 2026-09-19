import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// Backend membaca berkas .env sebagai cadangan kalau runtime-nya tidak
// menyalurkan environment (lihat server/config/env.ts). Berkas .env project ini
// berisi kredensial sungguhan, jadi pengujian dijalankan dari folder kosong agar
// yang terbaca hanya variabel yang disetel tiap kasus.
process.chdir(mkdtempSync(join(tmpdir(), 'blayer-test-')))
