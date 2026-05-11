import type { Metadata } from "next";
import PayOutList from "@/components/pay-out/PayOutList";

export const metadata: Metadata = {
  title: "Pay Out | TePay Admin",
  description: "Manage and assign Pay Out transactions",
};

export default function PayOutPage() {
  return <PayOutList />;
}
