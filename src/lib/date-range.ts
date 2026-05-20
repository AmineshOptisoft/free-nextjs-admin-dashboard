/** Parse `from` / `to` query params (ISO or YYYY-MM-DD) for transaction date filters. */

export function parseDateRangeFromSearchParams(searchParams: URLSearchParams): {
  from: Date | null;
  to: Date | null;
} {
  return {
    from: parseRangeBound(searchParams.get("from"), "start"),
    to: parseRangeBound(searchParams.get("to"), "end"),
  };
}

function parseRangeBound(raw: string | null, bound: "start" | "end"): Date | null {
  if (!raw || !String(raw).trim()) return null;
  const s = String(raw).trim();
  let d = new Date(s);
  if (Number.isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(s)) {
    d = new Date(bound === "end" ? `${s}T23:59:59.999` : `${s}T00:00:00`);
  }
  return Number.isNaN(d.getTime()) ? null : d;
}

export function sqlCreatedAtRange(alias: string, from: Date | null, to: Date | null): {
  sql: string;
  params: Date[];
} {
  const col = `${alias}.\`created_at\``;
  const parts: string[] = [];
  const params: Date[] = [];
  if (from) {
    parts.push(`${col} >= ?`);
    params.push(from);
  }
  if (to) {
    parts.push(`${col} <= ?`);
    params.push(to);
  }
  return { sql: parts.length ? parts.join(" AND ") : "1=1", params };
}

export function appendDateRangeToUrl(base: string, from: string, to: string): string {
  const q = new URLSearchParams();
  if (from) q.set("from", new Date(`${from}T00:00:00`).toISOString());
  if (to) q.set("to", new Date(`${to}T23:59:59`).toISOString());
  const qs = q.toString();
  if (!qs) return base;
  return base.includes("?") ? `${base}&${qs}` : `${base}?${qs}`;
}

export function toInputDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayInputDate(): string {
  return toInputDate(new Date());
}

export function daysAgoInputDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toInputDate(d);
}
