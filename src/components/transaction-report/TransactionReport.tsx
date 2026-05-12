"use client";

import React from "react";
import {
  TransactionReportFilters,
  TransactionSummaryCards,
  TransactionStatisticsPanels,
  AgentPerformanceTable,
  TransactionStatusDistributionTable,
  type TransactionSummaryCard,
  type TransactionStatBlock,
  type AgentPerformanceRow,
  type TransactionStatusDistributionRow,
} from ".";
import { GrTransaction } from "react-icons/gr";

const summaryCards: TransactionSummaryCard[] = [
  {
    title: "Total Vendors",
    value: "2",
    accent: "blue",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M16 11a4 4 0 10-8 0 4 4 0 008 0zm4 9a8 8 0 10-16 0"
        />
      </svg>
    ),
  },
  {
    title: "Total Transactions",
    value: "14",
    accent: "green",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M4 7h16M4 12h16M4 17h10m6 0h.01M20 12h.01M20 7h.01"
        />
      </svg>
    ),
  },
  {
    title: "Total Volume",
    value: "₹23,697",
    accent: "warning",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1m0-1h-2m2 0h2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: "Avg. Completion Rate",
    value: "0.14%",
    accent: "teal",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M19 5L5 19M7 7h.01M17 17h.01M9.5 7a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm10 10a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
        />
      </svg>
    ),
  },
];

const statBlocks: TransactionStatBlock[] = [
  {
    title: "Pay-In Statistics",
    rows: [
      { label: "Total Transactions", value: "19" },
      { label: "Total Volume", value: "₹3,12,138" },
      { label: "Completion Rate", value: "15.26%" },
      { label: "Average Transaction", value: "₹16,428" },
      { label: "Average Processing Time", value: "17 min" },
    ],
  },
  {
    title: "Pay-Out Statistics",
    rows: [
      { label: "Total Transactions", value: "3" },
      { label: "Total Volume", value: "₹2,552" },
      { label: "Completion Rate", value: "33.33%" },
      { label: "Average Transaction", value: "₹841" },
      { label: "Average Processing Time", value: "8 min" },
    ],
  },
];

const agentPerformanceRows: AgentPerformanceRow[] = [
  {
    agentName: "Bablu0012",
    totalTransactions: 8,
    totalAmount: "₹7.2K",
    completed: "₹7.17K",
    completionRate: "25%",
    avgProcessingTime: "0.08 hrs",
  },
  {
    agentName: "sachin80",
    totalTransactions: 4,
    totalAmount: "₹5K",
    completed: "₹2.5K",
    completionRate: "0%",
    avgProcessingTime: "0 hrs",
  },
];

const statusDistributionRows: TransactionStatusDistributionRow[] = [
  {
    payInCount: 10,
    payInAmount: "₹12,137,566,9035",
    payOutCount: 0,
    payOutAmount: "₹0",
    status: "EXPIRED",
    totalCount: 10,
    totalAmount: "₹12,137,566,9035",
  },
  {
    payInCount: 0,
    payInAmount: "₹0",
    payOutCount: 2,
    payOutAmount: "₹2,500",
    status: "REASSIGNED",
    totalCount: 2,
    totalAmount: "₹2,500",
  },
  {
    payInCount: 1,
    payInAmount: "₹3,000",
    payOutCount: 1,
    payOutAmount: "₹23",
    status: "APPROVED",
    totalCount: 2,
    totalAmount: "₹3,023",
  },
];

export default function TransactionReport() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-gray-900 dark:text-white">
        <GrTransaction className="w-6 h-6" />
        <h1 className="text-xl font-bold">Transaction Report</h1>
      </div>

      <TransactionReportFilters />
      <TransactionSummaryCards cards={summaryCards} />
      <TransactionStatisticsPanels blocks={statBlocks} />
      <AgentPerformanceTable rows={agentPerformanceRows} />
      <TransactionStatusDistributionTable rows={statusDistributionRows} />
    </div>
  );
}