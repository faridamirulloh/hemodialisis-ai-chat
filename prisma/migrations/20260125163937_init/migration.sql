/*
  Warnings:

  - The primary key for the `chat_histories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `chat_histories` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "chat_histories" DROP CONSTRAINT "chat_histories_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "chat_histories_pkey" PRIMARY KEY ("id");
