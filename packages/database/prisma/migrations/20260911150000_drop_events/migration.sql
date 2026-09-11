-- Removes the Événements module: its table and its enum.
--
-- The `event` table was measured empty in production on 2026-09-10 and again on
-- a local database on 2026-09-11, so nothing is exported and nothing is lost.
-- The `DROP TABLE` is unconditional all the same: a migration whose safety
-- rests on a count taken elsewhere, on another day, is not a safe migration —
-- what makes this one safe is that the module is withdrawn, rows or no rows.
--
-- The enum goes with the table, since nothing else refers to it. The code is in
-- the history; §F6 of EVOLUTION-PLAN.md says where to look for it.

BEGIN;

-- DropTable
DROP TABLE "event";

-- DropEnum
DROP TYPE "EventStatus";

COMMIT;
