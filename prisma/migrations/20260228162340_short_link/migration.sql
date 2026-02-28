/*
  Warnings:

  - You are about to drop the column `geom_3857` on the `Earthquake` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "earthquake_geom_3857_idx";

-- AlterTable
ALTER TABLE "Earthquake" DROP COLUMN "geom_3857";

-- CreateTable
CREATE TABLE "ShortLink" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShortLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortLink_code_key" ON "ShortLink"("code");
