/*
  Warnings:

  - A unique constraint covering the columns `[seed]` on the table `Math` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Math.seed_result_unique";

-- CreateIndex
CREATE UNIQUE INDEX "Math.seed_unique" ON "Math"("seed");
