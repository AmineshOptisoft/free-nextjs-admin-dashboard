-- One-time upgrade: scope `clients` by company and migrate latest rows from
-- `company_payout_client_profiles` into `clients`.
--
-- Skip this file if `clients` already has `company_id` (e.g. you imported the
-- current `database/tepay-schema.sql`). If you still need to copy legacy profile
-- rows, run only the INSERT...SELECT block after confirming `uniq_company_client`
-- exists on `clients`.
USE `tepay`;

ALTER TABLE `clients`
  ADD COLUMN `company_id` bigint(20) UNSIGNED NOT NULL DEFAULT 0 AFTER `id`;

ALTER TABLE `clients` DROP INDEX `client_id`;

ALTER TABLE `clients`
  ADD UNIQUE KEY `uniq_company_client` (`company_id`, `client_id`),
  ADD KEY `idx_company_id` (`company_id`);

INSERT INTO `clients` (
  `company_id`,
  `client_id`,
  `client_name`,
  `phone`,
  `email`,
  `account_number`,
  `ifsc_code`,
  `branch_name`,
  `bank_name`,
  `bank_account_holder_name`,
  `upi_id`,
  `upi_account_holder_name`,
  `status`,
  `notes`
)
SELECT
  p.`company_id`,
  LEFT(p.`external_client_id`, 100),
  p.`client_name`,
  '',
  '',
  p.`bank_account_number`,
  p.`ifsc_code`,
  '',
  p.`bank_name`,
  p.`account_holder_name`,
  '',
  '',
  'ACTIVE',
  NULL
FROM `company_payout_client_profiles` p
INNER JOIN (
  SELECT `company_id`, `external_client_id`, MAX(`id`) AS `mid`
  FROM `company_payout_client_profiles`
  GROUP BY `company_id`, `external_client_id`
) q ON q.`mid` = p.`id`
ON DUPLICATE KEY UPDATE
  `client_name` = VALUES(`client_name`),
  `account_number` = VALUES(`account_number`),
  `ifsc_code` = VALUES(`ifsc_code`),
  `bank_name` = VALUES(`bank_name`),
  `bank_account_holder_name` = VALUES(`bank_account_holder_name`),
  `updated_at` = CURRENT_TIMESTAMP;
