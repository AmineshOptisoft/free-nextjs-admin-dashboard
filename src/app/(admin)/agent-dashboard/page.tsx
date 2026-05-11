import type { Metadata } from "next";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import AgentOperationsCards from "@/components/dashboard/AgentOperationsCards";
import PayinListTable from "@/components/dashboard/PayinListTable";
import SummaryTable from "@/components/dashboard/SummaryTable";
import TransactionVolumeChart from "@/components/dashboard/TransactionVolumeChart";

export const metadata: Metadata = {
  title: "Dashboard | Agent Panel",
};

export default function AgentDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Overview of your payment activity
        </p>
      </div>
      <DashboardMetrics />
      <AgentOperationsCards />
      <PayinListTable />
      <SummaryTable />
      <TransactionVolumeChart />
    </div>
  );
}
