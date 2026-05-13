import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { jsonStringOrNumberField } from "@/lib/auth-body";
import { pool } from "@/lib/db";
import { payInDisplayStatus } from "@/lib/payin-lifecycle";
import { tryAssignPayInTransaction } from "@/lib/payin-assignment";

type CompanyRow = RowDataPacket & {
  id: number;
  username: string;
  brand_name: string | null;
  logo: string | null;
  status: string;
  company_code: string | null;
};

type TxRow = RowDataPacket & {
  id: number;
  order_id: string;
  amount: string | number;
  status: string;
  client_name: string | null;
  client_upi: string | null;
  assigned_upi: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  ifsc_code: string | null;
  payment_method: string;
  account_holder_name: string | null;
  pay_method_id: number | null;
  assigned_agent_id: number | null;
  utr_code: string | null;
  payment_image: string | null;
};

function decodeCompanyKey(raw: string): string {
  const input = String(raw || "").trim();
  if (!input) return "";
  try {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4 || 4)) % 4);
    const decoded = Buffer.from(padded, "base64").toString("utf8").trim();
    return decoded || input;
  } catch {
    return input;
  }
}

async function loadCompanyByKey(companyKey: string): Promise<CompanyRow | null> {
  const decoded = decodeCompanyKey(companyKey);
  const [rows] = await pool.execute<CompanyRow[]>(
    `SELECT \`id\`, \`username\`, \`brand_name\`, \`logo\`, \`status\`, \`company_code\`
     FROM \`companies\`
     WHERE (\`company_code\` = ? OR \`username\` = ?) AND \`status\` = 'ACTIVE'
     LIMIT 1`,
    [decoded, decoded],
  );
  return rows[0] ?? null;
}

function num(v: string | number): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function pickPreferredMethod(raw: unknown): "UPI" | "BANK" | "" {
  const s = typeof raw === "string" ? raw.trim().toUpperCase() : "";
  if (s === "UPI" || s === "BANK") return s;
  return "";
}

function mapRequest(tx: TxRow) {
  const dbStatus = String(tx.status ?? "").trim();
  const proofSubmitted = Boolean(
    (tx.utr_code && String(tx.utr_code).trim()) || (tx.payment_image && String(tx.payment_image).trim()),
  );
  const waitForAgent =
    dbStatus === "NOT_ASSIGNED" || !tx.pay_method_id || !tx.assigned_agent_id;
  return {
    id: String(tx.id),
    orderId: tx.order_id,
    amount: num(tx.amount),
    status: dbStatus,
    displayStatus: payInDisplayStatus(dbStatus),
    clientName: tx.client_name ?? "",
    clientUpi: tx.client_upi ?? "",
    assignedUpi: tx.assigned_upi ?? "",
    bankName: tx.bank_name ?? "",
    accountNo: tx.bank_account_number ?? "",
    ifsc: tx.ifsc_code ?? "",
    paymentMethod: (tx.payment_method ?? "UPI").toString().toUpperCase() === "BANK" ? "BANK" : "UPI",
    accountHolderName: tx.account_holder_name ?? "",
    waitForAgent,
    proofSubmitted,
    hasReceipt: Boolean(tx.payment_image && String(tx.payment_image).trim().length > 0),
    utrCode: tx.utr_code ?? "",
  };
}

function isDupKey(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "ER_DUP_ENTRY";
}

const TERMINAL_FOR_IDEMPOTENCY = new Set(["REJECTED", "EXPIRED", "REVOKED"]);

