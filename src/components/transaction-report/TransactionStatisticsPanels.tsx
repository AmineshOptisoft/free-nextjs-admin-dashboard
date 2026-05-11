import React from "react";

export interface TransactionStatRow {
  label: string;
  value: string;
}

export interface TransactionStatBlock {
  title: string;
  rows: TransactionStatRow[];
}

function StatisticsCard({ block }: { block: TransactionStatBlock }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">{block.title}</h3>
      <div className="mt-3 space-y-2.5">
        {block.rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 text-xs">
            <span className="text-gray-500 dark:text-gray-400">{row.label}</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TransactionStatisticsPanels({ blocks }: { blocks: TransactionStatBlock[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {blocks.map((block) => (
        <StatisticsCard key={block.title} block={block} />
      ))}
    </div>
  );
}
