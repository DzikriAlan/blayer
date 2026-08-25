-- AlterTable
ALTER TABLE "forms" ADD COLUMN "slug" TEXT;

-- Backfill: judul yang di-slug, ditambah enam karakter terakhir id.
-- Sufiks id dipakai supaya keunikan dijamin tanpa perlu menyelesaikan
-- tabrakan satu per satu; pemilik form bisa merapikannya lewat aplikasi.
UPDATE "forms"
SET "slug" = NULLIF(
  TRIM(BOTH '-' FROM
    REGEXP_REPLACE(LOWER("title"), '[^a-z0-9]+', '-', 'g')
  ),
  ''
) || '-' || RIGHT("id", 6)
WHERE "slug" IS NULL;

-- Judul yang tidak menyisakan satu pun karakter aman jatuh ke pola form-<id>.
UPDATE "forms"
SET "slug" = 'form-' || RIGHT("id", 6)
WHERE "slug" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "forms_slug_key" ON "forms"("slug");
