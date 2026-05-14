import { isValidUpiId } from "@/lib/upi-validation";

export type PayMethodKind = "UPI" | "BANK";

export function validateAgentPayMethodPayload(input: {
  paymentMethod: PayMethodKind;
  payInEnabled: boolean;
  payOutEnabled: boolean;
  payInLimit: number;
  payOutLimit: number;
  upiId: string;
}): string | null {
  const { paymentMethod, payInEnabled, payOutEnabled, payInLimit, payOutLimit, upiId } = input;
  if (paymentMethod === "UPI" && !isValidUpiId(upiId)) {
    return "Enter a valid UPI ID (e.g. name@paytm or 9876543210@ybl).";
  }
  if (payInEnabled && (!Number.isFinite(payInLimit) || payInLimit <= 0)) {
    return "Pay In limit is required and must be greater than 0 when Pay In is enabled.";
  }
  if (payOutEnabled && (!Number.isFinite(payOutLimit) || payOutLimit <= 0)) {
    return "Pay Out limit is required and must be greater than 0 when Pay Out is enabled.";
  }
  return null;
}
