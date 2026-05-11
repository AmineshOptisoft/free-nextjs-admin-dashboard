import type { Metadata } from "next";
import UsersList from "@/components/users/UsersList";

export const metadata: Metadata = {
  title: "Users | TePay Admin",
  description: "Manage registered Paysol users",
};

export default function UsersPage() {
  return <UsersList />;
}
