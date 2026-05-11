import type { Metadata } from "next";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | TePay",
  description: "TePay admin financial statistics dashboard",
};

export default function Dashboard() {
  return <AdminDashboard />;
}
