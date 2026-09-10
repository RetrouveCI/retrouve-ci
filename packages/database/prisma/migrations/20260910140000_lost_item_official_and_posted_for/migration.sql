-- The team publishing channel. `official` is public — it is what the badge
-- reads. `postedFor` is not: it names the person the team published on behalf
-- of, and `toPublicLostItem` withholds it.

-- AlterTable
ALTER TABLE "lost_item" ADD COLUMN     "official" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "postedFor" TEXT;
