/** Typical Indian UPI VPA: local@provider (alphanumeric + . _ -, provider segment). */
const UPI_ID_RE = /^[\w.-]{2,256}@[\w][\w.-]{1,63}$/i;

export function isValidUpiId(raw: string): boolean {
  const s = raw.trim();
  if (s.length < 5 || s.length > 320) return false;
  if (!s.includes("@")) return false;
  return UPI_ID_RE.test(s);
}
