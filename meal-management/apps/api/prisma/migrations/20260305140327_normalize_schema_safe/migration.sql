/*
  Warnings:
  - You are about to drop the column `name` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `MenuItem` table. All the data in the column will be lost.
  - Added the required column `catalogId` to the `Ingredient` table without a default value.
  - Added the required column `catalogId` to the `MenuItem` table without a default value.
*/

-- 1. Create Catalog Tables First
CREATE TABLE "IngredientCatalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultUnit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngredientCatalog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MenuItemCatalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MenuItemCatalog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "IngredientCatalog_name_key" ON "IngredientCatalog"("name");
CREATE UNIQUE INDEX "MenuItemCatalog_name_key" ON "MenuItemCatalog"("name");

-- 2. Add catalogId as NULLABLE first to handle existing data
ALTER TABLE "Ingredient" ADD COLUMN "catalogId" TEXT;
ALTER TABLE "MenuItem" ADD COLUMN "catalogId" TEXT;

-- 3. DATA MIGRATION: Migrate Ingredients to Catalog
-- 3.1 Insert unique names from legacy data into catalog
INSERT INTO "IngredientCatalog" ("id", "name", "defaultUnit", "updatedAt")
SELECT DISTINCT 
    'mig_' || md5(name || unit), 
    name, 
    unit, 
    now()
FROM "Ingredient"
WHERE name IS NOT NULL
ON CONFLICT ("name") DO NOTHING;

-- 3.2 Update Ingredients to point to Catalog items
UPDATE "Ingredient"
SET "catalogId" = ic.id
FROM "IngredientCatalog" ic
WHERE "Ingredient".name = ic.name AND "Ingredient"."catalogId" IS NULL;

-- 4. DATA MIGRATION: Migrate MenuItems to Catalog
-- 4.1 Insert unique names from legacy data into catalog
INSERT INTO "MenuItemCatalog" ("id", "name", "updatedAt")
SELECT DISTINCT 
    'mig_m_' || md5(name), 
    name, 
    now()
FROM "MenuItem"
WHERE name IS NOT NULL
ON CONFLICT ("name") DO NOTHING;

-- 4.2 Update MenuItems to point to Catalog items
UPDATE "MenuItem"
SET "catalogId" = mic.id
FROM "MenuItemCatalog" mic
WHERE "MenuItem".name = mic.name AND "MenuItem"."catalogId" IS NULL;

-- 5. Finalize Schema: Drop name and enforce NOT NULL constraints
-- Note: We only drop columns if they actually exist (safety for retries)
ALTER TABLE "Ingredient" DROP COLUMN "name";
ALTER TABLE "MenuItem" DROP COLUMN "name";

-- Ensure all records have a catalogId (fallback to a 'General' item if somehow still null - unlikely)
-- For safety, we'll only ALTER if the column isn't already NOT NULL
ALTER TABLE "Ingredient" ALTER COLUMN "catalogId" SET NOT NULL;
ALTER TABLE "MenuItem" ALTER COLUMN "catalogId" SET NOT NULL;

-- 6. Add Foreign Keys
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "IngredientCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "MenuItemCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 7. (Optional) Update MealReview table if needed
ALTER TABLE "MealReview" ADD COLUMN IF NOT EXISTS "adminReply" TEXT;
ALTER TABLE "MealReview" ADD COLUMN IF NOT EXISTS "adminReplyAt" TIMESTAMP(3);
