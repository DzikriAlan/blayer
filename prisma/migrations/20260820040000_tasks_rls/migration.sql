-- Tabel `tasks` bukan bagian dari skema Prisma dan tidak dipakai aplikasi ini —
-- tampaknya sisa dari pekerjaan lain. Isinya kosong, tetapi karena berada di
-- skema `public` ia tetap terbaca dan bisa ditulisi lewat anon key.
--
-- RLS-nya dinyalakan, bukan tabelnya dihapus: menghapus tabel milik orang lain
-- bukan keputusan yang boleh diambil sepihak, sedangkan menutup aksesnya bisa
-- dibatalkan kapan saja.

ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
