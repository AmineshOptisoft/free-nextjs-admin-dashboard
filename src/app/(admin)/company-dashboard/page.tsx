import type { Metadata } from "next";
import CompanyDashboard from "@/components/company/CompanyDashboard";

export const metadata: Metadata = {
  title: "Company Dashboard | TePay",
  description: "Company operations dashboard overview",
};

export default function CompanyDashboardPage() {
  return <CompanyDashboard />;
}
