-- CreateTable
CREATE TABLE "Math" (
    "seed" INTEGER NOT NULL,
    "result" INTEGER NOT NULL,
    "toOne" BOOLEAN
);

-- CreateIndex
CREATE UNIQUE INDEX "Math.seed_result_unique" ON "Math"("seed", "result");
