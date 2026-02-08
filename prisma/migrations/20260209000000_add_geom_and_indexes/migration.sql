-- AlterTable: Add geom column
ALTER TABLE "Earthquake" ADD COLUMN "geom" geometry;

-- CreateIndex
CREATE INDEX "earthquake_magnitude_idx" ON "Earthquake"("magnitude");

-- CreateIndex
CREATE INDEX "earthquake_occuredAt_idx" ON "Earthquake"("occuredAt");

-- CreateIndex
CREATE INDEX "earthquake_mag_date_idx" ON "Earthquake"("magnitude", "occuredAt");

-- CreateIndex
CREATE INDEX "Earthquake_geom_idx" ON "Earthquake" USING gist("geom");
