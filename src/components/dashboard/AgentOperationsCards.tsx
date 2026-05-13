"use client";

import React, { useEffect, useMemo, useState } from "react";

type OpsCard = {
  title: string;
  value: string;
  subText: string;
  icon: React.ReactNode;
};

const FALLBACK = {
  security_deposit: 0,
  credit_limit: 0,
  previous_balance: 0,
  running_balance: 0,
  settlement_amount: 0,
  payin_commission: 0,
  payout_commission: 0,
  today_payin_ops: 0,
  today_payout_ops: 0,
  today_payin_amount: 0,
  today_payout_amount: 0,
  active_methods: 0,
  payin_enabled_methods: 0,
  payout_enabled_methods: 0,
};

function money(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pct(n: number) {
  return `${n}%`;
}

function buildCards(data: typeof FALLBACK): OpsCard[] {
  return [
    {
      title: "Security deposit",
      value: money(data.security_deposit),
      subText: "Held against exposure",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l7 3v5c0 4.2-2.7 7.8-7 10-4.3-2.2-7-5.8-7-10V6l7-3z" />
      </svg>
    ),
  },
    {
      title: "Credit Limit",
      value: money(data.credit_limit),
      subText: "Total PayIn cap",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M7 17h3m10 0h-1M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
      </svg>
    ),
  },
    {
      title: "Previous balance",
      value: money(data.previous_balance),
      subText: "Last running balance",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l-3 3m9-3a9 9 0 10-9 9" />
      </svg>
    ),
  },
    {
      title: "Net",
      value: money(data.running_balance),
      subText: "Available amount",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 17h10M7 12h10M5 4v16M19 4v16" />
      </svg>
    ),
  },
    {
      title: "Running balance",
      value: money(data.running_balance),
      subText: "Running balance",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 15l4-4 4 4 8-8" />
      </svg>
    ),
  },
    {
      title: "Settlement",
      value: money(data.settlement_amount),
      subText: "Settlement amount (ledger)",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M6 11h12M8 15h8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
    {
      title: "Commission rates",
      value: `${pct(data.payin_commission)} / ${pct(data.payout_commission)}`,
      subText: "PayIn % - PayOut %",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 5L5 19M7 7h.01M17 17h.01M9.5 7a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm10 10a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
    {
      title: "Total PayIn Operations",
      value: String(data.today_payin_ops),
      subText: "Operations ( Today )",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
    {
      title: "Total PayOut Operations",
      value: String(data.today_payout_ops),
      subText: "Operations ( Today )",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
    {
      title: "Total PayIn",
      value: money(data.today_payin_amount),
      subText: "Total Amount (today)",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M6 11h12M8 15h8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
    {
      title: "Total PayOut",
      value: money(data.today_payout_amount),
      subText: "Total Amount (today)",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M6 11h12M8 15h8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
    {
      title: "Active Payment Methods",
      value: String(data.active_methods),
      subText: "Active ( Today )",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4H2v16h5M12 12a4 4 0 110-8 4 4 0 010 8zm0 0c-3.314 0-6 2.239-6 5v3h12v-3c0-2.761-2.686-5-6-5z" />
      </svg>
    ),
  },
    {
      title: "PayIn Accounts",
      value: String(data.payin_enabled_methods),
      subText: `Enabled now: ${data.payin_enabled_methods}`,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4H2v16h5M12 12a4 4 0 110-8 4 4 0 010 8zm0 0c-3.314 0-6 2.239-6 5v3h12v-3c0-2.761-2.686-5-6-5z" />
      </svg>
    ),
  },
    {
      title: "PayOut Accounts",
      value: String(data.payout_enabled_methods),
      subText: `Enabled now: ${data.payout_enabled_methods}`,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4H2v16h5M12 12a4 4 0 110-8 4 4 0 010 8zm0 0c-3.314 0-6 2.239-6 5v3h12v-3c0-2.761-2.686-5-6-5z" />
      </svg>
    ),
  },
    {
      title: "Success Rate",
      value: "—",
      subText: "Live on metrics section",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    },
  ];
}

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
  const [ops, setOps] = useState<typeof FALLBACK>(FALLBACK);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/agent/dashboard", { credentials: "include" });
        const json = (await res.json()) as { ok?: boolean; operations?: Partial<typeof FALLBACK> };
        if (!mounted || !res.ok || !json.ok || !json.operations) return;
        setOps((prev) => ({ ...prev, ...json.operations }));
      } catch {
        // keep fallback
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const cards = useMemo(() => buildCards(ops), [ops]);

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
