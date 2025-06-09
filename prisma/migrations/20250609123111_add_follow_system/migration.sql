/*
  Warnings:

  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `relatedId` on the `Notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "isRead",
DROP COLUMN "relatedId",
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false;
