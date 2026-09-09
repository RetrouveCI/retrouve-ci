-- CreateEnum
CREATE TYPE "StickerOrderSource" AS ENUM ('HOME', 'STICKERS_PAGE', 'ACCOUNT', 'DIRECT');

-- AlterTable
ALTER TABLE "sticker_order" ADD COLUMN     "source" "StickerOrderSource" NOT NULL DEFAULT 'DIRECT';

