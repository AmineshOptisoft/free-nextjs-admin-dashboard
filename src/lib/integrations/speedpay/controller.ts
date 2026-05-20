import {
  speedpayGetPayinStatusById,
  speedpayInitializePayin,
  type SpeedpayInitPayinInput,
} from "./client";
import { mapSpeedpayPayinToDisplay, mapSpeedpayPayinToInternalStatus } from "./mapper";

export async function createSpeedpayPayin(input: SpeedpayInitPayinInput) {
  const res = await speedpayInitializePayin(input);
  if (!res.success || !res.data) {
    throw new Error(res.message || "Speedpay payin init failed");
  }
  return {
    providerId: res.data.id,
    referenceNumber: res.data.reference_number,
    transactionNumber: res.data.transaction_number,
    upi: res.data.upi,
    redirectUrl: res.data.redirect_url,
    amount: Number(res.data.amount) || input.amount,
    providerStatus: String(res.data.status || "INITIATE"),
    internalStatus: mapSpeedpayPayinToInternalStatus(res.data.status || "INITIATE"),
    displayStatus: mapSpeedpayPayinToDisplay(res.data.status || "INITIATE"),
  };
}

export async function fetchSpeedpayPayinStatus(providerId: number) {
  const res = await speedpayGetPayinStatusById(providerId);
  if (!res.success || !res.data) {
    throw new Error(res.message || "Speedpay payin status failed");
  }
  return {
    providerId: res.data.id,
    referenceNumber: res.data.reference_number,
    transactionNumber: res.data.transaction_number,
    upi: res.data.upi,
    amount: Number(res.data.amount) || 0,
    providerStatus: String(res.data.status || ""),
    internalStatus: mapSpeedpayPayinToInternalStatus(res.data.status || ""),
    displayStatus: mapSpeedpayPayinToDisplay(res.data.status || ""),
  };
}

