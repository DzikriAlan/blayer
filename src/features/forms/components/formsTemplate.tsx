'use client'

import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  Briefcase,
  CalendarDays,
  Eye,
  FilePlus2,
  GraduationCap,
  Hammer,
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
  bannerUrl: string
  meetingUrl: string
  videoUrl: string
  qrisUrl: string
  priceAmount: string
  isPublished: boolean
  fields: FormsTemplateField[]
}

export type FormsTemplateView =
  | 'scoring'
  | 'exam'
  | 'psychometric'
  | 'survey'
  | 'event'
  | 'order'
  | 'course'
  | 'freelance'

export interface FormsViewCopy {
  heading: string
  lead: string
  availabilityLabel: string
  countLabel: string
  fieldLabel: string
  action: string
  emptyTitle: string
  emptySubtitle: string
}

export const FORMS_VIEW_COPY: Record<FormsTemplateView, FormsViewCopy> = {
  exam: {
    heading: 'Ujian Yang Sedang Dibuka',
    lead: 'Ujian yang sedang dibuka. Kerjakan langsung dari halaman ini, dan nilainya dihitung begitu jawabanmu dikirim.',
    availabilityLabel: 'UJIAN DIBUKA',
    countLabel: 'PESERTA',
    fieldLabel: 'SOAL',
    action: 'Kerjakan Ujian',
    emptyTitle: 'Belum Ada Ujian Dibuka',
    emptySubtitle:
      'Belum ada ujian yang bisa dikerjakan sekarang. Lihat kategori lain, atau kembali lagi nanti.',
  },
  psychometric: {
    heading: 'Lowongan Yang Sedang Membuka Psikotes',
    lead: 'Lowongan yang seleksinya sedang berjalan. Kerjakan psikotesnya sekarang juga, dan hasilmu langsung sampai ke perekrutnya.',
    availabilityLabel: 'LOWONGAN DIBUKA',
    countLabel: 'PELAMAR',
    fieldLabel: 'SOAL',
    action: 'Lamar & Kerjakan',
    emptyTitle: 'Belum Ada Lowongan Dibuka',
    emptySubtitle:
      'Belum ada lowongan yang psikotesnya bisa dikerjakan sekarang. Lihat kategori lain, atau kembali lagi nanti.',
  },
  scoring: {
    heading: 'Form Yang Bisa Kamu Isi',
    lead: 'Form yang sedang menerima jawaban. Jawabanmu dinilai dan diperingkat otomatis untuk penyelenggaranya.',
    availabilityLabel: 'FORM TERBUKA',
    countLabel: 'PESERTA',
    fieldLabel: 'PERTANYAAN',
    action: 'Isi Form',
    emptyTitle: 'Belum Ada Form Dibuka',
    emptySubtitle:
      'Belum ada form yang bisa diisi sekarang. Lihat kategori lain, atau kembali lagi nanti.',
  },
  survey: {
    heading: 'Survei Yang Bisa Kamu Isi',
    lead: 'Survei yang sedang mengumpulkan pendapat. Isi sekali, jawabanmu langsung masuk ke ringkasan penyelenggaranya.',
    availabilityLabel: 'SURVEI TERBUKA',
    countLabel: 'RESPONDEN',
    fieldLabel: 'PERTANYAAN',
    action: 'Isi Survei',
    emptyTitle: 'Belum Ada Survei Dibuka',
    emptySubtitle:
      'Belum ada survei yang bisa diisi sekarang. Lihat kategori lain, atau kembali lagi nanti.',
  },
  event: {
    heading: 'Acara Yang Bisa Kamu Ikuti',
    lead: 'Acara yang pendaftarannya sedang dibuka. Daftar sekali, dan bukti ikut beserta aksesnya langsung terbit.',
    availabilityLabel: 'ACARA TERBUKA',
    countLabel: 'TERDAFTAR',
    fieldLabel: 'ISIAN',
    action: 'Daftar Acara',
    emptyTitle: 'Belum Ada Acara Dibuka',
    emptySubtitle:
      'Belum ada acara yang pendaftarannya dibuka sekarang. Lihat kategori lain, atau kembali lagi nanti.',
  },
  order: {
    heading: 'Menu Yang Bisa Kamu Pesan',
    lead: 'Menu yang sedang menerima pesanan. Pilih makananmu, kirim pesanannya, lalu selesaikan pembayarannya di tempat.',
    availabilityLabel: 'MENU TERBUKA',
    countLabel: 'PESANAN',
    fieldLabel: 'PILIHAN',
    action: 'Pesan Sekarang',
    emptyTitle: 'Belum Ada Menu Dibuka',
    emptySubtitle:
      'Belum ada menu yang bisa dipesan sekarang. Lihat kategori lain, atau kembali lagi nanti.',
  },
  freelance: {
    heading: 'Proyek Yang Bisa Kamu Garap',
    lead: 'Proyek yang sedang mencari orang. Ajukan penawaran beserta rencana kerjamu, dan pemilik proyek memilih dari yang masuk.',
    availabilityLabel: 'PROYEK DIBUKA',
    countLabel: 'PENAWARAN',
    fieldLabel: 'ISIAN',
    action: 'Ajukan Penawaran',
    emptyTitle: 'Belum Ada Proyek Dibuka',
    emptySubtitle:
      'Belum ada proyek yang bisa digarap sekarang. Lihat kategori lain, atau kembali lagi nanti.',
  },
  course: {
    heading: 'Kelas Yang Bisa Kamu Ambil',
    lead: 'Kelas yang pendaftarannya sedang dibuka. Selesaikan pembayarannya, dan materinya langsung terbuka untukmu.',
    availabilityLabel: 'KELAS TERBUKA',
    countLabel: 'PESERTA',
    fieldLabel: 'ISIAN',
    action: 'Ikut Kelas',
    emptyTitle: 'Belum Ada Kelas Dibuka',
    emptySubtitle:
      'Belum ada kelas yang bisa diikuti sekarang. Lihat kategori lain, atau kembali lagi nanti.',
  },
}

