import type { Metadata } from "next";
import CompanyNotifications from "@/components/company/CompanyNotifications";

export const metadata: Metadata = {
  title: "Notifications | TePay Company",
  description: "View company alerts and notification queue",
};

export default function NotificationsPage() {
  return <CompanyNotifications />;
}
