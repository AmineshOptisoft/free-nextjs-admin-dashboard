import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { jsonStringOrNumberField } from "@/lib/auth-body";
import { clientsTableHasCompanyIdColumn } from "@/lib/clients-company-column";
import { pool } from "@/lib/db";
import { parseDateRangeFromSearchParams, sqlCreatedAtRange } from "@/lib/date-range";
import { requireCompanySession } from "@/lib/require-company-api";
import { emitTransactionRealtime } from "@/lib/realtime/broadcast-transaction";
import { expireOpenRequestsPastDeadline, sqlExpiresAtFromNow } from "@/lib/request-expiry";

type TxRow = RowDataPacket & {
  id: number;
  assigned_agent_id: number | null;
  resolved_agent_id: number | null;
  order_id: string;
  amount: string | number;
  status: string;
  client_name: string | null;
  client_upi: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  ifsc_code: string | null;
  created_at: Date | string | null;
  expires_at: Date | string | null;
  user_note: string | null;
  assigned_upi: string | null;
  assigned_date: Date | string | null;
  agent_fullname: string | null;
  agent_username: string | null;
  utr_code: string | null;
};

function num(v: string | number): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function agentLabel(full: string | null, user: string | null): string {
  const u = (user ?? "").trim();
  if (!u) return "—";
  const f = (full ?? "").trim();
  return f ? `${f} (${u})` : u;
}

function mapRow(r: TxRow) {
  const created = r.created_at ? new Date(r.created_at as string | Date).toISOString() : undefined;
  const expiresAt = r.expires_at ? new Date(r.expires_at as string | Date).toISOString() : undefined;
  const assignedAt = r.assigned_date ? new Date(r.assigned_date as string | Date).toISOString() : undefined;
  const label = agentLabel(r.agent_fullname, r.agent_username);
  const rid = r.resolved_agent_id ?? r.assigned_agent_id;
  const aid = rid != null && Number(rid) > 0 ? String(Number(rid)) : null;
  const displayLabel = label !== "—" ? label : aid ? `Agent #${aid}` : "—";
  return {
    id: String(r.id),
    orderId: r.order_id,
    amount: num(r.amount),
    status: r.status,
    clientName: r.client_name ?? "",
    clientUpi: r.client_upi ?? "",
    bankName: r.bank_name ?? "",
    accountNo: r.bank_account_number ?? "",
    ifsc: r.ifsc_code ?? "",
    createdAtIso: created,
    expiresAtIso: expiresAt,
    remarks: r.user_note ?? "",
    utrCode: r.utr_code ?? "",
    assignedUpi: r.assigned_upi ?? "",
    assignedAtIso: assignedAt,
    assignedToLabel: displayLabel,
    assignedAgentName: displayLabel !== "—" ? displayLabel : undefined,
    assignedAgentId: aid,
  };
}

export async function GET(req: Request) {
  const auth = await requireCompanySession();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status")?.trim().toUpperCase() ?? "";
  const limitRaw = Number(searchParams.get("limit") ?? "200");
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(1, limitRaw), 500) : 200;
  const { from, to } = parseDateRangeFromSearchParams(searchParams);
  const range = sqlCreatedAtRange("t", from, to);

  let sql = `
    SELECT t.\`id\`, t.\`order_id\`, t.\`amount\`, t.\`status\`, t.\`client_name\`, t.\`client_upi\`,
           t.\`bank_name\`, t.\`bank_account_number\`, t.\`ifsc_code\`, t.\`created_at\`, t.\`expires_at\`, t.\`user_note\`,
           t.\`assigned_upi\`, t.\`assigned_date\`, t.\`utr_code\`, t.\`assigned_agent_id\`,
           COALESCE(NULLIF(t.\`assigned_agent_id\`, 0), NULLIF(pm.\`agent_id\`, 0)) AS resolved_agent_id,
           a.\`fullname\` AS \`agent_fullname\`, a.\`username\` AS \`agent_username\`
    FROM \`transactions\` t
    LEFT JOIN \`pay_methods\` pm ON pm.\`id\` = t.\`pay_method_id\`
    LEFT JOIN \`agents\` a ON a.\`id\` = COALESCE(NULLIF(t.\`assigned_agent_id\`, 0), NULLIF(pm.\`agent_id\`, 0))
    WHERE t.\`company_id\` = ? AND t.\`type\` = 'PAYOUT' AND (${range.sql})
  `;
  const params: (number | string | Date)[] = [auth.companyId, ...range.params];
  if (status) {
    sql += " AND t.`status` = ? ";
    params.push(status);
  }
  sql += " ORDER BY t.`id` DESC LIMIT " + String(limit);

  await expireOpenRequestsPastDeadline(pool);
  const [rows] = await pool.execute<TxRow[]>(sql, params);
  return NextResponse.json({ ok: true as const, payouts: rows.map(mapRow) });
}

