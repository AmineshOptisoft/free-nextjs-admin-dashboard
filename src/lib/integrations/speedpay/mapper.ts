export type SpeedpayPayinStatus = "INITIATE" | "IN_PROCESS" | "COMPLETED" | "REJECTED" | string;

export function mapSpeedpayPayinToInternalStatus(status: SpeedpayPayinStatus): string {
  const s = String(status || "").trim().toUpperCase();
  if (s === "COMPLETED") return "APPROVED";
  if (s === "REJECTED") return "REJECTED";
  if (s === "IN_PROCESS") return "PENDING";
  if (s === "INITIATE") return "PENDING";
  return "PENDING";
}

export function mapSpeedpayPayinToDisplay(status: SpeedpayPayinStatus): string {
  const s = String(status || "").trim().toUpperCase();
  if (s === "IN_PROCESS") return "IN PROCESS";
  return s || "PENDING";
}

