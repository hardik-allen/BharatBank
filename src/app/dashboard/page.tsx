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
  balance: number;
};
type Transaction = { id: string; date: string; description: string; amount: number };
type Notification = { id: string; title: string; body: string; date: string; read: boolean };

const QUICK_ACTIONS = [
  { href: "/payments/transfer", label: "Transfer", icon: "↗" },
  { href: "/payments/upi", label: "Scan & Pay", icon: "▣" },
  { href: "/payments/bills", label: "Bill Pay", icon: "⚡" },
  { href: "/products/cards", label: "Cards", icon: "▭" },
  { href: "/products/fd", label: "Deposits", icon: "₹" },
  { href: "/products/loans", label: "Loans", icon: "🏦" },
  { href: "/products/investments", label: "Investments", icon: "📈" },
  { href: "/products", label: "Offers", icon: "★" },
];

const inr = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()));
    fetch("/api/account").then((r) => r.json()).then(setAccount);
    fetch("/api/transactions").then((r) => r.json()).then((d) => setTransactions(d.transactions?.slice(0, 5) ?? []));
    fetch("/api/notifications").then((r) => r.json()).then((d) => setNotifications(d.notifications ?? []));
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <AppShell>
      <header className="flex items-center justify-between px-4 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b1b33] text-sm font-semibold text-white">
            {account?.name?.[0] ?? "D"}
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{greeting}</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{account?.name ?? "..."}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm dark:bg-slate-800"
          >
            🔔
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl bg-white p-2 shadow-lg dark:bg-slate-800">
              {notifications.length === 0 && (
                <p className="p-3 text-sm text-slate-500 dark:text-slate-400">No notifications.</p>
              )}
              {notifications.map((n) => (
                <div key={n.id} className="rounded-lg p-3 hover:bg-slate-50 dark:hover:bg-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{n.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{n.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="px-4 pt-4">
        {account && (
          <div className="rounded-2xl bg-gradient-to-br from-[#0b1b33] to-[#13294d] p-6 text-white">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-300">{account.accountType} Account</p>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">{account.branch}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {account.accountNumber} · IFSC {account.ifsc}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <p className="text-3xl font-semibold">{showBalance ? `₹${inr(account.balance)}` : "₹ •••••••"}</p>
              <button onClick={() => setShowBalance((v) => !v)} className="text-slate-300">
                {showBalance ? "🙈" : "👁"}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-white p-3 text-center shadow-sm dark:bg-slate-800"
            >
              <span className="text-xl">{action.icon}</span>
              <span className="text-[10px] leading-tight text-slate-600 dark:text-slate-300">{action.label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300">Recent transactions</h2>
          <Link href="/account/statement" className="text-xs text-teal-600 dark:text-teal-400">
            View all
          </Link>
        </div>
        <div className="mt-2 divide-y divide-slate-200 rounded-xl bg-white shadow-sm dark:divide-slate-700 dark:bg-slate-800">
          {transactions.map((t) => (
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
        </div>

        <p className="px-1 pb-4 pt-4 text-center text-[11px] leading-relaxed text-slate-400">
          Savings account interest is calculated on daily closing balance and credited quarterly at the
          prevailing rate (currently 3.00% p.a. up to ₹1 lakh, 3.50% p.a. above ₹1 lakh). Scheme code SA-REG-01.
          For full tariff details, product terms, and the latest schedule of charges, see the relevant product
          page or contact support. BharatBank is a fictional demo app — nothing here is real banking advice.
        </p>
      </div>
    </AppShell>
  );
}