async function upsertClientPayoutSnapshot(
  exec: Pick<Pool, "execute">,
  args: {
    companyId: number;
    externalClientId: string;
    clientName: string;
    accountHolderName: string;
    bankName: string;
    accountNo: string;
    ifsc: string;
  },
): Promise<void> {
  await exec.execute(
    `INSERT INTO \`clients\` (
       \`company_id\`, \`client_id\`, \`client_name\`, \`phone\`, \`email\`,
       \`account_number\`, \`ifsc_code\`, \`branch_name\`, \`bank_name\`,
       \`bank_account_holder_name\`, \`upi_id\`, \`upi_account_holder_name\`, \`status\`
     ) VALUES (?, ?, ?, '', '', ?, ?, '', ?, ?, '', '', 'ACTIVE')
     ON DUPLICATE KEY UPDATE
       \`client_name\` = VALUES(\`client_name\`),
       \`account_number\` = VALUES(\`account_number\`),
       \`ifsc_code\` = VALUES(\`ifsc_code\`),
       \`bank_name\` = VALUES(\`bank_name\`),
       \`bank_account_holder_name\` = VALUES(\`bank_account_holder_name\`),
       \`updated_at\` = CURRENT_TIMESTAMP`,
    [
      args.companyId,
      args.externalClientId,
      args.clientName,
      args.accountNo,
      args.ifsc,
      args.bankName,
      args.accountHolderName,
    ],
  );
}

