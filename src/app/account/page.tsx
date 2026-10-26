"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";

type Account = {
  name: string;
  accountNumber: string;
  accountType: string;
  ifsc: string;
  branch: string;
  monthlyIncome: number;
  nomineeName: string;
  balance: number;
};

const inr = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function AccountDetailsPage() {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    fetch("/api/account").then((r) => r.json()).then(setAccount);
  }, []);

  if (!account) {
    return (
      <AppShell title="Account details" backHref="/profile">
        <p className="p-4 text-sm text-slate-500 dark:text-slate-400">Loading...</p>
      </AppShell>
    );
  }

  const rows: [string, string][] = [
    ["Account holder", account.name],
    ["Account number", account.accountNumber],
    ["Account type", account.accountType],
    ["IFSC code", account.ifsc],
    ["Branch", account.branch],
    ["Nominee", account.nomineeName || "Not added"],
    ["Monthly income (declared)", account.monthlyIncome ? `₹${inr(account.monthlyIncome)}` : "Not provided"],
    ["Available balance", `₹${inr(account.balance)}`],
  ];

  return (
    <AppShell title="Account details" backHref="/profile">
      <div className="space-y-4 p-4">
        <div className="divide-y divide-slate-200 rounded-xl bg-white shadow-sm dark:divide-slate-700 dark:bg-slate-800">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-slate-500 dark:text-slate-400">{label}</span>
              <span className="font-medium text-slate-900 dark:text-white">{value}</span>
            </div>
          ))}
        </div>
        <Link
          href="/account/statement"
          className="block rounded-xl bg-[#0b1b33] py-3 text-center text-sm font-medium text-white"
        >
          View statement
        </Link>
      </div>
    </AppShell>
  );
}
