ALTER TABLE "Earthquake"
ADD COLUMN geom_3857 geometry(Point, 3857);

UPDATE "Earthquake"
SET geom_3857 = ST_Transform(geom, 3857);

CREATE INDEX earthquake_geom_3857_idx
ON "Earthquake"
USING GIST (geom_3857);