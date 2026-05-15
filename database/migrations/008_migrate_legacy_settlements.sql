-- Run only if you previously created the unified `settlements` table (old 007).
-- Copies rows into agent_settlements / company_settlements, then drops the old table.

INSERT INTO `agent_settlements` (
  `agent_id`, `amount`, `remark`, `settled_by`, `last_settled_at`,
  `period_from`, `period_to`,
  `pay_in_commission`, `pay_out_commission`, `referral_commission`,
  `final_settlement_amount`, `settlement_status`, `previous_settlement_id`,
  `settlement_type`, `commission_head`, `transaction_type`, `settlement_frequency`,
  `previous_balance_snapshot`, `running_balance_snapshot`,
  `pay_in_volume`, `pay_out_volume`, `created_at`, `updated_at`
)
SELECT
  `party_id`, `amount`, `remark`, `settled_by`, `last_settled_at`,
  `period_from`, `period_to`,
  `pay_in_commission`, `pay_out_commission`, `referral_commission`,
  `final_settlement_amount`, `settlement_status`, NULL,
  `settlement_type`, `commission_head`, `transaction_type`, `settlement_frequency`,
  `previous_balance_snapshot`, `running_balance_snapshot`,
  `pay_in_volume`, `pay_out_volume`, `created_at`, `updated_at`
FROM `settlements`
WHERE `party_type` = 'AGENT';

INSERT INTO `company_settlements` (
  `company_id`, `amount`, `remark`, `settled_by`, `last_settled_at`,
  `period_from`, `period_to`,
  `pay_in_commission`, `pay_out_commission`,
  `final_settlement_amount`, `settlement_status`, `previous_settlement_id`,
  `settlement_type`, `commission_head`, `transaction_type`, `settlement_frequency`,
  `previous_balance_snapshot`, `running_balance_snapshot`,
  `pay_in_volume`, `pay_out_volume`, `created_at`, `updated_at`
)
SELECT
  `party_id`, `amount`, `remark`, `settled_by`, `last_settled_at`,
  `period_from`, `period_to`,
  `pay_in_commission`, `pay_out_commission`,
  `final_settlement_amount`, `settlement_status`, NULL,
  `settlement_type`,
  CASE WHEN `commission_head` = 'REFERRAL' THEN 'ALL' ELSE `commission_head` END,
  `transaction_type`, `settlement_frequency`,
  `previous_balance_snapshot`, `running_balance_snapshot`,
  `pay_in_volume`, `pay_out_volume`, `created_at`, `updated_at`
FROM `settlements`
WHERE `party_type` = 'COMPANY';

DROP TABLE IF EXISTS `settlements`;
