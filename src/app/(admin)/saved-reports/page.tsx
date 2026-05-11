import type { Metadata } from "next";
import SavedReports from "@/components/reports/SavedReports";

export const metadata: Metadata = {
  title: "Saved Reports | TePay Admin",
  description: "View and generate payment reports",
};

export default function SavedReportsPage() {
  return <SavedReports />;
}
