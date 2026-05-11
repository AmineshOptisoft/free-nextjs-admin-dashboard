import type { Metadata } from "next";
import TransactionReport from "@/components/transaction-report/TransactionReport";

export const metadata: Metadata = {
  title: "Transaction Report | TePay Admin",
  description: "Overview of transaction operations by agent and status",
};

export default function TransactionReportPage() {
  return <TransactionReport />;
}
