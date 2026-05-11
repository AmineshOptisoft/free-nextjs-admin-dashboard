import type { Metadata } from "next";
import SettlementLog from "@/components/settlement-log/SettlementLog";

export const metadata: Metadata = {
  title: "Settlement Log | TePay Admin",
  description: "Track all settlement records and adjustments",
};

export default function SettlementLogPage() {
  return <SettlementLog />;
}
