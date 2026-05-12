-- Run once on existing `tepay` DB (phpMyAdmin or mysql CLI) if `commission` is missing.
ALTER TABLE `companies`
  ADD COLUMN `commission` decimal(10,2) NOT NULL DEFAULT 0.00 AFTER `company_code`;
