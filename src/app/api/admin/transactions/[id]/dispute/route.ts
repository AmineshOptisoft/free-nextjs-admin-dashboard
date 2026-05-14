import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin-api";

type TxRow = RowDataPacket & {
  id: number;
  dispute_raised: number;
};

const DISPUTE_STATES = new Set(["PENDING", "RESOLVED", "OTHER", "EXPIRED", "NONE"]);

export async function PATCH(req: Request, context: { params: { id: string } | Promise<{ id: string }> }) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;

  const { id: idRaw } = await Promise.resolve(context.params);
  const txId = Number(idRaw);
  if (!Number.isInteger(txId) || txId < 1) {
    return NextResponse.json({ ok: false, error: "Invalid transaction id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const stateRaw = typeof body.dispute_state === "string" ? body.dispute_state.trim().toUpperCase() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";

  const [rows] = await pool.execute<TxRow[]>(
    "SELECT `id`, `dispute_raised` FROM `transactions` WHERE `id` = ? LIMIT 1",
    [txId],
  );
  if (!rows[0]) {
    return NextResponse.json({ ok: false, error: "Transaction not found" }, { status: 404 });
  }

  if ("dispute_state" in body) {
    if (!stateRaw || !DISPUTE_STATES.has(stateRaw)) {
      return NextResponse.json(
        { ok: false, error: "dispute_state must be one of: NONE, PENDING, RESOLVED, OTHER, EXPIRED" },
        { status: 400 },
      );
    }
    try {
      const [res] = await pool.execute<ResultSetHeader>(
        "UPDATE `transactions` SET `dispute_state` = ? WHERE `id` = ?",
        [stateRaw, txId],
      );
      if (res.affectedRows === 0) {
        return NextResponse.json({ ok: false, error: "Could not update dispute state" }, { status: 500 });
      }
      return NextResponse.json({ ok: true as const, dispute_state: stateRaw });
    } catch (e: unknown) {
      const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code?: string }).code) : "";
      if (code === "ER_BAD_FIELD_ERROR") {
        return NextResponse.json(
          {
            ok: false,
            error: "Run database migration `database/migrations/003_dispute_state.sql` to enable dispute states.",
          },
          { status: 503 },
        );
      }
      throw e;
    }
  }

  try {
    const [res] = await pool.execute<ResultSetHeader>(
      "UPDATE `transactions` SET `dispute_raised` = 1, `dispute_reason` = ?, `dispute_state` = 'PENDING' WHERE `id` = ?",
      [reason || "Other", txId],
    );
    if (res.affectedRows === 0) {
      return NextResponse.json({ ok: false, error: "Could not raise dispute" }, { status: 500 });
    }
    return NextResponse.json({ ok: true as const });
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code?: string }).code) : "";
    if (code === "ER_BAD_FIELD_ERROR") {
      const [res] = await pool.execute<ResultSetHeader>(
        "UPDATE `transactions` SET `dispute_raised` = 1, `dispute_reason` = ? WHERE `id` = ?",
        [reason || "Other", txId],
      );
      if (res.affectedRows === 0) {
        return NextResponse.json({ ok: false, error: "Could not raise dispute" }, { status: 500 });
      }
      return NextResponse.json({ ok: true as const });
    }
    throw e;
  }
}
