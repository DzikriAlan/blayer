'use client'

import {
  ArrowRight,
  Brain,
  Briefcase,
  CalendarDays,
  Eye,
  FilePlus2,
  GraduationCap,
  PlayCircle,
  Star,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'

import type { FormsFieldType } from '../types/formsTypes'

import { cn } from '@/shared/lib/utils'
import { IS_AI_VISIBLE } from '@/shared/lib/features'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface FormsTemplateField {
  label: string
  description: string
  placeholder: string
  type: FormsFieldType
  isRequired: boolean
  optionText: string
}

export interface FormsTemplateValues {
  title: string
  description: string
  isAiEnabled: boolean
  purpose: string
  /** Banner acara; hanya terpakai pada template yang punya detail acara. */
  bannerUrl: string
  /** Link Google Meet acara; hanya terpakai pada template yang punya detail acara. */
  meetingUrl: string
  /** Link video kelas; hanya terpakai pada template kursus. */
  videoUrl: string
  /** Gambar QRIS pembuat form; hanya terpakai pada template berbayar. */
  qrisUrl: string
  /** Harga tetap, ditulis sebagai angka polos. Kosong berarti tidak dipakai. */
  priceAmount: string
  isPublished: boolean
  fields: FormsTemplateField[]
}

/**
 * Satu nilai yang menentukan seluruh tampilan sebuah template.
 *
 * Ketiga permukaan — halaman isi, layar setelah kirim, dan dashboard hasil —
 * diturunkan dari nilai ini, jadi menambah template baru cukup memilih salah
 * satunya tanpa menyentuh komponen mana pun:
 *
 * | view      | halaman isi     | setelah kirim  | hasil          | identitas    |
 * | --------- | --------------- | -------------- | -------------- | ------------ |
 * | `scoring` | biasa           | konfirmasi     | skor+peringkat | nama + email |
 * | `exam`    | terkunci        | konfirmasi     | skor+peringkat | nama + email |
 * | `survey`  | biasa           | konfirmasi     | ringkasan      | nama + email |
 * | `event`   | banner acara    | tiket acara    | daftar peserta | nama + email |
 * | `order`   | menu + bayar    | struk pesanan  | daftar pesanan | nama saja    |
 * | `course`  | harga + bayar   | akses video    | daftar peserta | nama + email |
 *
 * Kolom email hanya ditanyakan kalau memang ada yang dikirim ke sana — tiket
 * acara, akses kelas. Pesanan di meja selesai di tempat, jadi tidak usah.
 */
export type FormsTemplateView =
  | 'scoring'
  | 'exam'
  | 'survey'
  | 'event'
  | 'order'
  | 'course'

/** Dipakai kalau form tidak punya template, misal form lama atau buatan tangan. */
export const FORMS_TEMPLATE_DEFAULT_VIEW: FormsTemplateView = 'scoring'

export interface FormsTemplateItem {
  id: string
  name: string
  tagline: string
  /** Satu nilai yang menentukan tampilan di ketiga permukaan. */
  view: FormsTemplateView
  /**
   * Hanya mengatur tampil/tidaknya di daftar pilihan. Entri yang `false` tetap
   * ada di katalog supaya form lama yang memakainya tetap bisa diresolusi
   * tampilannya, dan tinggal diubah `true` untuk dimunculkan kembali.
   */
  isVisible: boolean
  icon: LucideIcon
  values: FormsTemplateValues
}

/**
 * Nama dan email tidak pernah jadi field template.
 *
 * Halaman isi sudah merender dua kolom identitas bawaan — keduanya yang
 * mengisi kolom respondentName dan respondentEmail — jadi template yang
 * menambahkannya lagi hanya menghasilkan pertanyaan kembar.
 */
const getField = (
  label: string,
  type: FormsFieldType,
  isRequired = false,
  optionText = '',
  description = '',
  placeholder = ''
): FormsTemplateField => ({
  label,
  description,
  placeholder,
  type,
  isRequired,
  optionText,
})

export const FORMS_TEMPLATES: FormsTemplateItem[] = [
  {
    id: 'exam',
    name: 'Ujian Sekolah',
    tagline: 'Pilihan ganda + esai, dinilai dan diperingkat otomatis',
    view: 'exam',
    isVisible: true,
    icon: GraduationCap,
    values: {
      title: 'Ujian Tengah Semester — Sejarah Kelas XI',
      description:
        'Kerjakan seluruh soal dalam waktu 60 menit. Jawaban esai dinilai dari ketepatan argumen dan bukti yang kamu sebutkan.',
      isAiEnabled: true,
      isPublished: true,
      purpose:
        'Menilai pemahaman siswa terhadap materi ujian. Beri skor untuk setiap siswa berdasarkan ketepatan jawaban pilihan ganda dan kedalaman argumen pada jawaban esai. Urutkan siswa dari nilai tertinggi, lalu sebutkan siapa yang perlu remedial beserta topik yang belum dikuasai.',
      bannerUrl: '',
      meetingUrl: '',
      videoUrl: '',
      qrisUrl: '',
      priceAmount: '',
      fields: [
        getField(
          'Kelas',
          'SELECT',
          true,
          'XI IPA 1\nXI IPA 2\nXI IPA 3\nXI IPS 1\nXI IPS 2'
        ),
        getField('Nomor Absen', 'NUMBER', true),
        getField(
          'Siapa tokoh yang membacakan teks Proklamasi Kemerdekaan Indonesia?',
          'RADIO',
          true,
          'Soekarno dan Mohammad Hatta\nJenderal Sudirman dan Tan Malaka\nSutan Syahrir dan Amir Syarifuddin\nPangeran Diponegoro dan Imam Bonjol'
        ),
        getField(
          'Sebutkan dan jelaskan tiga faktor yang melatarbelakangi lahirnya pergerakan nasional.',
          'LONG_TEXT',
          true,
          '',
          'Sertakan contoh peristiwa untuk setiap faktor.'
        ),
        getField(
          'Jelaskan dampak Politik Etis terhadap munculnya kaum terpelajar pribumi.',
          'LONG_TEXT',
          true
        ),
        getField(
          'Seberapa yakin kamu dengan jawabanmu secara keseluruhan?',
          'SCALE'
        ),
      ],
    },
  },
  {
    id: 'psychometric',
    name: 'Psikotes Kandidat',
    tagline: 'Soal situasional dan skala sikap untuk seleksi kerja',
    view: 'scoring',
    isVisible: false,
    icon: Brain,
    values: {
      title: 'Psikotes Kandidat — Frontend Engineer',
      description:
        'Jawab sejujurnya berdasarkan pengalaman nyata. Tidak ada jawaban benar atau salah.',
      isAiEnabled: true,
      isPublished: true,
      purpose:
        'Menyeleksi kandidat untuk posisi Frontend Engineer. Nilai kemampuan problem solving, ketahanan menghadapi tekanan, kemauan belajar, dan kecocokan dengan budaya kerja kolaboratif. Beri peringkat kandidat dan tentukan siapa yang paling layak dilanjutkan ke tahap interview beserta alasannya.',
      bannerUrl: '',
      meetingUrl: '',
      videoUrl: '',
      qrisUrl: '',
      priceAmount: '',
      fields: [
        getField('Nama Lengkap', 'SHORT_TEXT', true),
        getField('Email Aktif', 'EMAIL', true),
        getField('Lama Pengalaman Kerja (tahun)', 'NUMBER', true),
        getField(
          'Ceritakan satu proyek tersulit yang pernah kamu tangani dan bagaimana kamu menyelesaikannya.',
          'LONG_TEXT',
          true,
          '',
          'Jelaskan masalahnya, langkahmu, dan hasil akhirnya.'
        ),
        getField(
          'Deadline tinggal dua hari, lalu ditemukan bug besar di fitur utama. Apa yang kamu lakukan pertama kali?',
          'LONG_TEXT',
          true
        ),
        getField(
          'Saya nyaman menerima kritik atas hasil kerja saya.',
          'SCALE',
          true,
          '',
          '1 = sangat tidak setuju, 10 = sangat setuju'
        ),
        getField(
          'Saya paling produktif ketika bekerja...',
          'RADIO',
          true,
          'Sendiri dengan fokus penuh\nBerpasangan (pair programming)\nDalam tim besar\nFleksibel, tergantung situasi'
        ),
        getField(
          'Bidang apa yang ingin kamu dalami setahun ke depan?',
          'CHECKBOX',
          false,
          'Performance\nAccessibility\nDesign System\nTesting\nDevOps'
        ),
      ],
    },
  },
  {
    id: 'recruitment',
    name: 'Lamaran Kerja',
    tagline: 'Screening pelamar lengkap dengan ekspektasi gaji',
    view: 'scoring',
    isVisible: false,
    icon: Briefcase,
    values: {
      title: 'Formulir Lamaran Kerja',
      description:
        'Lengkapi data berikut. Kami akan menghubungi pelamar yang lolos tahap screening.',
      isAiEnabled: true,
      isPublished: true,
      purpose:
        'Menyaring pelamar kerja. Nilai kesesuaian pengalaman dengan posisi yang dilamar, kewajaran ekspektasi gaji, dan kesiapan bergabung. Urutkan pelamar dari yang paling sesuai, lalu tandai siapa saja yang layak dipanggil interview beserta alasannya.',
      bannerUrl: '',
      meetingUrl: '',
      videoUrl: '',
      qrisUrl: '',
      priceAmount: '',
      fields: [
        getField('Nama Lengkap', 'SHORT_TEXT', true),
        getField('Email', 'EMAIL', true),
        getField('Nomor WhatsApp', 'PHONE', true),
        getField(
          'Posisi yang Dilamar',
          'SELECT',
          true,
          'Frontend Engineer\nBackend Engineer\nProduct Designer\nData Analyst\nProject Manager'
        ),
        getField(
          'Tautan CV atau Portofolio',
          'URL',
          true,
          '',
          '',
          'https://'
        ),
        getField(
          'Ceritakan pengalaman kerja yang paling relevan dengan posisi ini.',
          'LONG_TEXT',
          true
        ),
        getField('Ekspektasi Gaji per Bulan (Rp)', 'NUMBER', true),
        getField('Kapan Bisa Mulai Bekerja', 'DATE', true),
      ],
    },
  },
  {
    id: 'csat',
    name: 'Survei Kepuasan',
    tagline: 'Rating, skala rekomendasi, dan masukan pelanggan',
    view: 'survey',
    isVisible: false,
    icon: Star,
    values: {
      title: 'Survei Kepuasan Pelanggan',
      description:
        'Masukanmu membantu kami memperbaiki layanan. Pengisian hanya butuh dua menit.',
      isAiEnabled: true,
      isPublished: true,
      purpose:
        'Mengukur kepuasan pelanggan dan menemukan masalah yang paling mendesak. Rangkum keluhan yang paling sering muncul, urutkan responden dari yang paling puas hingga paling kecewa, lalu rekomendasikan tiga perbaikan prioritas beserta alasannya.',
      bannerUrl: '',
      meetingUrl: '',
      videoUrl: '',
      qrisUrl: '',
      priceAmount: '',
      fields: [
        getField('Nama', 'SHORT_TEXT'),
        getField('Email', 'EMAIL'),
        getField('Bagaimana penilaianmu secara keseluruhan?', 'RATING', true),
        getField(
          'Seberapa besar kemungkinan kamu merekomendasikan kami ke teman?',
          'SCALE',
          true,
          '',
          '1 = tidak mungkin, 10 = sangat mungkin'
        ),
        getField(
          'Layanan apa saja yang pernah kamu gunakan?',
          'CHECKBOX',
          true,
          'Pembelian produk\nLayanan pelanggan\nPengiriman\nGaransi dan retur\nAplikasi mobile'
        ),
        getField('Apa yang paling kamu sukai dari layanan kami?', 'LONG_TEXT'),
        getField(
          'Apa yang menurutmu paling perlu diperbaiki?',
          'LONG_TEXT',
          true
        ),
      ],
    },
  },
  {
    id: 'event',
    name: 'Pendaftaran Acara',
    tagline: 'Banner, link Google Meet, dan daftar peserta',
    view: 'event',
    isVisible: true,
    icon: CalendarDays,
    values: {
      title: 'Pendaftaran Workshop',
      description:
        'Kuota terbatas. Konfirmasi kehadiran akan dikirim lewat email.',
      isAiEnabled: false,
      isPublished: true,
      purpose: '',
      bannerUrl: '',
      meetingUrl: '',
      videoUrl: '',
      qrisUrl: '',
      priceAmount: '',
      fields: [
        getField('Asal Instansi atau Perusahaan', 'SHORT_TEXT'),
        getField(
          'Pilih Sesi',
          'SELECT',
          true,
          'Sesi Pagi (09.00 - 12.00)\nSesi Siang (13.00 - 16.00)\nSesi Malam (19.00 - 21.00)'
        ),
      ],
    },
  },
  {
    id: 'restaurant',
    name: 'Menu Restoran',
    tagline: 'Pilih makanan bergambar per meja, bayar QRIS di tempat',
    view: 'order',
    isVisible: true,
    icon: UtensilsCrossed,
    values: {
      title: 'Pesan Menu — Meja Restoran',
      description:
        'Pilih makanan dan minumanmu, lalu bayar lewat QRIS atau metode lain. Pesanan langsung masuk ke dapur setelah pembayaran dikonfirmasi.',
      isAiEnabled: false,
      isPublished: true,
      purpose: '',
      bannerUrl: '',
      meetingUrl: '',
      videoUrl: '',
      qrisUrl: '',
      priceAmount: '',
      fields: [
        getField(
          'Nomor Meja',
          'SELECT',
          true,
          'Meja 01\nMeja 02\nMeja 03\nMeja 04\nMeja 05\nMeja 06\nMeja 07\nMeja 08'
        ),
        getField(
          'Pilih Menu',
          'MENU',
          true,
          [
            'Nasi Goreng Kampung|28000|/menu-nasi-goreng.svg',
            'Ayam Bakar Madu|35000|/menu-ayam-bakar.svg',
            'Sate Ayam Bumbu Kacang|32000|/menu-sate-ayam.svg',
            'Mie Goreng Seafood|30000|/menu-mie-goreng.svg',
            'Es Teh Manis|8000|/menu-es-teh.svg',
            'Es Jeruk Peras|12000|/menu-es-jeruk.svg',
          ].join('\n'),
          'Ketuk gambar untuk menambah porsi. Total tagihan dihitung otomatis.'
        ),
        getField(
          'Cara Penyajian',
          'RADIO',
          true,
          'Makan di tempat\nBungkus dibawa pulang'
        ),
        getField('Catatan untuk Dapur', 'LONG_TEXT', false, '', '', 'Mis. tidak pedas, tanpa bawang'),
        getField(
          'Metode Pembayaran',
          'PAYMENT',
          true,
          [
            'QRIS|Pindai kode di layar pakai aplikasi bank atau e-wallet apa pun',
            'Transfer Bank|Transfer ke rekening kasir, tunjukkan bukti ke pelayan',
            'Kartu Debit/Kredit|Bayar di kasir memakai mesin EDC',
            'Tunai|Bayar langsung di kasir setelah makan',
          ].join('\n'),
          'Tagihan dihitung dari menu yang kamu pilih di atas.'
        ),
      ],
    },
  },
  {
    id: 'course',
    name: 'Kursus Kelas',
    tagline: 'Bayar biaya kelas, video materi terbuka setelah mendaftar',
    view: 'course',
    isVisible: true,
    icon: PlayCircle,
    values: {
      title: 'Kelas Online — Dasar Membangun Web',
      description:
        'Lengkapi data diri, lalu selesaikan pembayaran. Video materi langsung terbuka begitu formulir terkirim.',
      isAiEnabled: false,
      isPublished: true,
      purpose: '',
      bannerUrl: '',
      meetingUrl: '',
      videoUrl: '',
      qrisUrl: '',
      // Kelasnya satu, jadi harganya ditetapkan pembuat form — bukan dipilih
      // ulang oleh peserta yang sudah membuka tautan kelas ini.
      priceAmount: '350000',
      fields: [
        getField('Nomor WhatsApp', 'PHONE', true, '', '', '08xx'),
        getField(
          'Level Pengalamanmu',
          'RADIO',
          true,
          'Belum pernah sama sekali\nSudah pernah belajar mandiri\nSudah bekerja di bidang ini'
        ),
        getField(
          'Apa yang ingin kamu capai setelah kelas ini?',
          'LONG_TEXT',
          false
        ),
        getField(
          'Metode Pembayaran',
          'PAYMENT',
          true,
          [
            'QRIS|Pindai kode di layar pakai aplikasi bank atau e-wallet apa pun',
            'Transfer Bank|Transfer ke rekening yang tertera, simpan buktinya',
            'Virtual Account|Bayar lewat VA di aplikasi bankmu',
          ].join('\n'),
          'Biaya kelas ditetapkan pengajar dan tampil di bawah ini.'
        ),
      ],
    },
  },
  {
    id: 'blank',
    name: 'Mulai dari Nol',
    tagline: 'Form kosong dengan satu field, susun sendiri',
    view: 'scoring',
    isVisible: false,
    icon: FilePlus2,
    values: {
      title: '',
      description: '',
      isAiEnabled: true,
      isPublished: true,
      purpose: '',
      bannerUrl: '',
      meetingUrl: '',
      videoUrl: '',
      qrisUrl: '',
      priceAmount: '',
      fields: [
        getField('', 'SHORT_TEXT'),
      ],
    },
  },
]

interface Props {
  activeId: string
  /** Template yang riwayat formnya sedang difilter; kosong berarti semua. */
  filterId?: string
  onLoadFormsTemplate: (templateId: string) => void
  /** Diisi hanya di halaman yang punya riwayat form untuk difilter. */
  onLoadFormsFilter?: (templateId: string) => void
}

export default function FormsTemplate({
  activeId,
  filterId = '',
  onLoadFormsTemplate,
  onLoadFormsFilter,
}: Props) {
  // Katalog tetap utuh; yang disaring hanya daftar yang ditampilkan.
  const visibleTemplates = FORMS_TEMPLATES.filter(
    (template) => template.isVisible
  )

  if (!visibleTemplates.length) return null

  return (
    <div className="border-b-2 border-foreground bg-muted">
      <div className="flex items-stretch gap-3 px-5 pt-5 sm:px-7">
        <span className="brutal-eyebrow bg-foreground px-3 py-2 text-background">
          TEMPLATES
        </span>
        <span aria-hidden className="brutal-hatch flex-1 opacity-20" />
        {visibleTemplates.length > 2 ? (
          <span className="brutal-eyebrow flex items-center gap-1.5 text-muted-foreground">
            GESER <ArrowRight className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </div>

      <p className="px-5 pb-5 pt-4 font-mono text-xs leading-relaxed text-muted-foreground sm:px-7">
        Pilih salah satu untuk mengisi judul dan seluruh pertanyaannya
        sekaligus. Semuanya masih bisa kamu ubah setelah dipakai.
      </p>

      <div className="brutal-scroll-x flex snap-x snap-mandatory overflow-x-auto border-t-2 border-foreground">
        {visibleTemplates.map((template) => {
          const Icon = template.icon
          const isActive = activeId === template.id
          const isFiltered = filterId === template.id
          const isAiEnabled = template.values.isAiEnabled

          return (
            <div
              key={template.id}
              className={cn(
                'flex w-[250px] shrink-0 snap-start flex-col justify-between gap-5 border-r-2 border-foreground p-5 transition-colors last:border-r-0',
                isActive ? 'bg-primary text-primary-foreground' : 'bg-paper'
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <Icon className="h-6 w-6 shrink-0" />
                  {IS_AI_VISIBLE ? (
                    <Badge
                      variant={
                        isActive
                          ? 'secondary'
                          : isAiEnabled
                            ? 'default'
                            : 'muted'
                      }
                    >
                      {isAiEnabled ? 'AI ON' : 'AI OFF'}
                    </Badge>
                  ) : null}
                </div>

                <h3 className="mt-4 break-words font-display text-xl font-black uppercase leading-none tracking-tight">
                  {template.name}
                </h3>
                <p className="mt-2.5 font-mono text-xs leading-relaxed opacity-80">
                  {template.tagline}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-3">
                <span className="brutal-eyebrow shrink-0 opacity-70">
                  {String(template.values.fields.length).padStart(2, '0')}{' '}
                  FIELDS
                </span>
                <div className="flex items-center gap-2">
                  {/* "See" hanya muncul di halaman yang memang punya riwayat
                      form, jadi builder tidak kebagian tombol tanpa tujuan. */}
                  {onLoadFormsFilter ? (
                    <Button
                      type="button"
                      size="sm"
                      variant={isFiltered ? 'primary' : 'ghost'}
                      title={`Lihat riwayat form ${template.name}`}
                      onClick={() => onLoadFormsFilter(template.id)}
                    >
                      <Eye /> {isFiltered ? 'Shown' : 'See'}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant={isActive ? 'paper' : 'outline'}
                    onClick={() => onLoadFormsTemplate(template.id)}
                  >
                    {isActive ? 'Applied' : 'Use'}
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
