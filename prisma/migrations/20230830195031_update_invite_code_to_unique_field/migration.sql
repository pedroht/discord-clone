/*
  Warnings:

  - A unique constraint covering the columns `[invite_code]` on the table `servers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `servers` MODIFY `invite_code` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `servers_invite_code_key` ON `servers`(`invite_code`);
