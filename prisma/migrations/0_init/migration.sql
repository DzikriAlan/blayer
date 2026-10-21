-- Skema awal Blayer versi video. Seluruh tabel platform agent lama sudah dihapus.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "is_short" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "channel_url" TEXT NOT NULL,
    "verified_channel" BOOLEAN NOT NULL DEFAULT false,
    "duration" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "is_live" BOOLEAN NOT NULL DEFAULT false,
    "thumbnail" TEXT NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL,
    "scraped_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("category","id")
);

-- CreateIndex
CREATE INDEX "videos_scraped_at_idx" ON "videos"("scraped_at");

-- CreateIndex
CREATE INDEX "videos_published_at_idx" ON "videos"("published_at");


-- Menutup akses langsung lewat PostgREST (anon key Supabase bersifat publik).
-- RLS tanpa policy menolak semuanya; aplikasi dan scraper menyambung sebagai
-- `postgres` yang ber-BYPASSRLS, jadi Prisma tidak terpengaruh.
ALTER TABLE "videos" ENABLE ROW LEVEL SECURITY;
