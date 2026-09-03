-- CreateEnum
CREATE TYPE "ModerationReason" AS ENUM ('DOCUMENT_NUMBER_VISIBLE', 'UNCLEAR_PHOTO', 'VAGUE_DESCRIPTION', 'CONTACT_IN_DESCRIPTION', 'DUPLICATE', 'OFF_TOPIC', 'OTHER');

-- AlterTable
ALTER TABLE "lost_item" ADD COLUMN     "moderationReason" "ModerationReason",
ADD COLUMN     "moderationReasonNote" TEXT;

