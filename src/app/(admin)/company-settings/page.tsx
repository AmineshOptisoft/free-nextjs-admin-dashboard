import type { Metadata } from "next";
import CompanySettings from "@/components/company/CompanySettings";

export const metadata: Metadata = {
  title: "Company Settings | TePay",
  description: "Company payment QR and payment link settings",
};

export default function CompanySettingsPage() {
  return <CompanySettings />;
}