async function insertLegacyCompanyPayoutProfile(
  exec: Pick<Pool, "execute">,
  args: {
    companyId: number;
    externalClientId: string;
    clientName: string;
    accountHolderName: string;
    bankName: string;
    accountNo: string;
    ifsc: string;
  },
): Promise<void> {
  await exec.execute(
    `INSERT INTO \`company_payout_client_profiles\`
     (\`company_id\`, \`external_client_id\`, \`client_name\`, \`account_holder_name\`, \`bank_name\`, \`bank_account_number\`, \`ifsc_code\`)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      args.companyId,
      args.externalClientId,
      args.clientName,
      args.accountHolderName,
      args.bankName,
      args.accountNo,
      args.ifsc,
    ],
  );
}

export async function POST(req: Request) {
  const auth = await requireCompanySession();
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const amount = Number.parseFloat(jsonStringOrNumberField(body.amount));
  const externalClientIdRaw =
    (typeof body.client_id === "string" ? body.client_id.trim() : "") ||
    (typeof body.client_upi === "string" ? body.client_upi.trim() : "");
  const clientName = typeof body.client_name === "string" ? body.client_name.trim() : "";
  const accountHolderName =
    (typeof body.account_holder_name === "string" ? body.account_holder_name.trim() : "") || clientName;
  const bankName = typeof body.bank_name === "string" ? body.bank_name.trim() : "";
  const accountNo = typeof body.bank_account_number === "string" ? body.bank_account_number.trim() : "";
  const ifsc = typeof body.ifsc_code === "string" ? body.ifsc_code.trim() : "";
  const note = typeof body.user_note === "string" ? body.user_note.trim() : "";

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: "Valid amount required" }, { status: 400 });
  }
  if (!externalClientIdRaw || !clientName || !bankName || !accountNo || !ifsc) {
    return NextResponse.json({ ok: false, error: "Client ID, name, and bank fields are required" }, { status: 400 });
  }

  const useClientsTable = await clientsTableHasCompanyIdColumn(pool);
  if (useClientsTable && externalClientIdRaw.length > 100) {
    return NextResponse.json({ ok: false, error: "Client ID must be at most 100 characters" }, { status: 400 });
  }

  const randomCode = randomUUID().replace(/-/g, "").slice(0, 20);
  const orderId = `PO${Date.now()}${Math.floor(Math.random() * 1000)}`;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [res] = await conn.execute<ResultSetHeader>(
      `INSERT INTO \`transactions\` (
        \`random_code\`, \`type\`, \`order_id\`, \`client_id\`, \`amount\`, \`currency\`, \`payment_method\`,
        \`bank_account_number\`, \`ifsc_code\`, \`bank_name\`, \`account_holder_name\`,
        \`status\`, \`client_name\`, \`client_upi\`, \`company_id\`, \`user_note\`, \`expires_at\`
      ) VALUES (?, 'PAYOUT', ?, ?, ?, 'INR', 'BANK', ?, ?, ?, ?, 'NOT_ASSIGNED', ?, ?, ?, NULLIF(?, ''), ${sqlExpiresAtFromNow()})`,
      [
        randomCode,
        orderId,
        externalClientIdRaw,
        amount,
        accountNo,
        ifsc,
        bankName,
        accountHolderName,
        clientName,
        externalClientIdRaw,
        auth.companyId,
        note,
      ],
    );

    const [rows] = await conn.execute<TxRow[]>(
      `SELECT t.\`id\`, t.\`order_id\`, t.\`amount\`, t.\`status\`, t.\`client_name\`, t.\`client_upi\`,
              t.\`bank_name\`, t.\`bank_account_number\`, t.\`ifsc_code\`, t.\`created_at\`, t.\`expires_at\`, t.\`user_note\`,
              t.\`assigned_upi\`, t.\`assigned_date\`, t.\`utr_code\`, t.\`assigned_agent_id\`,
              a.\`fullname\` AS \`agent_fullname\`, a.\`username\` AS \`agent_username\`
       FROM \`transactions\` t
       LEFT JOIN \`agents\` a ON a.\`id\` = t.\`assigned_agent_id\`
       WHERE t.\`id\` = ? AND t.\`company_id\` = ? LIMIT 1`,
      [res.insertId, auth.companyId],
    );
    const row = rows[0];
    if (!row) {
      await conn.rollback();
      return NextResponse.json({ ok: false, error: "Could not load created payout" }, { status: 500 });
    }

    await conn.commit();
    emitTransactionRealtime(Number(res.insertId), "create");

    try {
      if (useClientsTable) {
        await upsertClientPayoutSnapshot(pool, {
          companyId: auth.companyId,
          externalClientId: externalClientIdRaw,
          clientName,
          accountHolderName,
          bankName,
          accountNo,
          ifsc,
        });
      } else {
        await insertLegacyCompanyPayoutProfile(pool, {
          companyId: auth.companyId,
          externalClientId: externalClientIdRaw,
          clientName,
          accountHolderName,
          bankName,
          accountNo,
          ifsc,
        });
      }
    } catch (e) {
      console.error(
        useClientsTable
          ? "clients upsert failed (ensure `clients` has `company_id` + uniq_company_client; run migration 005?)"
          : "company_payout_client_profiles insert failed (run migration 004?)",
        e,
      );
    }

    return NextResponse.json({ ok: true as const, payout: mapRow(row) });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    return NextResponse.json({ ok: false, error: "Could not create payout" }, { status: 500 });
  } finally {
    conn.release();
  }
}