export async function GET(_req: Request, context: { params: { companyKey: string } | Promise<{ companyKey: string }> }) {
  const { companyKey } = await Promise.resolve(context.params);
  const company = await loadCompanyByKey(companyKey);
  if (!company) {
    return NextResponse.json({ ok: false, error: "Invalid or inactive company link" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true as const,
    company: {
      id: String(company.id),
      brand_name: company.brand_name ?? company.username,
      logo: company.logo,
      company_code: company.company_code,
    },
  });
}

export async function POST(req: Request, context: { params: { companyKey: string } | Promise<{ companyKey: string }> }) {
  const { companyKey } = await Promise.resolve(context.params);
  const company = await loadCompanyByKey(companyKey);
  if (!company) {
    return NextResponse.json({ ok: false, error: "Invalid or inactive company link" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const amount = Number.parseFloat(jsonStringOrNumberField(body.amount));
  const clientName = typeof body.client_name === "string" ? body.client_name.trim() : "";
  const clientUpi = typeof body.client_upi === "string" ? body.client_upi.trim() : "";
  const preferredMethod = pickPreferredMethod(body.method);
  const idempotencyKey =
    typeof body.idempotency_key === "string" ? body.idempotency_key.trim().slice(0, 200) : "";

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: "Valid amount required" }, { status: 400 });
  }
  if (!clientName || !clientUpi) {
    return NextResponse.json({ ok: false, error: "Client name and UPI required" }, { status: 400 });
  }
  if (!preferredMethod) {
    return NextResponse.json({ ok: false, error: "Method must be UPI or BANK" }, { status: 400 });
  }

  async function loadTxById(id: number): Promise<TxRow | null> {
    const [rows] = await pool.execute<TxRow[]>(
      `SELECT \`id\`, \`order_id\`, \`amount\`, \`status\`, \`client_name\`, \`client_upi\`, \`assigned_upi\`,
              \`bank_name\`, \`bank_account_number\`, \`ifsc_code\`, \`payment_method\`, \`account_holder_name\`,
              \`pay_method_id\`, \`assigned_agent_id\`, \`utr_code\`, \`payment_image\`
       FROM \`transactions\` WHERE \`id\` = ? LIMIT 1`,
      [id],
    );
    return rows[0] ?? null;
  }

  function respondWithTx(tx: TxRow) {
    const mapped = mapRequest(tx);
    return NextResponse.json({
      ok: true as const,
      request: mapped,
      waitForAgent: mapped.waitForAgent,
    });
  }

  if (idempotencyKey) {
    const [existingRows] = await pool.execute<TxRow[]>(
      `SELECT \`id\`, \`order_id\`, \`amount\`, \`status\`, \`client_name\`, \`client_upi\`, \`assigned_upi\`,
              \`bank_name\`, \`bank_account_number\`, \`ifsc_code\`, \`payment_method\`, \`account_holder_name\`,
              \`pay_method_id\`, \`assigned_agent_id\`, \`utr_code\`, \`payment_image\`
       FROM \`transactions\`
       WHERE \`company_id\` = ? AND \`type\` = 'PAYIN' AND \`idempotency_key\` = ?
       LIMIT 1`,
      [company.id, idempotencyKey],
    );
    const ex = existingRows[0];
    if (ex) {
      const st = String(ex.status).toUpperCase();
      if (TERMINAL_FOR_IDEMPOTENCY.has(st)) {
        return respondWithTx(ex);
      }
      if (st === "NOT_ASSIGNED") {
        await tryAssignPayInTransaction(Number(ex.id), num(ex.amount), pickPreferredMethod(ex.payment_method));
      }
      const fresh = await loadTxById(Number(ex.id));
      if (!fresh) return NextResponse.json({ ok: false, error: "Could not load request" }, { status: 500 });
      return respondWithTx(fresh);
    }
  }

  const randomCode = randomUUID().replace(/-/g, "").slice(0, 20);
  const orderId = `PI${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const idemParam = idempotencyKey.length > 0 ? idempotencyKey : null;

  let insertId: number;
  try {
    const [res] = await pool.execute<ResultSetHeader>(
      `INSERT INTO \`transactions\` (
        \`random_code\`, \`type\`, \`order_id\`, \`amount\`, \`currency\`, \`payment_method\`,
        \`status\`, \`client_name\`, \`client_upi\`, \`company_id\`, \`idempotency_key\`, \`expires_at\`
      ) VALUES (?, 'PAYIN', ?, ?, 'INR', ?, 'NOT_ASSIGNED', ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
      [randomCode, orderId, amount, preferredMethod, clientName, clientUpi, company.id, idemParam],
    );
    insertId = Number(res.insertId);
  } catch (e) {
    if (isDupKey(e) && idempotencyKey) {
      const [again] = await pool.execute<TxRow[]>(
        `SELECT \`id\`, \`order_id\`, \`amount\`, \`status\`, \`client_name\`, \`client_upi\`, \`assigned_upi\`,
                \`bank_name\`, \`bank_account_number\`, \`ifsc_code\`, \`payment_method\`, \`account_holder_name\`,
                \`pay_method_id\`, \`assigned_agent_id\`, \`utr_code\`, \`payment_image\`
         FROM \`transactions\`
         WHERE \`company_id\` = ? AND \`type\` = 'PAYIN' AND \`idempotency_key\` = ?
         LIMIT 1`,
        [company.id, idempotencyKey],
      );
      const row = again[0];
      if (row) {
        if (String(row.status).toUpperCase() === "NOT_ASSIGNED") {
          await tryAssignPayInTransaction(Number(row.id), num(row.amount), pickPreferredMethod(row.payment_method));
        }
        const fresh = await loadTxById(Number(row.id));
        if (fresh) return respondWithTx(fresh);
      }
    }
    throw e;
  }

  await tryAssignPayInTransaction(insertId, amount, preferredMethod);
  const tx = await loadTxById(insertId);
  if (!tx) return NextResponse.json({ ok: false, error: "Could not load created request" }, { status: 500 });

  return respondWithTx(tx);
}
