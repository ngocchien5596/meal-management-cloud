-- CreateTable
CREATE TABLE "MealPriceConfig" (
    "id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPriceConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealPriceConfig_startDate_endDate_idx" ON "MealPriceConfig"("startDate", "endDate");
