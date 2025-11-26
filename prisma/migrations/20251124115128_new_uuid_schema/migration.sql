/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isCoach" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "distance" INTEGER,
    "durationSeconds" INTEGER,
    "durationMinutes" INTEGER,
    "weight" INTEGER,
    "description" TEXT,

    CONSTRAINT "module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduleWeek" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "athlete" TEXT NOT NULL,
    "week" INTEGER NOT NULL,

    CONSTRAINT "scheduleWeek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduleDay" (
    "id" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "weekId" TEXT,

    CONSTRAINT "scheduleDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ModuleToScheduleDay" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ModuleToScheduleDay_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "_ModuleToScheduleDay_B_index" ON "_ModuleToScheduleDay"("B");

-- AddForeignKey
ALTER TABLE "module" ADD CONSTRAINT "module_owner_fkey" FOREIGN KEY ("owner") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduleWeek" ADD CONSTRAINT "scheduleWeek_owner_fkey" FOREIGN KEY ("owner") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduleWeek" ADD CONSTRAINT "scheduleWeek_athlete_fkey" FOREIGN KEY ("athlete") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduleDay" ADD CONSTRAINT "scheduleDay_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "scheduleWeek"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModuleToScheduleDay" ADD CONSTRAINT "_ModuleToScheduleDay_A_fkey" FOREIGN KEY ("A") REFERENCES "module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ModuleToScheduleDay" ADD CONSTRAINT "_ModuleToScheduleDay_B_fkey" FOREIGN KEY ("B") REFERENCES "scheduleDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
