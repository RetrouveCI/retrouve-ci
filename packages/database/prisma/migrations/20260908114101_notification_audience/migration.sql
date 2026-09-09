-- CreateEnum
CREATE TYPE "NotificationAudience" AS ENUM ('USER', 'ADMIN');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'LISTING_PENDING';
ALTER TYPE "NotificationType" ADD VALUE 'LISTING_MODERATED';
ALTER TYPE "NotificationType" ADD VALUE 'LISTING_CONTACTED';
ALTER TYPE "NotificationType" ADD VALUE 'ORDER_PLACED';
ALTER TYPE "NotificationType" ADD VALUE 'CONTACT_RECEIVED';

-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "audience" "NotificationAudience" NOT NULL DEFAULT 'USER',
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "notification_audience_read_idx" ON "notification"("audience", "read");

