-- Legacy: superseded by `clients` (see migration 005 + `company_id` on clients).
-- Append-only history of payout recipient details per company + external client ID.
-- Latest row (highest id) is used for autocomplete; older rows are never updated.

CREATE TABLE IF NOT EXISTS `company_payout_client_profiles` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` bigint UNSIGNED NOT NULL,
  `external_client_id` varchar(255) NOT NULL,
  `client_name` varchar(255) NOT NULL DEFAULT '',
  `account_holder_name` varchar(255) NOT NULL DEFAULT '',
  `bank_name` varchar(255) NOT NULL DEFAULT '',
  `bank_account_number` varchar(255) NOT NULL DEFAULT '',
  `ifsc_code` varchar(64) NOT NULL DEFAULT '',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_company_client` (`company_id`, `external_client_id`),
  KEY `idx_company_client_id` (`company_id`, `external_client_id`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
