import { Building2, Cpu, Music, Trophy, type LucideIcon } from 'lucide-react'

import type { LandingEvent } from './landingPoster'

export interface LandingCategory {
  id: string
  name: string
  icon: LucideIcon
  actionLabel: string
  countLabel: string
  fieldLabel: string
  emptyTitle: string
  emptySubtitle: string
  events: LandingEvent[]
}

const getEvent = (
  id: string,
  title: string,
  description: string,
  totalResponses: number,
  totalFields: number
): LandingEvent => ({
  id,
  title,
  description,
  image: '',
  totalResponses,
  totalFields,
  tooltip: title,
})

// Isi katalog ini contoh, bukan data sungguhan. Halaman depan dipertahankan
// sebagai rangka desain selagi permukaan platform agent dibangun, jadi angka
// dan judulnya ditulis di sini — tidak ada API yang membacanya.
export const LANDING_CATEGORIES: LandingCategory[] = [
  {
    id: 'event-tech',
    name: 'Teknologi',
    icon: Cpu,
    actionLabel: 'Daftar Acara',
    countLabel: 'TERDAFTAR',
    fieldLabel: 'ISIAN',
    emptyTitle: 'Belum Ada Acara Teknologi',
    emptySubtitle:
      'Belum ada acara teknologi yang pendaftarannya dibuka sekarang. Lihat kategori lain, atau kembali lagi nanti.',
    events: [
      getEvent(
        'tech-meetup',
        'Meetup Engineer Bandung',
        'Kumpul bulanan engineer lintas perusahaan: dua sesi berbagi pengalaman, satu sesi tanya jawab, lalu ngobrol bebas sampai malam.',
        48,
        6
      ),
      getEvent(
        'tech-workshop',
        'Workshop Bikin API Yang Tahan Banting',
        'Satu hari penuh menulis API dari nol sampai punya log, batas permintaan, dan uji otomatis yang jalan di setiap perubahan.',
        32,
        8
      ),
      getEvent(
        'tech-webinar',
        'Webinar Rancang Basis Data',
        'Sesi daring dua jam membedah keputusan skema yang biasanya baru terasa salah setelah datanya terlanjur banyak.',
        21,
        5
      ),
    ],
  },
  {
    id: 'event-sport',
    name: 'Olahraga',
    icon: Trophy,
    actionLabel: 'Daftar Acara',
    countLabel: 'TERDAFTAR',
    fieldLabel: 'ISIAN',
    emptyTitle: 'Belum Ada Acara Olahraga',
    emptySubtitle:
      'Belum ada acara olahraga yang pendaftarannya dibuka sekarang. Lihat kategori lain, atau kembali lagi nanti.',
    events: [
      getEvent(
        'sport-run',
        'Fun Run 5K Akhir Pekan',
        'Lari santai lima kilometer menyusuri jalur kota, dilepas pagi buta dan ditutup sarapan bersama di garis akhir.',
        64,
        7
      ),
      getEvent(
        'sport-futsal',
        'Turnamen Futsal Antar Komunitas',
        'Sistem gugur satu hari, delapan tim, wasit resmi. Tiap tim mendaftarkan sepuluh nama beserta nomor punggungnya.',
        37,
        9
      ),
      getEvent(
        'sport-yoga',
        'Kelas Yoga Pagi Di Taman',
        'Sesi lepas penat satu jam untuk semua tingkat. Bawa matras sendiri; sisanya sudah disiapkan panitia.',
        18,
        4
      ),
    ],
  },
  {
    id: 'event-music',
    name: 'Musik & Seni',
    icon: Music,
    actionLabel: 'Daftar Acara',
    countLabel: 'TERDAFTAR',
    fieldLabel: 'ISIAN',
    emptyTitle: 'Belum Ada Acara Musik & Seni',
    emptySubtitle:
      'Belum ada acara musik atau seni yang pendaftarannya dibuka sekarang. Lihat kategori lain, atau kembali lagi nanti.',
    events: [
      getEvent(
        'music-gigs',
        'Panggung Musik Kampung Kota',
        'Enam penampil lokal bergantian sepanjang malam di panggung terbuka, dengan sesi latihan bersama sebelum acaranya.',
        52,
        6
      ),
      getEvent(
        'music-expo',
        'Pameran Ilustrasi Arsip Kota',
        'Pameran dua pekan berisi ilustrasi arsip. Pendaftaran dibuka untuk pengunjung sesi pembukaan dan tur berpemandu.',
        29,
        5
      ),
      getEvent(
        'music-class',
        'Kelas Gitar Untuk Pemula',
        'Empat pertemuan dari cara memegang gitar sampai memainkan satu lagu utuh. Gitar bisa dipinjam di tempat.',
        14,
        4
      ),
    ],
  },
  {
    id: 'event-business',
    name: 'Bisnis & Karier',
    icon: Building2,
    actionLabel: 'Daftar Acara',
    countLabel: 'TERDAFTAR',
    fieldLabel: 'ISIAN',
    emptyTitle: 'Belum Ada Acara Bisnis & Karier',
    emptySubtitle:
      'Belum ada acara bisnis atau karier yang pendaftarannya dibuka sekarang. Lihat kategori lain, atau kembali lagi nanti.',
    events: [
      getEvent(
        'business-fair',
        'Job Fair Perusahaan Rintisan',
        'Dua belas perusahaan membuka lowongan di satu tempat. Pelamar mendaftar lebih dulu agar jadwal wawancaranya tersusun.',
        73,
        10
      ),
      getEvent(
        'business-seminar',
        'Seminar Hitung Harga Produk',
        'Membedah cara menetapkan harga yang menutup biaya tanpa menakuti pembeli, lengkap dengan latihan hitung bersama.',
        41,
        6
      ),
      getEvent(
        'business-mentoring',
        'Sesi Mentoring Karier Satu Lawan Satu',
        'Tiga puluh menit bersama satu mentor untuk membedah arah karier dan menyusun langkah tiga bulan ke depan.',
        26,
        7
      ),
    ],
  },
]
