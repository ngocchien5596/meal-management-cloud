-- CreateTable
CREATE TABLE "MealReview" (
    "id" TEXT NOT NULL,
    "mealEventId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "images" JSONB,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealReview_mealEventId_idx" ON "MealReview"("mealEventId");

-- AddForeignKey
ALTER TABLE "MealReview" ADD CONSTRAINT "MealReview_mealEventId_fkey" FOREIGN KEY ("mealEventId") REFERENCES "MealEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealReview" ADD CONSTRAINT "MealReview_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
