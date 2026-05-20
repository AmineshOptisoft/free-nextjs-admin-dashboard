-- Company API keys: multiple keys per company for programmatic access.

CREATE TABLE IF NOT EXISTS `company_api_keys` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `label` varchar(100) NOT NULL DEFAULT '',
  `key_prefix` varchar(20) NOT NULL,
  `key_hash` char(64) NOT NULL,
  `status` enum('ACTIVE','REVOKED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `last_used_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_company_api_key_hash` (`key_hash`),
  KEY `idx_company_api_keys_company` (`company_id`),
  KEY `idx_company_api_keys_status` (`status`),
  CONSTRAINT `fk_company_api_keys_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
