"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { InfoSection } from "@/components/InfoSection";

type Biller = { id: string; name: string; category: string };
type BillPayment = {
  id: string;
  billerName: string;
  consumerNumber: string;
  amount: number;
  date: string;
  scheduledFor: string | null;
  autopay: boolean;
};

export default function BillsPage() {
  const [billers, setBillers] = useState<Biller[]>([]);
  const [history, setHistory] = useState<BillPayment[]>([]);
  const [search, setSearch] = useState("");
  const [billerId, setBillerId] = useState("");
  const [consumerNumber, setConsumerNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [autopay, setAutopay] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const res = await fetch("/api/bills");
    const data = await res.json();
    setBillers(data.billers ?? []);
    setHistory(data.billPayments ?? []);
    if (!billerId && data.billers?.[0]) setBillerId(data.billers[0].id);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBillers = useMemo(
    () => billers.filter((b) => (b.name + b.category).toLowerCase().includes(search.toLowerCase())),
    [billers, search]
  );

  function fetchMockOutstanding() {
    const mock = Math.round((200 + Math.random() * 2000) * 100) / 100;
    setAmount(String(mock));
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/bills/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billerId, consumerNumber, amount, scheduledFor: scheduledFor || null, autopay }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Payment failed" });
        return;
      }
      setMessage({
        type: "success",
        text: scheduledFor ? `Payment scheduled for ${scheduledFor}.` : "Bill paid successfully.",
      });
      setConsumerNumber("");
      setAmount("");
      setScheduledFor("");
      refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Bill payments & recharge" backHref="/payments">
      <div className="space-y-4 p-4">
        <input
          placeholder="Search billers (electricity, mobile, FASTag...)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <form onSubmit={handlePay} className="space-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            value={billerId}
            onChange={(e) => setBillerId(e.target.value)}
          >
            {filteredBillers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.category})
              </option>
            ))}
          </select>
          <input
            placeholder="Consumer / mobile number"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            value={consumerNumber}
            onChange={(e) => setConsumerNumber(e.target.value)}
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Amount (₹)"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              type="button"
              onClick={fetchMockOutstanding}
              className="whitespace-nowrap rounded-lg bg-slate-100 px-3 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200"
            >
              Fetch bill
            </button>
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Schedule for later (optional)</label>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input type="checkbox" checked={autopay} onChange={(e) => setAutopay(e.target.checked)} />
            Set up autopay for this biller
          </label>

          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{message.text}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#0b1b33] py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Processing..." : scheduledFor ? "Schedule payment" : "Pay now"}
          </button>
        </form>

        <div>
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">Payment history</p>
          <div className="divide-y divide-slate-200 rounded-xl bg-white shadow-sm dark:divide-slate-700 dark:bg-slate-800">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-slate-900 dark:text-white">{h.billerName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {h.consumerNumber} · {h.scheduledFor ? `Scheduled ${h.scheduledFor}` : h.date}
                    {h.autopay ? " · Autopay" : ""}
                  </p>
                </div>
                <span className="text-sm text-slate-900 dark:text-white">₹{h.amount.toLocaleString("en-IN")}</span>
              </div>
            ))}
            {history.length === 0 && <p className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">No payments yet.</p>}
          </div>
        </div>

        <InfoSection title="Important information">
          <ul className="list-disc space-y-1.5 pl-4">
            <li>Bill payments are routed through the Bharat Bill Payment System (BBPS) framework and are typically confirmed within a few seconds; some billers may take up to 24 hours to update your outstanding balance.</li>
            <li>Convenience fees, if applicable for a specific biller category, are displayed before you confirm payment and are non-refundable once the payment is processed.</li>
            <li>Scheduled and autopay payments are attempted on the due date; if your account balance is insufficient, the payment fails and no retry is made automatically unless autopay with balance-check is enabled.</li>
            <li>For a failed payment where the amount was debited but not reflected with the biller, raise a dispute under Products → Service requests with the transaction reference number — resolution can take up to 7 working days per BBPS guidelines.</li>
            <li>Always verify the consumer/account number with your most recent bill before paying — amounts paid against an incorrect consumer number cannot be reversed or redirected.</li>
          </ul>
        </InfoSection>
      </div>
    </AppShell>
  );
}
