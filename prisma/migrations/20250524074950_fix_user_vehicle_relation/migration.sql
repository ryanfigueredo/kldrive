/*
  Warnings:

  - You are about to drop the column `vehicleId` on the `User` table. All the data in the column will be lost.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_vehicleId_fkey";

-- DropIndex
DROP INDEX "User_vehicleId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "vehicleId",
ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
