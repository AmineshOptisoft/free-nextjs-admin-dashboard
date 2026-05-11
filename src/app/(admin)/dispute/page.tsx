import type { Metadata } from "next";
import DisputeList from "@/components/dispute/DisputeList";

export const metadata: Metadata = {
  title: "Disputes | TePay Admin",
  description: "Manage and resolve payment disputes",
};

export default function DisputePage() {
  return <DisputeList />;
}
