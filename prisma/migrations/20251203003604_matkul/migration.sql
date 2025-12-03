/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Dosen` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `dosen` ADD COLUMN `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('ADMIN', 'MAHASISWA', 'DOSEN') NOT NULL DEFAULT 'MAHASISWA';

-- CreateIndex
CREATE UNIQUE INDEX `Dosen_userId_key` ON `Dosen`(`userId`);

-- AddForeignKey
ALTER TABLE `Dosen` ADD CONSTRAINT `Dosen_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
