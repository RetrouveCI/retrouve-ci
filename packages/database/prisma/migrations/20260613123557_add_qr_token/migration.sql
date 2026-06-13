-- CreateEnum
CREATE TYPE "QrTokenStatus" AS ENUM ('GENERATED', 'ACTIVATED', 'REVOKED');

-- CreateTable
CREATE TABLE "qr_token" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "QrTokenStatus" NOT NULL DEFAULT 'GENERATED',
    "batch" TEXT,
    "label" TEXT,
    "linkedObject" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "qr_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qr_token_code_key" ON "qr_token"("code");

-- CreateIndex
CREATE INDEX "qr_token_userId_idx" ON "qr_token"("userId");

-- CreateIndex
CREATE INDEX "qr_token_status_idx" ON "qr_token"("status");

-- AddForeignKey
ALTER TABLE "qr_token" ADD CONSTRAINT "qr_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
