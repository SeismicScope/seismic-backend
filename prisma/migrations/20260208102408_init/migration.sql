-- CreateTable
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
