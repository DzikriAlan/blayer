export type HomeCategoryName =
  | 'Politik'
  | 'Ekonomi'
  | 'Investasi'
  | 'Psikologi'
  | 'Pengembangan Diri'

export interface HomeVideo {
  id: string
  title: string
  channel: string
  views: string
  ago: string
  duration: string
  category: HomeCategoryName
  photoId: string
  description: string
}

export const HOME_ALL_CATEGORY = 'Semua'

export const HOME_CATEGORIES: HomeCategoryName[] = [
  'Politik',
  'Ekonomi',
  'Investasi',
  'Psikologi',
  'Pengembangan Diri',
]

export const HOME_HERO_PHOTO_ID = '1672279410716-c676739163e9'

export const HOME_DESCRIPTION =
  'Tonton selengkapnya di Blayer. Deskripsi lengkap dari kreator akan tampil di sini.'

export const getHomePhoto = (photoId: string, width: number) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=70`

const item = (
  id: string,
  title: string,
  channel: string,
  views: string,
  ago: string,
  duration: string,
  category: HomeCategoryName,
  photoId: string
): HomeVideo => ({
  id,
  title,
  channel,
  views,
  ago,
  duration,
  category,
  photoId,
  description: HOME_DESCRIPTION,
})

export const HOME_VIDEOS: HomeVideo[] = [
  item('arah-politik-pemilu', 'Arah Politik Indonesia Menjelang Pemilu Berikutnya', 'Blayer News', '1,2 jt', '3 hari lalu', '18:42', 'Politik', '1590118432058-f2744d6897db'),
  item('ekonomi-kuartal-ini', 'Ekonomi Indonesia Kuartal Ini: Apa yang Berubah?', 'Meja Redaksi', '842 rb', '5 jam lalu', '10:05', 'Ekonomi', '1543242594-c8bae8b9e708'),
  item('investasi-pemula', 'Investasi untuk Pemula: Mulai dari Mana?', 'Ruang Cuan', '436 rb', '5 hari lalu', '24:12', 'Investasi', '1760780567530-389d8a3fba75'),
  item('psikologi-prokrastinasi', 'Mengapa Kita Menunda? Psikologi di Balik Prokrastinasi', 'Dengar Dulu', '210 rb', '2 hari lalu', '28:20', 'Psikologi', '1772690445981-78b22eacda4b'),
  item('kebiasaan-kecil', 'Membangun Kebiasaan Kecil yang Mengubah Hidup', 'Tumbuh Bareng', '689 rb', '4 hari lalu', '31:50', 'Pengembangan Diri', '1661868668264-35233e0e0dac'),
  item('debat-kebijakan', 'Debat Terbuka: Arah Kebijakan Pemerintah Baru', 'Forum Blayer', '1,9 jt', '1 hari lalu', '54:27', 'Politik', '1611974789855-9c2a0a7236a3'),
  item('harga-pangan', 'Harga Pangan Naik: Siapa yang Paling Terdampak?', 'Blayer News', '158 rb', '6 hari lalu', '14:12', 'Ekonomi', '1511671782779-c97d3d27a1d4'),
  item('reksa-dana-saham-emas', 'Reksa Dana, Saham, atau Emas? Cara Memilih', 'Ruang Cuan', '524 rb', '1 minggu lalu', '41:36', 'Investasi', '1587825140708-dfaf72ae4b04'),
  item('kelola-cemas', 'Mengelola Cemas di Tengah Tekanan Kerja', 'Dengar Dulu', '377 rb', '1 minggu lalu', '26:19', 'Psikologi', '1630015179789-7a4c880ae186'),
  item('fokus-tanpa-gangguan', 'Fokus Dalam Dunia yang Penuh Gangguan', 'Tumbuh Bareng', '305 rb', '2 hari lalu', '22:08', 'Pengembangan Diri', '1742805382153-bb4be26d6031'),
  item('isu-pemilu-daerah', 'Mengurai Isu Pemilu Daerah dengan Tenang', 'Forum Blayer', '96 rb', '9 hari lalu', '35:40', 'Politik', '1589903308904-1010c2294adc'),
  item('dana-darurat', 'Dana Darurat: Berapa yang Cukup?', 'Meja Redaksi', '731 rb', '12 hari lalu', '19:15', 'Ekonomi', '1758691737543-09a1b2b715fa'),
]

export const HOME_FEATURED_ID = HOME_VIDEOS[0].id
