-- Tepay database schema (MariaDB / MySQL)
-- Import: select DB `tepay` in phpMyAdmin then Import this file,
-- or: mysql -u root -p tepay < database/tepay-schema.sql

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `tepay` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tepay`;

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `agents`
--

CREATE TABLE `agents` (
  `id` int(10) UNSIGNED NOT NULL,
  `fullname` varchar(100) DEFAULT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `security_deposit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `credit_limit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `net_pay_in` decimal(15,2) NOT NULL DEFAULT 0.00,
  `net_pay_out` decimal(15,2) NOT NULL DEFAULT 0.00,
  `previous_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `running_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `settlement_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `settlement_date` bigint(20) DEFAULT 0,
  `pay_in_commission` decimal(10,2) NOT NULL DEFAULT 0.00,
  `pay_out_commission` decimal(10,2) NOT NULL DEFAULT 0.00,
  `referral_commission` decimal(10,2) NOT NULL DEFAULT 0.00,
  `password` varchar(255) NOT NULL,
  `token` text DEFAULT NULL,
  `status` enum('active','deactivated','pending','blocked') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `client_id` varchar(100) NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT '',
  `email` varchar(255) DEFAULT '',
  `account_number` varchar(100) DEFAULT '',
  `ifsc_code` varchar(50) DEFAULT '',
  `branch_name` varchar(255) DEFAULT '',
  `bank_name` varchar(255) DEFAULT '',
  `bank_account_holder_name` varchar(255) DEFAULT '',
  `upi_id` varchar(255) DEFAULT '',
  `upi_account_holder_name` varchar(255) DEFAULT '',
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(100) NOT NULL,
  `net_pay_in` decimal(15,2) NOT NULL DEFAULT 0.00,
  `net_pay_out` decimal(15,2) NOT NULL DEFAULT 0.00,
  `settlement_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `settlement_date` datetime DEFAULT NULL,
  `brand_name` varchar(255) NOT NULL DEFAULT '',
  `logo` text DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `token` text DEFAULT NULL,
  `status` enum('ACTIVE','DEACTIVATED','PENDING','BLOCKED') NOT NULL DEFAULT 'PENDING',
  `company_code` varchar(255) DEFAULT NULL,
  `commission` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pay_methods`
--

CREATE TABLE `pay_methods` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `agent_id` int(20) UNSIGNED DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `upi_id` varchar(255) DEFAULT NULL,
  `payment_method` enum('UPI','BANK') NOT NULL DEFAULT 'UPI',
  `account_no` varchar(100) DEFAULT NULL,
  `ifsc_code` varchar(50) DEFAULT NULL,
  `branch_name` varchar(255) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `account_holder_name` varchar(255) DEFAULT NULL,
  `pay_in_limit` decimal(18,2) NOT NULL DEFAULT 0.00,
  `pay_out_limit` decimal(18,2) NOT NULL DEFAULT 0.00,
  `enable_pay_in` tinyint(1) NOT NULL DEFAULT 0,
  `enable_pay_out` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('ACTIVE','INACTIVE','BLOCKED') NOT NULL DEFAULT 'ACTIVE',
  `today_total_pay_in_amount` decimal(18,2) NOT NULL DEFAULT 0.00,
  `today_total_pay_out_amount` decimal(18,2) NOT NULL DEFAULT 0.00,
  `last_activity` datetime DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `random_code` varchar(255) NOT NULL,
  `pay_method_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'FK semantics: pay_methods.id (agent payment method / account line)',
  `type` enum('PAYIN','PAYOUT') NOT NULL DEFAULT 'PAYIN',
  `order_id` varchar(100) NOT NULL,
  `client_id` varchar(255) DEFAULT NULL,
  `idempotency_key` varchar(255) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'INR',
  `payment_method` varchar(50) NOT NULL DEFAULT 'UPI',
  `bank_account_number` varchar(255) DEFAULT NULL COMMENT 'Bank account number used on this txn side',
  `ifsc_code` varchar(50) DEFAULT NULL,
  `branch_name` varchar(255) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `account_holder_name` varchar(255) DEFAULT NULL,
  `status` enum('PENDING','PAID','APPROVED','APPROVED_BY_ADMIN','REJECTED','EXPIRED','EXPIRED_APPROVED_BY_ADMIN','EXPIRED_APPROVED_BY_AGENT','NOT_ASSIGNED','RE_ASSIGNED','REVOKED') NOT NULL DEFAULT 'PENDING',
  `expired_date` datetime DEFAULT NULL,
  `not_assigned_date` datetime DEFAULT NULL,
  `assigned_date` datetime DEFAULT NULL,
  `rejected_date` datetime DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `assigned_by` bigint(20) UNSIGNED DEFAULT NULL,
  `internal_staff_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'Internal/back-office staff who handled txn (was sub_admin_id)',
  `assigned_agent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `client_name` varchar(255) DEFAULT '',
  `client_upi` varchar(255) DEFAULT '',
  `assigned_upi` varchar(255) DEFAULT NULL,
  `qr_code_url` text DEFAULT NULL,
  `user_note` text DEFAULT NULL,
  `utr_code` varchar(255) DEFAULT NULL,
  `user_upi` varchar(255) DEFAULT NULL,
  `company_id` bigint(20) UNSIGNED DEFAULT NULL,
  `confirmed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `payment_image` text DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `updated_at_custom` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `no_agent_notified_at` datetime DEFAULT NULL,
  `expiry_notified_at` datetime DEFAULT NULL,
  `last_assignment_signal_agent_id` varchar(255) DEFAULT NULL,
  `last_assignment_signal_at` datetime DEFAULT NULL,
  `dispute_raised` tinyint(1) NOT NULL DEFAULT 0,
  `dispute_reason` text DEFAULT NULL,
  `dispute_type` enum('PAYIN','PAYOUT','') DEFAULT '',
  `dispute_raised_by` bigint(20) UNSIGNED DEFAULT NULL,
  `dispute_raised_at` datetime DEFAULT NULL,
  `dispute_agent_id` varchar(255) DEFAULT '',
  `dispute_client_id` varchar(255) DEFAULT '',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`);

ALTER TABLE `agents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_status` (`status`);

ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `client_id` (`client_id`),
  ADD KEY `idx_client_id` (`client_id`),
  ADD KEY `idx_client_name` (`client_name`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_upi_id` (`upi_id`);

ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `company_code` (`company_code`),
  ADD KEY `idx_status` (`status`);

ALTER TABLE `pay_methods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_agent_id` (`agent_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_upi_id` (`upi_id`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`);

ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `random_code` (`random_code`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD UNIQUE KEY `unique_company_type_idempotency` (`company_id`,`type`,`idempotency_key`),
  ADD KEY `idx_client_id` (`client_id`),
  ADD KEY `idx_idempotency_key` (`idempotency_key`),
  ADD KEY `idx_pay_method_id` (`pay_method_id`),
  ADD KEY `idx_company_id` (`company_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_assigned_agent_id` (`assigned_agent_id`);

ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `agents`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `clients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `companies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `pay_methods`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
