import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/get-session-role-server";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const role = await getSessionRole();
  if (!role) {
    redirect("/signin");
  }
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
