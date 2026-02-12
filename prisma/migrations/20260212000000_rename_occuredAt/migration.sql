ALTER TABLE "Earthquake"
RENAME COLUMN "occuredAt" TO "occurredAt";

ALTER INDEX IF EXISTS "earthquake_occuredAt_idx"
RENAME TO "earthquake_occurredAt_idx";
