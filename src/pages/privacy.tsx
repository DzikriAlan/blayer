import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { ShieldCheck, Lock, Cpu, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'

const Privacy: NextPage = () => {
  return (
    <>
      <Head>
        <title>Kebijakan Privasi & Perlindungan Data — BLAYER</title>
        <meta
          name="description"
          content="Kebijakan privasi, retensi data, dan pengungkapan pemrosesan AI sesuai Undang-Undang Perlindungan Data Pribadi (UU PDP)."
        />
      </Head>

      <div className="min-h-screen bg-background px-5 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-3xl border-2 border-foreground bg-paper p-6 shadow-[8px_8px_0_0_hsl(var(--foreground))] sm:p-10">
          <div className="flex items-center justify-between border-b-2 border-foreground pb-6">
            <div>
              <p className="brutal-eyebrow text-muted-foreground">KEPATUHAN REGULASI</p>
              <h1 className="mt-2 font-display text-3xl font-black uppercase leading-none tracking-tight sm:text-4xl">
                Privasi &amp; Retensi Data<span className="text-primary">.</span>
              </h1>
            </div>
            <ShieldCheck className="size-10 text-primary" />
          </div>

          <div className="mt-8 flex flex-col gap-8 font-mono text-sm leading-relaxed text-foreground">
            <section>
              <h2 className="flex items-center gap-2 font-display text-xl font-bold uppercase text-foreground">
                <Lock className="size-5 text-primary" /> 1. Pengumpulan &amp; Penggunaan Data
              </h2>
              <p className="mt-2 text-muted-foreground">
                Blayer mengumpulkan data identitas (nama, alamat email) serta isian jawaban form semata-mata untuk keperluan penyampaian hasil form kepada pembuat form. Pengguna memiliki kendali penuh atas form dan data yang mereka miliki.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 font-display text-xl font-bold uppercase text-foreground">
                <Cpu className="size-5 text-primary" /> 2. Pengungkapan Pemrosesan AI (Anthropic Claude)
              </h2>
              <p className="mt-2 text-muted-foreground">
                Sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27 Tahun 2022), kami memberitahukan secara transparan bahwa jawaban pada form yang mengaktifkan analisis AI akan diproses menggunakan <strong>Anthropic Claude SDK</strong>. Data hanya digunakan untuk menghasilkan evaluasi, skor, dan rekomendasi real-time, serta tidak dipergunakan untuk melatih model AI publik.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 font-display text-xl font-bold uppercase text-foreground">
                <EyeOff className="size-5 text-primary" /> 3. Retensi &amp; Penghapusan Data
              </h2>
              <p className="mt-2 text-muted-foreground">
                Data jawaban dan hasil analisis disimpan secara aman di PostgreSQL Supabase. Saat pembuat form menghapus form dari dashboard, seluruh data jawaban dan analisis terkait akan secara otomatis terhapus secara permanen dari basis data (*cascade deletion*).
              </p>
            </section>
          </div>

          <div className="mt-10 border-t-2 border-foreground pt-6 flex justify-between items-center">
            <p className="font-mono text-xs text-muted-foreground">
              Terakhir diperbarui: 20 Agustus 2026 · Selaras dengan UU PDP Indonesia
            </p>
            <Link href="/">
              <Button variant="outline" size="sm">Kembali ke Beranda</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default Privacy
