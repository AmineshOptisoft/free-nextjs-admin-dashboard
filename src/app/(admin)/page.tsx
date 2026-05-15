import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import { getSessionRole } from "@/lib/get-session-role-server";

export const metadata: Metadata = {
  title: "Dashboard | TePay",
  description: "TePay dashboard",
};

export default async function Dashboard() {
  const role = await getSessionRole();
  if (role === "agent") redirect("/agent-dashboard");
  if (role === "company") redirect("/company-dashboard");
  return <AdminDashboard />;
}
