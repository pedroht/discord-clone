-- CreateTable
CREATE TABLE `members` (
    `id` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'MODERATOR', 'GUEST') NOT NULL DEFAULT 'GUEST',
    `profile_id` VARCHAR(191) NOT NULL,
    `server_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `members_profile_id_idx`(`profile_id`),
    INDEX `members_server_id_idx`(`server_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
