-- Drops the `clothing` and `jewelry` categories.
--
-- Postgres has no `ALTER TYPE ... DROP VALUE`, so the enum is swapped rather
-- than edited. The `USING` cast below fails on any row still holding one of the
-- two values, which is why the `UPDATE` runs first and inside the same
-- transaction: measured empty in production on 2026-09-10, but a migration that
-- assumes zero rows breaks on the first environment where there is one.

BEGIN;

UPDATE "lost_item"
SET "category" = 'OTHER'
WHERE "category" IN ('CLOTHING', 'JEWELRY');

-- AlterEnum
CREATE TYPE "LostItemCategory_new" AS ENUM ('PHONE', 'KEYS', 'WALLET', 'BAG', 'ELECTRONICS', 'DOCUMENTS', 'OTHER');
ALTER TABLE "lost_item" ALTER COLUMN "category" TYPE "LostItemCategory_new" USING ("category"::text::"LostItemCategory_new");
ALTER TYPE "LostItemCategory" RENAME TO "LostItemCategory_old";
ALTER TYPE "LostItemCategory_new" RENAME TO "LostItemCategory";
DROP TYPE "LostItemCategory_old";

COMMIT;
