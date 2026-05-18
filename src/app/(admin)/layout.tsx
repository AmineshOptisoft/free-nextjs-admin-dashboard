import { redirect } from "next/navigation";
import { getSessionRole } from "@/lib/get-session-role-server";
import AdminLayoutClient from "./AdminLayoutClient";
import RoleRedirector from "@/components/auth/RoleRedirector";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const role = await getSessionRole();
  if (!role) {
    redirect("/signin");
  }
  return (
    <AdminLayoutClient>
      <RoleRedirector role={role} />
      {children}
    </AdminLayoutClient>
  );
}
