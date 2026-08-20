-- Index penopang paginasi cursor.
--
-- Urutan kolomnya mengikuti urutan pembacaan: penyaring dulu, lalu kunci urut
-- (createdAt, id) yang dipakai sebagai cursor. Tanpa ini setiap halaman
-- memaksa pemindaian dan pengurutan seluruh tabel, sehingga paginasinya
-- menghemat lebar jawaban tetapi tidak menghemat kerja basis data.

CREATE INDEX "forms_isPublished_createdAt_id_idx" ON "forms"("isPublished", "createdAt", "id");

CREATE INDEX "form_responses_formId_createdAt_id_idx" ON "form_responses"("formId", "createdAt", "id");
