-- AlterTable
ALTER TABLE "form_responses" ADD COLUMN "idempotencyKey" TEXT;

-- CreateIndex
-- NULL tidak pernah sama dengan NULL di Postgres, jadi baris lama yang
-- idempotencyKey-nya kosong tetap boleh berjumlah banyak per form.
CREATE UNIQUE INDEX "form_responses_formId_idempotencyKey_key" ON "form_responses"("formId", "idempotencyKey");
