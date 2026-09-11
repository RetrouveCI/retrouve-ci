-- The conversation on a listing (F3). `authorSide` is stored because an
-- administrator is also an ordinary user; `authorId` goes null with its account
-- so the thread outlives the person who wrote in it.

-- CreateEnum
CREATE TYPE "ListingCommentSide" AS ENUM ('ADMIN', 'OWNER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'LISTING_COMMENTED';
ALTER TYPE "NotificationType" ADD VALUE 'LISTING_REPLIED';

-- CreateTable
CREATE TABLE "listing_comment" (
    "id" TEXT NOT NULL,
    "lostItemId" TEXT NOT NULL,
    "authorId" TEXT,
    "authorSide" "ListingCommentSide" NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "listing_comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "listing_comment_lostItemId_createdAt_idx" ON "listing_comment"("lostItemId", "createdAt");

-- CreateIndex
CREATE INDEX "listing_comment_authorId_idx" ON "listing_comment"("authorId");

-- AddForeignKey
ALTER TABLE "listing_comment" ADD CONSTRAINT "listing_comment_lostItemId_fkey" FOREIGN KEY ("lostItemId") REFERENCES "lost_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_comment" ADD CONSTRAINT "listing_comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
