ALTER TABLE "Earthquake"
DROP COLUMN IF EXISTS "geom_3857";

ALTER TABLE "Earthquake"
ADD COLUMN "geom_3857" geometry(Point,3857)
GENERATED ALWAYS AS (ST_Transform(geom, 3857)) STORED;

CREATE INDEX "Earthquake_geom_3857_idx"
ON "Earthquake"
USING GIST ("geom_3857");