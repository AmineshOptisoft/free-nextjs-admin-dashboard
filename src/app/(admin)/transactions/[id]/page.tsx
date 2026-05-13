import type { Metadata } from "next";
import TransactionDetailView from "@/components/transactions/TransactionDetail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "View Transaction | TePay Admin",
  description: "Transaction details and lifecycle history",
};

export default async function TransactionDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <TransactionDetailView id={id} />;
}
