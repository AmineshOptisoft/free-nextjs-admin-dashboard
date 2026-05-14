-- Dispute workflow state (separate from txn `status`). Run on existing DBs if missing.
ALTER TABLE `transactions`
  ADD COLUMN `dispute_state` ENUM('NONE','PENDING','RESOLVED','OTHER','EXPIRED') NOT NULL DEFAULT 'NONE'
  AFTER `dispute_reason`;

UPDATE `transactions`
SET `dispute_state` = 'PENDING'
WHERE `dispute_raised` = 1;
