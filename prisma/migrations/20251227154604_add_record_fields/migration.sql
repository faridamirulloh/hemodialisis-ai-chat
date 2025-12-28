/*
  Warnings:

  - You are about to drop the column `content` on the `Record` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Record" DROP COLUMN "content",
ADD COLUMN     "bloodPressure" JSONB,
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'general',
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dialysisSchedule" JSONB,
ADD COLUMN     "dietNotes" TEXT,
ADD COLUMN     "fluidIntake" DOUBLE PRECISION,
ADD COLUMN     "labResults" JSONB,
ADD COLUMN     "medications" JSONB,
ADD COLUMN     "mood" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "symptoms" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "weight" DOUBLE PRECISION;
