-- CreateTable Earthquake
CREATE TABLE "Earthquake" (
    "id" SERIAL NOT NULL,
    "externalId" TEXT,
    "occuredAt" TIMESTAMP(3) NOT NULL,
    "magnitude" DOUBLE PRECISION NOT NULL,
    "depth" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Earthquake_pkey" PRIMARY KEY ("id")
);

-- CreateTable ImportJob
CREATE TABLE "ImportJob" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "totalRows" INTEGER,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportJob_pkey" PRIMARY KEY ("id")
);