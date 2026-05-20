-- Client webhook URL per company (Exchange Master style config).

ALTER TABLE `companies`
  ADD COLUMN `webhook_url` varchar(500) DEFAULT NULL AFTER `company_code`;
