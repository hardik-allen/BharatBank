"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { useStepUp } from "@/components/StepUp";
import { InfoSection } from "@/components/InfoSection";
import { Accordion } from "@/components/Accordion";

const RATE_SLABS = [
  { tenure: "7 days – 45 days", general: "3.00%", senior: "3.50%" },
  { tenure: "46 days – 179 days", general: "4.50%", senior: "5.00%" },
  { tenure: "180 days – 269 days", general: "5.75%", senior: "6.25%" },
  { tenure: "270 days – < 1 year", general: "6.00%", senior: "6.50%" },
  { tenure: "1 year – < 2 years", general: "7.10%", senior: "7.60%" },
  { tenure: "2 years – < 3 years", general: "7.00%", senior: "7.50%" },
  { tenure: "3 years – 5 years", general: "6.75%", senior: "7.25%" },
  { tenure: "Above 5 years – 10 years", general: "6.50%", senior: "7.00%" },
];

const FD_FAQ = [
  {
    q: "What happens if I withdraw my FD before maturity?",
    a: "Premature withdrawal attracts a penalty of 1% on the applicable rate for the period the deposit has run, subject to a minimum holding period of 7 days. No interest is payable if the deposit is closed within 7 days of booking.",
  },
  {
    q: "Is TDS deducted on FD interest?",
    a: "Yes. Tax is deducted at source if the aggregate interest earned across all your deposits with BharatBank exceeds ₹40,000 in a financial year (₹50,000 for senior citizens), as per the Income Tax Act, 1961. Submit Form 15G/15H if you are eligible for exemption.",
  },
  {
    q: "Can I take a loan against my FD?",
    a: "Yes, an overdraft/loan of up to 90% of the deposit value is available at a rate typically 1–2% above your FD rate. Apply under Products → Loans → Loan against FD.",
  },
  {
    q: "How is the maturity amount calculated?",
    a: "Interest is compounded quarterly on the principal amount for the chosen tenure, using the rate applicable on the date of deposit. The rate is fixed for the full tenure and does not change with future rate revisions.",
  },
  {
    q: "What is the minimum and maximum deposit amount?",
    a: "The minimum deposit amount is ₹1,000 with no maximum limit, subject to source-of-funds declarations for deposits above ₹10,00,000 as per KYC norms.",
  },
];

type FixedDeposit = {
  id: string;
  principal: number;
  annualRate: number;
  tenureMonths: number;
  startDate: string;
  maturityDate: string;
  maturityAmount: number;
  payoutFrequency: string;
  nomineeName: string;
  status: "active" | "closed";
};

