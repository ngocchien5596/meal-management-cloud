/*
  Warnings:

  - The `images` column on the `MealReview` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "MealPriceConfig_startDate_endDate_idx";

-- DropIndex
DROP INDEX "MealReview_mealEventId_idx";

-- AlterTable
ALTER TABLE "MealReview" ADD COLUMN     "rating" INTEGER NOT NULL DEFAULT 5,
DROP COLUMN "images",
ADD COLUMN     "images" TEXT[],
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
