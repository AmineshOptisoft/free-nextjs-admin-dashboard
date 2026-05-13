-- One-time migration for existing DBs still using old column names.
-- Run on database tepay after backup.

USE `tepay`;

ALTER TABLE `transactions`
  DROP INDEX `idx_user_id`;

ALTER TABLE `transactions`
  CHANGE COLUMN `user_id` `pay_method_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'FK semantics: pay_methods.id (agent payment method line)';

ALTER TABLE `transactions`
  CHANGE COLUMN `account_id` `bank_account_number` varchar(255) DEFAULT NULL COMMENT 'Bank account number';

ALTER TABLE `transactions`
  CHANGE COLUMN `sub_admin_id` `internal_staff_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'Internal/back-office staff (legacy sub_admin)';

ALTER TABLE `transactions`
  ADD KEY `idx_pay_method_id` (`pay_method_id`);
