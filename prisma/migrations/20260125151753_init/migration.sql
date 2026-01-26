/*
  Warnings:

  - The primary key for the `chat_histories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `session_id` on the `chat_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "chat_sessions_session_id_key";

-- DropIndex
DROP INDEX "users_phone_number_key";

-- AlterTable
ALTER TABLE "chat_histories" DROP CONSTRAINT "chat_histories_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "chat_histories_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "chat_histories_id_seq";

-- AlterTable
ALTER TABLE "chat_sessions" DROP COLUMN "session_id";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "phone_number";

-- CreateIndex
CREATE INDEX "chat_histories_session_id_idx" ON "chat_histories"("session_id");

-- CreateIndex
CREATE INDEX "chat_sessions_user_id_idx" ON "chat_sessions"("user_id");

-- CreateIndex
CREATE INDEX "records_user_id_idx" ON "records"("user_id");

-- AddForeignKey
ALTER TABLE "chat_histories" ADD CONSTRAINT "chat_histories_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
