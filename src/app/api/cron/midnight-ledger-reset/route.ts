import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2/promise";
import { pool } from "@/lib/db";

/**
 * Daily rollover (run at local midnight via host cron or Vercel Cron):
 * - Agents: carry closing running into `previous_balance`, reset day's `net_pay_in` / `net_pay_out`, set `running_balance = previous_balance`.
 * - Pay methods: zero today's pay-in / pay-out usage counters (daily limits).
 * - Companies: zero `net_pay_in` / `net_pay_out` (daily counters on company row).
 *
 * Secure with `Authorization: Bearer <CRON_SECRET>` or `?secret=<CRON_SECRET>`.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "CRON_SECRET is not set" }, { status: 503 });
  }
  const auth = req.headers.get("authorization")?.trim();
  const url = new URL(req.url);
  const q = url.searchParams.get("secret")?.trim();
  const vercelCron = req.headers.get("x-vercel-cron") === "1";
  const authorized =
    auth === `Bearer ${secret}` || q === secret || (Boolean(process.env.VERCEL) && vercelCron);
  if (!authorized) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [a1] = await conn.execute<ResultSetHeader>(
      `UPDATE \`agents\`
       SET \`previous_balance\` = \`running_balance\`,
           \`net_pay_in\` = 0,
           \`net_pay_out\` = 0`,
    );
    const [a2] = await conn.execute<ResultSetHeader>(
      `UPDATE \`agents\` SET \`running_balance\` = \`previous_balance\``,
    );

    const [pm] = await conn.execute<ResultSetHeader>(
      `UPDATE \`pay_methods\`
       SET \`today_total_pay_in_amount\` = 0,
           \`today_total_pay_out_amount\` = 0`,
    );

    const [co] = await conn.execute<ResultSetHeader>(
      `UPDATE \`companies\` SET \`net_pay_in\` = 0, \`net_pay_out\` = 0`,
    );

    await conn.commit();

    return NextResponse.json({
      ok: true as const,
      agentsStep1: a1.affectedRows,
      agentsStep2: a2.affectedRows,
      payMethodsReset: pm.affectedRows,
      companiesReset: co.affectedRows,
    });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    return NextResponse.json({ ok: false, error: "Midnight reset failed" }, { status: 500 });
  } finally {
    conn.release();
  }
}
