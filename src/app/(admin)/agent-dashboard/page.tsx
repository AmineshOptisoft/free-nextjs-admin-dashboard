import type { Metadata } from "next";
import { CompanyDashboardIcon } from "@/icons/nav-icons";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import AgentOperationsCards from "@/components/dashboard/AgentOperationsCards";
import PayinListTable from "@/components/dashboard/PayinListTable";
import SummaryTable from "@/components/dashboard/SummaryTable";
import TransactionVolumeChart from "@/components/dashboard/TransactionVolumeChart";

export const metadata: Metadata = {
  title: "Dashboard | Vendor Panel",
};

export default function AgentDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-gray-900 dark:text-white">
        <CompanyDashboardIcon />
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Overview of your payment activity
          </p>
        </div>
      </div>
      <DashboardMetrics />
      <AgentOperationsCards />
      <PayinListTable />
      <SummaryTable />
      <TransactionVolumeChart />
    </div>
  );
}
