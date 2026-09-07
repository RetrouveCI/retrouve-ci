
-- AlterTable
ALTER TABLE "qr_token" ADD COLUMN     "lastScannedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "contact_message_qrTokenCode_idx" ON "contact_message"("qrTokenCode");

