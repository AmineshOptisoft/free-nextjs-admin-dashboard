import React from "react";

type OpsCard = {
  title: string;
  value: string;
  subText: string;
  icon: React.ReactNode;
};

const cards: OpsCard[] = [
  {
    title: "Security deposit",
    value: "₹1,00,000.00",
    subText: "Held against exposure",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l7 3v5c0 4.2-2.7 7.8-7 10-4.3-2.2-7-5.8-7-10V6l7-3z" />
      </svg>
    ),
  },
  {
    title: "Credit Limit",
    value: "₹0.00",
    subText: "Total PayIn cap",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M7 17h3m10 0h-1M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
      </svg>
    ),
  },
  {
    title: "Previous balance",
    value: "₹0.00",
    subText: "Last running balance",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l-3 3m9-3a9 9 0 10-9 9" />
      </svg>
    ),
  },
  {
    title: "Net",
    value: "₹-23.00",
    subText: "Available amount",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 17h10M7 12h10M5 4v16M19 4v16" />
      </svg>
    ),
  },
  {
    title: "Running balance",
    value: "₹-23.00",
    subText: "Running balance",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 15l4-4 4 4 8-8" />
      </svg>
    ),
  },
  {
    title: "Settlement",
    value: "₹0.00",
    subText: "Settlement amount (ledger)",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M6 11h12M8 15h8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Commission rates",
    value: "2% / 0%",
    subText: "PayIn % - PayOut %",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 5L5 19M7 7h.01M17 17h.01M9.5 7a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm10 10a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
  {
    title: "Total PayIn Operations",
    value: "7",
    subText: "Operations ( Today )",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Total PayOut Operations",
    value: "0",
    subText: "Operations ( Today )",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Total PayIn",
    value: "₹0.00",
    subText: "Total Amount (today)",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M6 11h12M8 15h8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Total PayOut",
    value: "₹0.00",
    subText: "Total Amount (today)",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M6 11h12M8 15h8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Active Payment Methods",
    value: "2",
    subText: "Active ( Today )",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4H2v16h5M12 12a4 4 0 110-8 4 4 0 010 8zm0 0c-3.314 0-6 2.239-6 5v3h12v-3c0-2.761-2.686-5-6-5z" />
      </svg>
    ),
  },
  {
    title: "PayIn Accounts",
    value: "1",
    subText: "Active: 1 · Inactive: 0 · Pay-In off: 1 · Running -₹23.00",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4H2v16h5M12 12a4 4 0 110-8 4 4 0 010 8zm0 0c-3.314 0-6 2.239-6 5v3h12v-3c0-2.761-2.686-5-6-5z" />
      </svg>
    ),
  },
  {
    title: "PayOut Accounts",
    value: "1",
    subText: "Active: 1 · Inactive: 0 · Pay-Out off: 1 · Running -₹23.00",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4H2v16h5M12 12a4 4 0 110-8 4 4 0 010 8zm0 0c-3.314 0-6 2.239-6 5v3h12v-3c0-2.761-2.686-5-6-5z" />
      </svg>
    ),
  },
  {
    title: "Success Rate",
    value: "0%",
    subText: "Success Rate ( Today )",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

function OpsMetricCard({ title, value, subText, icon }: OpsCard) {
  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-white/3">
      <span className="absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white shadow-theme-sm">
        {icon}
      </span>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</p>
      <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{subText}</p>
    </div>
  );
}

export default function AgentOperationsCards() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <OpsMetricCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}
