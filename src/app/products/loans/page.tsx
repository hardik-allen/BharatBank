"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { useStepUp } from "@/components/StepUp";
import { InfoSection } from "@/components/InfoSection";
import { Accordion } from "@/components/Accordion";

const FEES_SCHEDULE = [
  { label: "Processing fee", value: "1.5% of loan amount + GST (min ₹999, max ₹15,000)" },
  { label: "Documentation charges", value: "₹500 + GST (one-time, at disbursal)" },
  { label: "Prepayment charges (floating rate)", value: "Nil, if paid from own sources" },
  { label: "Prepayment charges (fixed rate)", value: "2% of outstanding principal" },
  { label: "Late payment / penal charges", value: "2% per month on overdue EMI amount" },
  { label: "Cheque/ECS/NACH bounce charges", value: "₹500 per instance + GST" },
  { label: "Loan cancellation (before disbursal)", value: "Nil, within 3 days of sanction" },
  { label: "Duplicate statement/NOC", value: "₹200 per document" },
];

const DOCUMENTS_REQUIRED = [
  "PAN card and Aadhaar (or other OVD) — synthetic test values only in this demo",
  "Latest 3 months' salary slips or 2 years' ITR for self-employed applicants",
  "Bank statements for the last 6 months",
  "Employment/business continuity proof",
  "Passport-size photograph",
  "Property documents (home loan), vehicle quotation (car loan), or admission letter (education loan), as applicable",
];

const LOAN_FAQ = [
  {
    q: "How is my loan eligibility decided?",
    a: "Eligibility is primarily based on the EMI-to-income ratio — your proposed EMI generally should not exceed 50% of your declared monthly income, along with existing obligations, credit history, and the loan product's own criteria. This demo app applies a simplified version of this rule.",
  },
  {
    q: "Can I prepay or foreclose my loan?",
    a: "Yes. Floating-rate loans (most personal, home, and gold loans) can be prepaid without charges from your own funds. Fixed-rate loans may attract a foreclosure charge of up to 2% of the outstanding principal, as shown in the fee schedule above.",
  },
  {
    q: "What if I miss an EMI payment?",
    a: "A missed EMI attracts penal interest (typically 2% per month on the overdue amount) in addition to cheque/mandate bounce charges, and is reported to credit bureaus after the applicable grace period, which can affect your credit score.",
  },
  {
    q: "How long does loan disbursal take?",
    a: "For pre-approved and eligible applicants, disbursal in this demo is instant. In a real lending workflow this would typically take 1–7 working days depending on document verification, valuation (for secured loans), and internal credit checks.",
  },
  {
    q: "Is the interest rate fixed or floating?",
    a: "Rates shown here are illustrative annual percentage rates (APR). Personal, education, and gold loans are typically offered at fixed rates; home and car loans may be offered at either fixed or floating (repo-linked) rates depending on the scheme chosen.",
  },
];

type Loan = {
  id: string;
  productName: string;
  principal: number;
  outstanding: number;
  emi: number;
  annualRate: number;
  tenureMonths: number;
  nextDueDate: string;
  status: "active" | "closed";
};
type LoanApplication = {
  id: string;
  productName: string;
  amount: number;
  tenureMonths: number;
  emi: number;
  status: "submitted" | "approved" | "rejected";
  appliedAt: string;
};
type LoanProduct = { id: string; name: string; category: string; annualRate: number; maxTenureMonths: number; maxAmount: number };

const inr = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function calcEmiClient(principal: number, annualRate: number, tenureMonths: number) {
  const r = annualRate / 1200;
  if (r === 0) return principal / tenureMonths;
  const f = Math.pow(1 + r, tenureMonths);
  return (principal * r * f) / (f - 1);
}

