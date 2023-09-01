-- CreateTable
CREATE TABLE `conversations` (
    `id` VARCHAR(191) NOT NULL,
    `member_one_id` VARCHAR(191) NOT NULL,
    `member_two_id` VARCHAR(191) NOT NULL,

    INDEX `conversations_member_one_id_idx`(`member_one_id`),
    INDEX `conversations_member_two_id_idx`(`member_two_id`),
    UNIQUE INDEX `conversations_member_one_id_member_two_id_key`(`member_one_id`, `member_two_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