export const FORMS_TEMPLATE_DEFAULT_VIEW: FormsTemplateView = 'scoring'

export interface FormsTemplateItem {
  id: string
  name: string
  tagline: string
  view: FormsTemplateView
  isVisible: boolean
  isFeatured: boolean
  icon: LucideIcon
  values: FormsTemplateValues
}

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
    id: 'event',
    name: 'Pendaftaran Acara',
    tagline: 'Pajang acaramu di daftar acara yang pendaftarannya sedang dibuka, lalu terima peserta beserta bukti ikutnya yang tersusun sendiri.',
    view: 'event',
    isVisible: true,
    isFeatured: true,
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
    id: 'course',
    name: 'Kursus Kelas',
    tagline: 'Pajang kelasmu di katalog kelas yang bisa langsung diambil pengunjung, dengan materi yang terbuka sendiri setelah mereka mendaftar.',
    view: 'course',
    isVisible: true,
    isFeatured: true,
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
    id: 'psychometric',
    name: 'Psikotes Kerja',
    tagline: 'Pasang lowonganmu di papan lowongan yang dijelajahi pencari kerja, lengkap dengan tesnya dan pelamar yang sudah dinilai dan diurutkan.',
    view: 'psychometric',
    isVisible: true,
    isFeatured: true,
    icon: Brain,
    values: {
      title: 'Frontend Engineer — PT Nusantara Digital',
      description:
        'Jakarta Selatan · Hybrid · Penuh Waktu · S1 Teknik Informatika · 2-4 tahun pengalaman. Kerjakan psikotesnya sekarang, hasilnya langsung dinilai. Jawab sejujurnya berdasarkan pengalaman nyata — tidak ada jawaban benar atau salah.',
      isAiEnabled: true,
      isPublished: true,
      purpose:
        'Menyeleksi pelamar untuk posisi Frontend Engineer. Nilai kemampuan problem solving, ketahanan menghadapi tekanan, kemauan belajar, dan kecocokan dengan budaya kerja kolaboratif. Beri peringkat pelamar dan tentukan siapa yang paling layak dilanjutkan ke tahap interview beserta alasannya.',
      bannerUrl: '',
      meetingUrl: '',
      videoUrl: '',
      qrisUrl: '',
      priceAmount: '',
      fields: [
        getField(
          'Posisi yang Dilamar',
          'SELECT',
          true,
          'Frontend Engineer\nBackend Engineer\nProduct Designer\nData Analyst\nProject Manager'
        ),
        getField('Lama Pengalaman Kerja (tahun)', 'NUMBER', true),
        getField(
          'Tautan CV atau LinkedIn',
          'URL',
          true,
          '',
          'Pastikan tautannya bisa dibuka tanpa izin akses khusus.',
          'https://'
        ),
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
          'Kapan Bisa Mulai Bekerja',
          'DATE',
          true
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
    id: 'freelance',
    name: 'Proyek Freelance',
    tagline: 'Pasang proyekmu di papan proyek yang dijelajahi freelancer, lalu bandingkan penawaran dan rencana kerja yang masuk berdampingan.',
    view: 'freelance',
    isVisible: true,
    isFeatured: true,
    icon: Hammer,
    values: {
      title: 'Redesain Landing Page Company Profile',
      description:
        'Web Development · Kerja Jarak Jauh · Estimasi 3 Minggu · Level Menengah. Kami butuh landing page baru yang lebih cepat dan enak dibaca di ponsel. Aset desain sudah tersedia dalam bentuk Figma.',
      isAiEnabled: true,
      isPublished: true,
      purpose:
        'Memilih freelancer untuk mengerjakan proyek ini. Nilai kesesuaian portofolio dengan kebutuhan, kejelasan rencana pengerjaan, kewajaran tawaran biaya terhadap ruang lingkup, dan kesiapan mulai. Urutkan penawaran dari yang paling meyakinkan, lalu sebutkan siapa yang layak diajak bicara lebih lanjut beserta alasannya.',
      bannerUrl: '',
      meetingUrl: '',
      videoUrl: '',
      qrisUrl: '',
      priceAmount: '4500000',
      fields: [
        getField(
          'Bidang Keahlian Utama',
          'SELECT',
          true,
          'Web Development\nMobile Development\nUI/UX Design\nPenulisan Konten\nData & Otomasi'
        ),
        getField(
          'Tautan Portofolio',
          'URL',
          true,
          '',
          'Cantumkan karya yang paling dekat dengan proyek ini.',
          'https://'
        ),
        getField('Tawaran Biaya Pengerjaan (Rp)', 'NUMBER', true),
        getField(
          'Perkiraan Lama Pengerjaan',
          'SELECT',
          true,
          'Kurang dari 1 minggu\n1-2 minggu\n3-4 minggu\nLebih dari 1 bulan'
        ),
        getField(
          'Bagaimana rencanamu mengerjakan proyek ini?',
          'LONG_TEXT',
          true,
          '',
          'Sebutkan tahapannya, alat yang dipakai, dan apa yang kamu butuhkan dari kami.'
        ),
        getField(
          'Pernah mengerjakan proyek serupa?',
          'RADIO',
          true,
          'Sudah, lebih dari lima kali\nSudah, satu sampai lima kali\nBelum pernah, tapi bidangnya sama\nBelum sama sekali'
        ),
        getField('Kapan Bisa Mulai Mengerjakan', 'DATE', true),
      ],
    },
  },
  {
    id: 'exam',
    name: 'Ujian Sekolah',
    tagline: 'Buka ujianmu di daftar ujian yang bisa dikerjakan peserta, lalu terima nilai, peringkat, dan catatan pengerjaannya tanpa memeriksa sendiri.',
    view: 'exam',
    isVisible: true,
    isFeatured: false,
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
    id: 'restaurant',
    name: 'Menu Restoran',
    tagline: 'Pajang menumu di daftar menu yang bisa dipesan langsung pengunjung, lalu terima pesanan beserta pembayarannya di tempat.',
    view: 'order',
    isVisible: true,
    isFeatured: false,
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
    id: 'recruitment',
    name: 'Lamaran Kerja',
    tagline: 'Screening pelamar lengkap dengan ekspektasi gaji',
    view: 'scoring',
    isVisible: false,
    isFeatured: false,
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
    isFeatured: false,
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
    id: 'blank',
    name: 'Mulai dari Nol',
    tagline: 'Form kosong dengan satu field, susun sendiri',
    view: 'scoring',
    isVisible: false,
    isFeatured: false,
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
  filterId?: string
  onLoadFormsTemplate: (templateId: string) => void
  onLoadFormsFilter?: (templateId: string) => void
  onLoadFormsExplore?: (templateId: string) => void
}

export default function FormsTemplate({
  activeId,
  filterId = '',
  onLoadFormsTemplate,
  onLoadFormsFilter,
  onLoadFormsExplore,
}: Props) {
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
                <p className="mt-2.5 line-clamp-3 font-mono text-xs leading-relaxed opacity-80">
                  {template.tagline}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-3">
                <span className="brutal-eyebrow shrink-0 opacity-70">
                  {String(template.values.fields.length).padStart(2, '0')}{' '}
                  FIELDS
                </span>
                <div className="flex items-center gap-2">
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
                  {onLoadFormsExplore ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      title={`Lihat ${template.name} yang sedang terbuka`}
                      onClick={() => onLoadFormsExplore(template.id)}
                    >
                      Explore <ArrowUpRight />
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
