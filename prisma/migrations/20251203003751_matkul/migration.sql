/*
  Warnings:

  - Made the column `userId` on table `dosen` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `dosen` DROP FOREIGN KEY `Dosen_userId_fkey`;

-- AlterTable
ALTER TABLE `dosen` MODIFY `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Dosen` ADD CONSTRAINT `Dosen_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
