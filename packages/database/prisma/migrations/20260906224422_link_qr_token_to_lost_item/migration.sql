-- AlterTable
ALTER TABLE "qr_token" ADD COLUMN     "lostItemId" TEXT;

-- CreateIndex
CREATE INDEX "qr_token_lostItemId_idx" ON "qr_token"("lostItemId");

-- AddForeignKey
ALTER TABLE "qr_token" ADD CONSTRAINT "qr_token_lostItemId_fkey" FOREIGN KEY ("lostItemId") REFERENCES "lost_item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
