import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { jsonStringOrNumberField } from "@/lib/auth-body";
import { pool } from "@/lib/db";
import { requireAdminSession } from "@/lib/require-admin-api";

const STATUSES = new Set(["ACTIVE", "DEACTIVATED", "PENDING", "BLOCKED"]);

function parsePct(s: unknown): number {
  if (typeof s === "number" && Number.isFinite(s)) return s;
  if (typeof s !== "string") return 0;
  const n = Number.parseFloat(s.replace(/%/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

/** Random unique `company_code` (DB has UNIQUE on `company_code`). */
async function allocateCompanyCode(): Promise<string> {
  for (let attempt = 0; attempt < 40; attempt++) {
    const raw = randomBytes(6).toString("base64url").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const code = `C${(raw + randomBytes(4).toString("hex").toUpperCase()).slice(0, 12)}`;
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT `id` FROM `companies` WHERE `company_code` = ? LIMIT 1",
      [code],
    );
    if (!rows.length) return code;
  }
  throw new Error("Could not allocate unique company code");
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
  const brandName =
    (typeof body.brand_name === "string" && body.brand_name.trim()) ||
    (typeof body.company_name === "string" && body.company_name.trim()) ||
    "";
  const logo =
    (typeof body.logo === "string" && body.logo.trim()) ||
    (typeof body.brand_logo === "string" && body.brand_logo.trim()) ||
    null;

  let status = typeof body.status === "string" ? body.status.trim().toUpperCase() : "PENDING";
  if (!STATUSES.has(status)) status = "PENDING";

  const commission = parsePct(body.commission);

  if (!username || !passwordRaw) {
    return NextResponse.json({ ok: false, error: "Username and password required" }, { status: 400 });
  }

  const passwordHash = await hash(passwordRaw, 10);

  for (let insertAttempt = 0; insertAttempt < 8; insertAttempt++) {
    let companyCode: string;
    try {
      companyCode = await allocateCompanyCode();
    } catch {
      return NextResponse.json({ ok: false, error: "Could not allocate company code" }, { status: 500 });
    }

    try {
      const [result] = await pool.execute<ResultSetHeader>(
        "INSERT INTO `companies` (`username`, `password`, `brand_name`, `logo`, `status`, `company_code`, `commission`) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [username, passwordHash, brandName, logo, status, companyCode, commission],
      );

      return NextResponse.json({
        ok: true as const,
        company: {
          id: Number(result.insertId),
          username,
          brand_name: brandName,
          status,
          company_code: companyCode,
          commission,
        },
      });
    } catch (e: unknown) {
      const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: unknown }).code) : "";
      if (code === "ER_DUP_ENTRY") {
        const msg = typeof e === "object" && e !== null && "message" in e ? String((e as { message: unknown }).message) : "";
        if (msg.includes("company_code")) continue;
        return NextResponse.json({ ok: false, error: "Username already exists" }, { status: 409 });
      }
      if (code === "ER_BAD_FIELD_ERROR") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Database missing `commission` column. Run `database/add_company_commission.sql` on your DB, then retry.",
          },
          { status: 500 },
        );
      }
      return NextResponse.json({ ok: false, error: "Could not create company" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: false, error: "Could not create company (code collision)" }, { status: 500 });
}
