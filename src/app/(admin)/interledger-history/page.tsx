import InterledgerHistoryList from "@/components/interledger/InterledgerHistoryList";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Interledger History | Admin Panel",
  description: "View interledger transfer history.",
};

export default function InterledgerHistoryPage() {
  return <InterledgerHistoryList />;
}
