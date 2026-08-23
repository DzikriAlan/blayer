-- Menutup akses langsung lewat PostgREST.
--
-- Supabase mengekspos skema `public` lewat /rest/v1 memakai anon key, dan anon
-- key itu memang publik: ia ikut terkirim ke setiap peramban. Tanpa RLS,
-- siapa pun yang membuka halaman ini bisa membaca, mengubah, dan menghapus
-- seluruh baris — termasuk nama dan email responden — tanpa pernah melewati
-- satu pun pemeriksaan otorisasi di API.
--
-- RLS tanpa policy berarti tolak semuanya, dan itu memang yang diinginkan:
-- tidak ada satu pun jalur sah yang mengakses tabel ini lewat PostgREST.
-- Aplikasinya menyambung sebagai `postgres` yang ber-BYPASSRLS, jadi Prisma
-- tidak terpengaruh sama sekali.

ALTER TABLE "forms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "form_fields" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "form_responses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "form_analyses" ENABLE ROW LEVEL SECURITY;
