import type { Metadata } from "next";
import PayInList from "@/components/pay-in/PayInList";

export const metadata: Metadata = {
  title: "Pay In | TePay Admin",
  description: "Manage and approve Pay In transactions",
};

export default function PayInPage() {
  return <PayInList />;
}
