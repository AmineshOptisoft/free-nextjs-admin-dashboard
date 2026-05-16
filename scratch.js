const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'tepay'
  });
  await conn.execute(`CREATE TABLE IF NOT EXISTS interledger_entries (
    id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    transfer_date date NOT NULL,
    source_agent_id int(10) unsigned NOT NULL,
    dest_agent_id int(10) unsigned NOT NULL,
    source_type enum('security', 'settlement') NOT NULL,
    dest_type enum('security', 'settlement') NOT NULL,
    amount decimal(15,2) NOT NULL DEFAULT 0.00,
    remark text DEFAULT NULL,
    created_by int(11) DEFAULT NULL,
    created_at timestamp NULL DEFAULT current_timestamp(),
    updated_at timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (id),
    KEY idx_source_agent (source_agent_id),
    KEY idx_dest_agent (dest_agent_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);
  console.log('Table created');
  await conn.end();
}
run().catch(console.error);
