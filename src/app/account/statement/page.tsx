"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";

type Transaction = { id: string; date: string; description: string; amount: number };

export default function StatementPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState<"all" | "credit" | "debit">("all");

  useEffect(() => {
    fetch("/api/transactions").then((r) => r.json()).then((d) => setTransactions(d.transactions ?? []));
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (from && t.date < from) return false;
      if (to && t.date > to) return false;
      if (type === "credit" && t.amount < 0) return false;
      if (type === "debit" && t.amount >= 0) return false;
      return true;
    });
  }, [transactions, from, to, type]);

  function downloadCsv() {
    const header = "Date,Description,Amount\n";
    const rows = filtered.map((t) => `${t.date},"${t.description.replace(/"/g, '""')}",${t.amount}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bharatbank-statement.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell title="Statement" backHref="/account">
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
          <div>
            <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div className="col-span-2 flex gap-2">
            {(["all", "credit", "debit"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium capitalize ${
                  type === t ? "bg-[#0b1b33] text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={downloadCsv}
          className="w-full rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
        >
          Download statement (CSV)
        </button>

        <div className="divide-y divide-slate-200 rounded-xl bg-white shadow-sm dark:divide-slate-700 dark:bg-slate-800">
          {filtered.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-slate-900 dark:text-white">{t.description}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.date}</p>
              </div>
              <span className={t.amount >= 0 ? "text-emerald-600" : "text-slate-900 dark:text-slate-200"}>
                {t.amount >= 0 ? "+" : ""}
                {t.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
          {filtered.length === 0 && <p className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">No transactions match these filters.</p>}
        </div>
      </div>
    </AppShell>
  );
}
