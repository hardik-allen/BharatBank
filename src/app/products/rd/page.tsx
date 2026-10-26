"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { useStepUp } from "@/components/StepUp";
import { InfoSection } from "@/components/InfoSection";
import { Accordion } from "@/components/Accordion";

const RD_FAQ = [
  {
    q: "What happens if I miss an installment?",
    a: "A missed installment attracts a penalty of ₹1.50 per ₹100 per month on the defaulted amount, in line with the applicable FD rate for the period. Three consecutive missed installments may lead to automatic closure of the RD, subject to the minimum lock-in period.",
  },
  {
    q: "Can I change my monthly installment amount?",
    a: "No. The installment amount is fixed at the time of opening the RD and cannot be changed mid-tenure. To save a different amount, open a new Recurring Deposit.",
  },
  {
    q: "When is interest credited?",
    a: "Interest is compounded quarterly and credited to the RD on maturity along with the principal. No periodic interest payout is available for Recurring Deposits (unlike Fixed Deposits).",
  },
  {
    q: "Can I close my RD before maturity?",
    a: "Yes, subject to a minimum lock-in of 30 days from the first installment. Premature closure forfeits 1% of the applicable interest rate and may attract additional charges as per the schedule of charges.",
  },
];

type RecurringDeposit = {
  id: string;
  monthlyInstallment: number;
  annualRate: number;
  tenureMonths: number;
  startDate: string;
  maturityDate: string;
  maturityAmount: number;
  installmentsPaid: number;
  missedInstallments: number;
  status: "active" | "closed";
};

const inr = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function RecurringDepositsPage() {
  const { requestStepUp, modal } = useStepUp();
  const [rds, setRds] = useState<RecurringDeposit[]>([]);
  const [rate, setRate] = useState(0);
  const [monthlyInstallment, setMonthlyInstallment] = useState("1000");
  const [tenureMonths, setTenureMonths] = useState("12");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    const res = await fetch("/api/rd");
    const data = await res.json();
    setRds(data.recurringDeposits ?? []);
    setRate(data.rate ?? 0);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/rd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyInstallment: Number(monthlyInstallment), tenureMonths: Number(tenureMonths) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Could not open RD" });
        return;
      }
      setMessage({ type: "success", text: "Recurring Deposit opened successfully." });
      setShowForm(false);
      refresh();
    } finally {
      setLoading(false);
    }
  }

  function handleClose(id: string) {
    requestStepUp(async () => {
      setMessage(null);
      const res = await fetch(`/api/rd/${id}/close`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Could not close RD" });
        return;
      }
      setMessage({ type: "success", text: `Closed — ₹${inr(data.payout)} credited to your account.` });
      refresh();
    });
  }

  async function handleMiss(id: string) {
    await fetch(`/api/rd/${id}/miss`, { method: "POST" });
    refresh();
  }

  return (
    <AppShell title="Recurring Deposits" backHref="/products">
      <div className="space-y-4 p-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">Current rate: {rate}% p.a. (quarterly compounding)</p>

        <InfoSection title="How your RD grows">
          <p>
            Recurring Deposits compound quarterly on the running balance of installments paid. A longer tenure
            earns a higher effective yield due to compounding, even at the same nominal rate. For example, a
            ₹5,000/month RD over 12 months at {rate}% matures to a different amount than the same installment
            run over 24 months — use the calculator above to compare tenures before committing.
          </p>
          <p className="mt-2">
            Penal provisions, minimum lock-in, and closure rules are listed under Terms &amp; conditions and
            the FAQ below — read these carefully before setting up auto-debit for your installments.
          </p>
        </InfoSection>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="w-full rounded-xl bg-[#0b1b33] py-3 text-sm font-medium text-white"
        >
          {showForm ? "Cancel" : "+ Open new RD"}
        </button>

        {showForm && (
          <form onSubmit={handleCreate} className="space-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
            <div>
              <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Monthly installment (₹)</label>
              <input
                type="number"
                min="500"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                value={monthlyInstallment}
                onChange={(e) => setMonthlyInstallment(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Tenure (months)</label>
              <input
                type="number"
                min="6"
                max="120"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#0b1b33] py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Opening..." : "Open RD"}
            </button>
          </form>
        )}

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{message.text}</p>
        )}

        <div className="space-y-3">
          {rds.map((rd) => (
            <div key={rd.id} className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900 dark:text-white">₹{inr(rd.monthlyInstallment)}/mo</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    rd.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {rd.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {rd.annualRate}% · {rd.tenureMonths} months · {rd.installmentsPaid} paid
                {rd.missedInstallments > 0 ? ` · ${rd.missedInstallments} missed` : ""} · matures {rd.maturityDate}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Projected maturity: ₹{inr(rd.maturityAmount)}</p>
              {rd.status === "active" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleMiss(rd.id)}
                    className="flex-1 rounded-lg border border-amber-200 py-1.5 text-xs font-medium text-amber-700"
                  >
                    Simulate missed installment
                  </button>
                  <button
                    onClick={() => handleClose(rd.id)}
                    className="flex-1 rounded-lg border border-red-200 py-1.5 text-xs font-medium text-red-600"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          ))}
          {rds.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No recurring deposits yet.</p>}
        </div>

        <InfoSection title="Terms &amp; conditions">
          <ul className="list-disc space-y-1.5 pl-4">
            <li>Minimum monthly installment is ₹500; installments must be paid by the corresponding date each month via auto-debit from your linked account.</li>
            <li>A missed installment attracts a penalty as per the schedule of charges; the RD may be closed automatically after 3 consecutive defaults, subject to minimum lock-in.</li>
            <li>Premature closure is permitted after 30 days from the first installment, subject to a 1% interest penalty.</li>
            <li>The applicable interest rate is fixed at the time of opening and does not change for the tenure booked.</li>
            <li>Nomination is strongly recommended under Section 45ZA of the Banking Regulation Act, 1949.</li>
            <li>TDS is deducted on interest as per the Income Tax Act, 1961, where the aggregate interest across deposits exceeds the prescribed threshold.</li>
          </ul>
        </InfoSection>

        <div>
          <h3 className="mb-2 px-1 text-sm font-semibold text-slate-900 dark:text-white">Frequently asked questions</h3>
          <Accordion items={RD_FAQ} />
        </div>
      </div>
      {modal}
    </AppShell>
  );
}