export default function LoansPage() {
  const { requestStepUp, modal } = useStepUp();
  const [view, setView] = useState<"loans" | "apply">("loans");
  const [loans, setLoans] = useState<Loan[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [scheduleLoanId, setScheduleLoanId] = useState<string | null>(null);
  const [prepayAmounts, setPrepayAmounts] = useState<Record<string, string>>({});

  const [productId, setProductId] = useState("");
  const [amount, setAmount] = useState("200000");
  const [tenureMonths, setTenureMonths] = useState("24");

  async function refresh() {
    const res = await fetch("/api/loans");
    const data = await res.json();
    setLoans(data.loans ?? []);
    setApplications(data.loanApplications ?? []);
    setProducts(data.loanProducts ?? []);
    if (!productId && data.loanProducts?.[0]) setProductId(data.loanProducts[0].id);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedProduct = products.find((p) => p.id === productId);
  const estimatedEmi = useMemo(() => {
    if (!selectedProduct || !Number(amount) || !Number(tenureMonths)) return 0;
    return calcEmiClient(Number(amount), selectedProduct.annualRate, Number(tenureMonths));
  }, [selectedProduct, amount, tenureMonths]);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/loans/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, amount, tenureMonths }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "Application failed" });
      return;
    }
    setMessage({
      type: data.eligible ? "success" : "error",
      text: data.eligible
        ? `Approved! EMI ≈ ₹${inr(data.emi)}/month.`
        : "Not eligible based on declared income for this amount/tenure.",
    });
    setView("loans");
    refresh();
  }

  function handlePayEmi(id: string) {
    requestStepUp(async () => {
      const res = await fetch(`/api/loans/${id}/pay-emi`, { method: "POST" });
      const data = await res.json();
      setMessage({ type: res.ok ? "success" : "error", text: res.ok ? "EMI paid." : data.error });
      refresh();
    });
  }

  function handlePrepay(id: string) {
    const value = prepayAmounts[id];
    if (!value) return;
    requestStepUp(async () => {
      const res = await fetch(`/api/loans/${id}/prepay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value }),
      });
      const data = await res.json();
      setMessage({ type: res.ok ? "success" : "error", text: res.ok ? "Prepayment applied." : data.error });
      refresh();
    });
  }

  function schedule(loan: Loan) {
    const rows = [];
    let balance = loan.outstanding;
    const monthlyRate = loan.annualRate / 1200;
    for (let i = 1; i <= Math.min(6, loan.tenureMonths); i++) {
      const interest = balance * monthlyRate;
      const principalPart = Math.min(loan.emi - interest, balance);
      balance = Math.max(0, balance - principalPart);
      rows.push({ month: i, principalPart, interest, balance });
    }
    return rows;
  }

  return (
    <AppShell title="Loans" backHref="/products">
      <div className="p-4">
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setView("loans")}
            className={`flex-1 rounded-lg py-2 text-xs font-medium ${view === "loans" ? "bg-[#0b1b33] text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}
          >
            My loans
          </button>
          <button
            onClick={() => setView("apply")}
            className={`flex-1 rounded-lg py-2 text-xs font-medium ${view === "apply" ? "bg-[#0b1b33] text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}
          >
            Apply for a loan
          </button>
        </div>

        {message && (
          <p className={`mb-3 text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{message.text}</p>
        )}

        {view === "apply" && (
          <form onSubmit={handleApply} className="space-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.annualRate}% p.a.)
                </option>
              ))}
            </select>
            <div>
              <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                Amount (₹) — max ₹{selectedProduct?.maxAmount.toLocaleString("en-IN") ?? "—"}
              </label>
              <input
                type="number"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">
                Tenure (months) — max {selectedProduct?.maxTenureMonths}
              </label>
              <input
                type="number"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(e.target.value)}
              />
            </div>
            <div className="rounded-lg bg-teal-50 p-3 text-sm text-teal-800 dark:bg-teal-900/30 dark:text-teal-200">
              Estimated EMI: ₹{inr(estimatedEmi)}/month
            </div>
            <button type="submit" className="w-full rounded-lg bg-[#0b1b33] py-2 text-sm font-medium text-white">
              Check eligibility & apply
            </button>

            {applications.length > 0 && (
              <div className="pt-2">
                <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">Application history</p>
                {applications.map((a) => (
                  <div key={a.id} className="flex justify-between py-1 text-xs">
                    <span className="text-slate-700 dark:text-slate-300">
                      {a.productName} · ₹{inr(a.amount)}
                    </span>
                    <span
                      className={
                        a.status === "approved" ? "text-emerald-600" : a.status === "rejected" ? "text-red-600" : "text-amber-600"
                      }
                    >
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </form>
        )}

        {view === "apply" && (
          <div className="mt-4 space-y-4">
            <InfoSection title="Fees &amp; charges schedule">
              <ul className="space-y-1.5">
                {FEES_SCHEDULE.map((f) => (
                  <li key={f.label} className="flex justify-between gap-3">
                    <span>{f.label}</span>
                    <span className="flex-shrink-0 text-right font-medium text-slate-900 dark:text-white">{f.value}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-slate-400">
                All charges are exclusive of applicable GST unless stated otherwise. Charges are indicative and
                subject to revision; the schedule in force on the date of application applies.
              </p>
            </InfoSection>

            <InfoSection title="Documents required">
              <ul className="list-disc space-y-1.5 pl-4">
                {DOCUMENTS_REQUIRED.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </InfoSection>

            <div>
              <h3 className="mb-2 px-1 text-sm font-semibold text-slate-900 dark:text-white">Frequently asked questions</h3>
              <Accordion items={LOAN_FAQ} />
            </div>
          </div>
        )}

        {view === "loans" && (
          <div className="space-y-3">
            {loans.map((loan) => (
              <div key={loan.id} className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{loan.productName}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      loan.status === "active" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {loan.status === "active" ? "Active" : "Closed"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Principal ₹{inr(loan.principal)} · {loan.annualRate}% · {loan.tenureMonths} months
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Next due: {loan.nextDueDate}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Outstanding</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">₹{inr(loan.outstanding)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400">EMI</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">₹{inr(loan.emi)}</p>
                  </div>
                </div>

                {loan.status === "active" && (
                  <>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handlePayEmi(loan.id)}
                        className="flex-1 rounded-lg bg-[#0b1b33] py-2 text-xs font-medium text-white"
                      >
                        Pay EMI
                      </button>
                      <button
                        onClick={() => setScheduleLoanId(scheduleLoanId === loan.id ? null : loan.id)}
                        className="flex-1 rounded-lg border border-slate-300 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                      >
                        Schedule
                      </button>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="number"
                        placeholder="Prepay amount"
                        value={prepayAmounts[loan.id] ?? ""}
                        onChange={(e) => setPrepayAmounts((d) => ({ ...d, [loan.id]: e.target.value }))}
                        className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                      <button
                        onClick={() => handlePrepay(loan.id)}
                        className="rounded-lg border border-slate-300 px-3 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                      >
                        Prepay / foreclose
                      </button>
                    </div>
                  </>
                )}

                {scheduleLoanId === loan.id && (
                  <table className="mt-3 w-full text-xs">
                    <thead>
                      <tr className="text-left text-slate-500 dark:text-slate-400">
                        <th className="pb-1">Month</th>
                        <th className="pb-1">Principal</th>
                        <th className="pb-1">Interest</th>
                        <th className="pb-1">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule(loan).map((row) => (
                        <tr key={row.month} className="text-slate-700 dark:text-slate-300">
                          <td>{row.month}</td>
                          <td>₹{inr(row.principalPart)}</td>
                          <td>₹{inr(row.interest)}</td>
                          <td>₹{inr(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
            {loans.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No active loans. Apply for one above.</p>}
          </div>
        )}
      </div>
      {modal}
    </AppShell>
  );
}
