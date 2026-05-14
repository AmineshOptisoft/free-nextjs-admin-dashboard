-- Unique referral code per vendor (auto-generated on create in the app).
USE `tepay`;

ALTER TABLE `agents`
  ADD COLUMN `referral_code` varchar(32) NULL DEFAULT NULL AFTER `referral_commission`;

UPDATE `agents` SET `referral_code` = CONCAT('V', LPAD(`id`, 10, '0')) WHERE `referral_code` IS NULL OR `referral_code` = '';

ALTER TABLE `agents`
  MODIFY `referral_code` varchar(32) NOT NULL;

ALTER TABLE `agents`
  ADD UNIQUE KEY `uniq_referral_code` (`referral_code`);
