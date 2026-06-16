-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'QR_SCAN';

-- AlterTable
ALTER TABLE "contact_message" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "qrTokenCode" TEXT,
ADD COLUMN     "recipientUserId" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "contact_message_recipientUserId_idx" ON "contact_message"("recipientUserId");
