-- Tabel `tasks` bukan bagian dari skema Prisma dan tidak dipakai aplikasi ini —
-- tampaknya sisa dari pekerjaan lain. Isinya kosong, tetapi karena berada di
-- skema `public` ia tetap terbaca dan bisa ditulisi lewat anon key.
--
-- RLS-nya dinyalakan, bukan tabelnya dihapus: menghapus tabel milik orang lain
-- bukan keputusan yang boleh diambil sepihak, sedangkan menutup aksesnya bisa
-- dibatalkan kapan saja.
--
-- Pemeriksaan keberadaannya wajib: basis data baru tidak punya tabel ini sama
-- sekali, dan migrasi tidak boleh gagal hanya karena sisa orang lain kebetulan
-- tidak ada di sana.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'tasks'
  ) THEN
    EXECUTE 'ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY';
  END IF;
END
$$;
