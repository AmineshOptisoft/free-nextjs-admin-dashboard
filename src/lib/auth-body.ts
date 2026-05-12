/** Postman / clients sometimes send password (or username) as a JSON number. */
export function jsonStringOrNumberField(v: unknown): string {
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return "";
}

export function jsonEmailField(v: unknown): string {
  if (typeof v === "string") return v.trim().toLowerCase();
  if (typeof v === "number" && Number.isFinite(v)) return String(v).trim().toLowerCase();
  return "";
}
