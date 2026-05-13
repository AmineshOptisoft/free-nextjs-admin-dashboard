import type { Metadata } from "next";
import CompanyTransactionDetail from "@/components/company/CompanyTransactionDetail";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Transaction | Company | TePay",
  description: "Company transaction details",
};

export default async function CompanyTransactionPage({ params }: PageProps) {
  const { id } = await params;
  return <CompanyTransactionDetail id={id} />;
}
