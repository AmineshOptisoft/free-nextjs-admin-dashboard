import type { Metadata } from "next";
import LedgerReport from "@/components/ledger/LedgerReport";

export const metadata: Metadata = {
  title: "Ledger | TePay Admin",
  description: "Review subadmin ledger balances and entry history",
};

export default function LedgerPage() {
  return <LedgerReport />;
}
