-- CreateTable
CREATE TABLE "rate_limit_hits" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "stamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limit_hits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rate_limit_hits_key_stamp_idx" ON "rate_limit_hits"("key", "stamp");

-- CreateIndex
CREATE INDEX "rate_limit_hits_stamp_idx" ON "rate_limit_hits"("stamp");

