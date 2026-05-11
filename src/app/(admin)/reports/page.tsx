import type { Metadata } from "next";
import CompanyReports from "@/components/company/CompanyReports";

export const metadata: Metadata = {
  title: "Reports | TePay Company",
  description: "Detailed company transaction reports",
};

export default function ReportsPage() {
  return <CompanyReports />;
}
