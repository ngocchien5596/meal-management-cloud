-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CLERK';

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "directoryId" TEXT,
ADD COLUMN     "phoneNumber" TEXT;

-- AlterTable
ALTER TABLE "IngredientCatalog" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "MenuItemCatalog" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "locationId" TEXT;

-- AlterTable
ALTER TABLE "RegistrationPreset" ADD COLUMN     "locationId" TEXT;

-- CreateTable
CREATE TABLE "GuestDirectory" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestDirectory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealLocation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestDirectory_fullName_phoneNumber_key" ON "GuestDirectory"("fullName", "phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MealLocation_name_key" ON "MealLocation"("name");

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "MealLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckinLog" ADD CONSTRAINT "CheckinLog_mealEventId_employeeId_fkey" FOREIGN KEY ("mealEventId", "employeeId") REFERENCES "Registration"("mealEventId", "employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_directoryId_fkey" FOREIGN KEY ("directoryId") REFERENCES "GuestDirectory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestDirectory" ADD CONSTRAINT "GuestDirectory_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationPreset" ADD CONSTRAINT "RegistrationPreset_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "MealLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
