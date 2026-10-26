"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";

const PRODUCTS = [
  { name: "Mutual Funds", blurb: "Market-linked funds across equity, debt, and hybrid categories." },
  { name: "SIP", blurb: "Invest a fixed amount every month into a fund of your choice." },
  { name: "Fixed Income", blurb: "Government and corporate bonds with predictable returns." },
  { name: "PPF", blurb: "Public Provident Fund — long-term, tax-advantaged savings." },
  { name: "NPS", blurb: "National Pension System for retirement planning." },
  { name: "Gold", blurb: "Digital gold and sovereign gold bonds." },
];

export default function InvestmentsPage() {
  const [amount, setAmount] = useState("5000");
  const [years, setYears] = useState("10");
  const [rate, setRate] = useState("12");

  const monthly = Number(amount) || 0;
  const n = (Number(years) || 0) * 12;
  const i = (Number(rate) || 0) / 1200;
  const futureValue = i === 0 ? monthly * n : monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);

  return (
    <AppShell title="Investments" backHref="/products">
      <div className="space-y-4 p-4">
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          Educational demo only — illustrative calculators, no real investment products or purchases.
        </p>

        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">SIP calculator</h2>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-[11px] text-slate-500 dark:text-slate-400">Monthly (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-slate-500 dark:text-slate-400">Years</label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-slate-500 dark:text-slate-400">Return % p.a.</label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-teal-50 p-3 text-sm text-teal-800 dark:bg-teal-900/30 dark:text-teal-200">
            Estimated value: ₹{futureValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div className="space-y-3">
          {PRODUCTS.map((p) => (
            <div key={p.name} className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{p.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{p.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