const inr = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function downloadReceipt(fd: FixedDeposit) {
  const text = `BharatBank — Fixed Deposit Receipt (demo)
FD ID: ${fd.id}
Principal: Rs. ${inr(fd.principal)}
Rate: ${fd.annualRate}% p.a.
Tenure: ${fd.tenureMonths} months
Start date: ${fd.startDate}
Maturity date: ${fd.maturityDate}
Maturity amount: Rs. ${inr(fd.maturityAmount)}
Payout frequency: ${fd.payoutFrequency}
Nominee: ${fd.nomineeName || "Not set"}
Status: ${fd.status}

This is a fictional demo receipt. BharatBank is not a real bank.`;
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fd-receipt-${fd.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function FixedDepositsPage() {
  const { requestStepUp, modal } = useStepUp();
  const [fds, setFds] = useState<FixedDeposit[]>([]);
  const [rate, setRate] = useState(0);
  const [principal, setPrincipal] = useState("10000");
  const [tenureMonths, setTenureMonths] = useState("12");
  const [payoutFrequency, setPayoutFrequency] = useState("At maturity");
  const [nomineeName, setNomineeName] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    const res = await fetch("/api/fd");
    const data = await res.json();
    setFds(data.fixedDeposits ?? []);
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
      const res = await fetch("/api/fd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ principal: Number(principal), tenureMonths: Number(tenureMonths), payoutFrequency, nomineeName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Could not open FD" });
        return;
      }
      setMessage({ type: "success", text: "Fixed Deposit opened successfully." });
      setShowForm(false);
      refresh();
    } finally {
      setLoading(false);
    }
  }

  function handleClose(id: string) {
    requestStepUp(async () => {
      setMessage(null);
      const res = await fetch(`/api/fd/${id}/close`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Could not close FD" });
        return;
      }
      setMessage({ type: "success", text: `Closed — ₹${inr(data.payout)} credited to your account.` });
      refresh();
    });
  }

  return (
    <AppShell title="Fixed Deposits" backHref="/products">
      <div className="space-y-4 p-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">Current rate: {rate}% p.a. (quarterly compounding)</p>

        <InfoSection title="Interest rate chart (effective w.e.f. 01-Oct-2026)">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-700">
                  <th className="py-1.5 pr-2">Tenure</th>
                  <th className="py-1.5 pr-2">General public</th>
                  <th className="py-1.5">Senior citizen</th>
                </tr>
              </thead>
              <tbody>
                {RATE_SLABS.map((row) => (
                  <tr key={row.tenure} className="border-b border-slate-100 last:border-0 dark:border-slate-700/50">
                    <td className="py-1.5 pr-2">{row.tenure}</td>
                    <td className="py-1.5 pr-2 font-medium text-slate-900 dark:text-white">{row.general}</td>
                    <td className="py-1.5 font-medium text-slate-900 dark:text-white">{row.senior}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Senior citizen rates apply to resident individuals aged 60 years and above on deposits up to ₹3 crore.
            Rates are subject to revision and the rate prevailing on the date of deposit booking applies for the
            entire tenure. Additional 0.10% available under staff/ex-staff schemes where applicable. Interest
            rates for NRE/NRO fixed deposits may differ — see the NRI section for details.
          </p>
        </InfoSection>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="w-full rounded-xl bg-[#0b1b33] py-3 text-sm font-medium text-white"
        >
          {showForm ? "Cancel" : "+ Open new FD"}
        </button>

        {showForm && (
          <form onSubmit={handleCreate} className="space-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
            <div>
              <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Amount (₹)</label>
              <input
                type="number"
                min="1000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Tenure (months)</label>
              <input
                type="number"
                min="3"
                max="120"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Interest payout</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                value={payoutFrequency}
                onChange={(e) => setPayoutFrequency(e.target.value)}
              >
                <option>At maturity</option>
                <option>Monthly</option>
                <option>Quarterly</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Nominee name (optional)</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                value={nomineeName}
                onChange={(e) => setNomineeName(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#0b1b33] py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Opening..." : "Open FD"}
            </button>
          </form>
        )}

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{message.text}</p>
        )}

        <div className="space-y-3">
          {fds.map((fd) => (
            <div key={fd.id} className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900 dark:text-white">₹{inr(fd.principal)}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    fd.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {fd.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {fd.annualRate}% · {fd.tenureMonths} months · matures {fd.maturityDate}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Maturity value: ₹{inr(fd.maturityAmount)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Payout: {fd.payoutFrequency} · Nominee: {fd.nomineeName || "Not set"}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => downloadReceipt(fd)}
                  className="flex-1 rounded-lg border border-slate-300 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  Download receipt
                </button>
                {fd.status === "active" && (
                  <button
                    onClick={() => handleClose(fd.id)}
                    className="flex-1 rounded-lg border border-red-200 py-1.5 text-xs font-medium text-red-600"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ))}
          {fds.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No fixed deposits yet.</p>}
        </div>

        <InfoSection title="Terms &amp; conditions">
          <ul className="list-disc space-y-1.5 pl-4">
            <li>Minimum deposit amount is ₹1,000; deposits can be made in multiples of ₹1.</li>
            <li>The interest rate applicable is the rate prevailing on the date of deposit and remains fixed for the tenure booked, regardless of subsequent rate revisions.</li>
            <li>Premature withdrawal is permitted subject to a penalty of 1% on the rate applicable for the period run, with a minimum lock-in of 7 days from the date of booking.</li>
            <li>Auto-renewal, if opted, renews the deposit for the same tenure at the rate prevailing on the maturity date.</li>
            <li>Nomination is strongly recommended under Section 45ZA of the Banking Regulation Act, 1949.</li>
            <li>TDS is deducted as per the Income Tax Act, 1961, where applicable; Form 15G/15H can be submitted for exemption where eligible.</li>
            <li>Deposits are covered by DICGC insurance only up to the limits prescribed by applicable regulation — this is a demo app and carries no such real insurance.</li>
            <li>BharatBank reserves the right to amend these terms at its discretion; the version in force on the date of booking governs the deposit.</li>
          </ul>
        </InfoSection>

        <div>
          <h3 className="mb-2 px-1 text-sm font-semibold text-slate-900 dark:text-white">Frequently asked questions</h3>
          <Accordion items={FD_FAQ} />
        </div>
      </div>
      {modal}
    </AppShell>
  );
}
