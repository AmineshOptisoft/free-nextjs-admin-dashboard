import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { allocateAgentReferralCode } from "@/lib/agent-referral-code";
import { jsonStringOrNumberField } from "@/lib/auth-body";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";
type AgentRow = RowDataPacket & {
  id: number;
  fullname: string | null;
  username: string;
  email: string | null;
  security_deposit: string | number;
  credit_limit: string | number;
  previous_balance: string | number;
  net_pay_in: string | number;
  net_pay_out: string | number;
  running_balance: string | number;
  pay_in_commission: string | number;
  pay_out_commission: string | number;
  referral_commission: string | number;
  referral_code: string;
  status: string;
};

const AGENT_STATUSES = new Set(["active", "deactivated", "pending", "blocked"]);

function num(v: string | number): number {
  if (typeof v === "number") return v;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function parsePct(s: unknown): number {
  if (typeof s === "number" && Number.isFinite(s)) return s;
  if (typeof s !== "string") return 0;
  const n = Number.parseFloat(s.replace(/%/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

export async function GET(req: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("search")?.trim() ?? "";

  let sql = `
    SELECT \`id\`, \`fullname\`, \`username\`, \`email\`, \`security_deposit\`, \`credit_limit\`,
           \`previous_balance\`, \`net_pay_in\`, \`net_pay_out\`, \`running_balance\`,
           \`pay_in_commission\`, \`pay_out_commission\`, \`referral_commission\`, \`referral_code\`, \`status\`
    FROM \`agents\`
  `;
  const params: string[] = [];
  if (q) {
    sql += ` WHERE (\`username\` LIKE CONCAT('%', ?, '%') OR \`fullname\` LIKE CONCAT('%', ?, '%') OR \`email\` LIKE CONCAT('%', ?, '%')) `;
    params.push(q, q, q);
  }
  sql += ` ORDER BY \`id\` DESC LIMIT 500`;

  const [rows] = await pool.execute<AgentRow[]>(sql, params);

  const agents = rows.map((r) => ({
    id: String(r.id),
    fullname: r.fullname,
    username: r.username,
    email: r.email,
    security_deposit: num(r.security_deposit),
    credit_limit: num(r.credit_limit),
    previous_balance: num(r.previous_balance),
    net_pay_in: num(r.net_pay_in),
    net_pay_out: num(r.net_pay_out),
    running_balance: num(r.running_balance),
    pay_in_commission: num(r.pay_in_commission),
    pay_out_commission: num(r.pay_out_commission),
    referral_commission: num(r.referral_commission),
    referral_code: (r.referral_code ?? "").trim(),
    status: r.status,
  }));

  return NextResponse.json(
    { ok: true as const, agents },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}

export async function POST(req: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const username = jsonStringOrNumberField(body.username);
  const passwordRaw = jsonStringOrNumberField(body.password);
  const fullname = typeof body.fullname === "string" ? body.fullname.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  const securityDeposit = Number.parseFloat(jsonStringOrNumberField(body.security_deposit)) || 0;
  const creditLimit = Number.parseFloat(jsonStringOrNumberField(body.credit_limit)) || 0;
  const payIn = parsePct(body.pay_in_commission);
  const payOut = parsePct(body.pay_out_commission);
  const referral = parsePct(body.referral_commission);

  let status = typeof body.status === "string" ? body.status.trim().toLowerCase() : "pending";
  if (!AGENT_STATUSES.has(status)) status = "pending";

  if (!username || !passwordRaw) {
    return NextResponse.json({ ok: false, error: "Username and password required" }, { status: 400 });
  }

  const passwordHash = await hash(passwordRaw, 10);

  try {
    const referralCode = await allocateAgentReferralCode(pool);
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO \`agents\` (
        \`fullname\`, \`username\`, \`email\`, \`security_deposit\`, \`credit_limit\`,
        \`net_pay_in\`, \`net_pay_out\`, \`previous_balance\`, \`running_balance\`, \`settlement_amount\`, \`settlement_date\`,
        \`pay_in_commission\`, \`pay_out_commission\`, \`referral_commission\`, \`referral_code\`, \`password\`, \`status\`
      ) VALUES (?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, ?, ?, ?, ?, ?, ?)`,
      [
        fullname || null,
        username,
        email || null,
        securityDeposit,
        creditLimit,
        payIn,
        payOut,
        referral,
        referralCode,
        passwordHash,
        status,
      ],
    );

    return NextResponse.json({
      ok: true as const,
      agent: {
        id: Number(result.insertId),
        username,
        fullname: fullname || null,
        email: email || null,
        status,
        referral_code: referralCode,
      },
    });
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: unknown }).code) : "";
    if (code === "ER_DUP_ENTRY") {
      return NextResponse.json({ ok: false, error: "Username already exists" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "Could not create agent" }, { status: 500 });
  }
}
