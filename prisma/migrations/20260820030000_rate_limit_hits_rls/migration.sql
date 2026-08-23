-- Tabel hitungan rate limit ikut terekspos PostgREST seperti tabel lain di
-- skema public. Tanpa RLS, siapa pun yang memegang anon key bisa menghapus
-- barisnya dan mengosongkan kuotanya sendiri — pembatas lajunya jadi hiasan.

ALTER TABLE "rate_limit_hits" ENABLE ROW LEVEL SECURITY;
