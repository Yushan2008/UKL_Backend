/*
  Warnings:

  - Added the required column `dosenId` to the `MataKuliah` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `matakuliah` ADD COLUMN `dosenId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `MataKuliah` ADD CONSTRAINT `MataKuliah_dosenId_fkey` FOREIGN KEY (`dosenId`) REFERENCES `Dosen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
