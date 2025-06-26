/*
  Warnings:

  - You are about to drop the column `userId` on the `Vehicle` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_vehicleId_key";

-- DropIndex
DROP INDEX "Vehicle_userId_key";

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "userId";
