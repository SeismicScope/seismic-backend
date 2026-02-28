-- AlterTable
ALTER TABLE "Earthquake" ADD COLUMN     "geom_3857" geometry(Point,3857);

-- CreateIndex
CREATE INDEX "Earthquake_geom_3857_idx" ON "Earthquake" USING GIST ("geom_3857");
