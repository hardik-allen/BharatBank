"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { useStepUp } from "@/components/StepUp";
import { InfoSection } from "@/components/InfoSection";

const CHARGES_TABLE = [
  { method: "UPI", slab: "Any amount", charge: "Free", timing: "24x7, instant" },
  { method: "IMPS", slab: "Up to ₹1,000", charge: "₹2.50", timing: "24x7, instant" },
  { method: "IMPS", slab: "₹1,000 – ₹1,00,000", charge: "₹5", timing: "24x7, instant" },
  { method: "IMPS", slab: "₹1,00,000 – ₹5,00,000", charge: "₹15", timing: "24x7, instant" },
  { method: "NEFT", slab: "Up to ₹10,000", charge: "₹2.50", timing: "Batches, settles within 2 hours" },
  { method: "NEFT", slab: "₹10,000 – ₹1,00,000", charge: "₹5", timing: "Batches, settles within 2 hours" },
  { method: "NEFT", slab: "Above ₹1,00,000", charge: "₹15", timing: "Batches, settles within 2 hours" },
  { method: "RTGS", slab: "₹2,00,000 and above only", charge: "₹25", timing: "24x7, settles within 30 minutes" },
];

type Beneficiary = { id: string; name: string; nickname: string; bank: string; status: "pending" | "active" };
type Receipt = { id: string; method: string; payee: string; amount: number; fee: number; eta: string; date: string };

const METHODS = ["UPI", "IMPS", "NEFT", "RTGS"] as const;

export default function TransferPage() {
  const { requestStepUp, modal } = useStepUp();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [method, setMethod] = useState<(typeof METHODS)[number]>("UPI");
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [step, setStep] = useState<"form" | "review">("form");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    fetch("/api/beneficiaries")
      .then((r) => r.json())
      .then((d) => {
        setBeneficiaries(d.beneficiaries ?? []);
        setBeneficiaryId(d.beneficiaries?.[0]?.id ?? "");
      });
  }, []);

  const selected = beneficiaries.find((b) => b.id === beneficiaryId);

  function goToReview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!beneficiaryId) {
      setError("Select a beneficiary");
      return;
    }
    if (!Number(amount) || Number(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }
    setStep("review");
  }

  function submitTransfer() {
    requestStepUp(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ beneficiaryId, amount, method, remarks }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Transfer failed");
          setStep("form");
          return;
        }
        setReceipt(data.receipt);
      } finally {
        setLoading(false);
      }
    });
  }

  if (receipt) {
    return (
      <AppShell title="Transfer" backHref="/payments">
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
            ✓
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Transfer successful</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ₹{receipt.amount.toLocaleString("en-IN")} sent to {receipt.payee} via {receipt.method}
          </p>
          <div className="mt-2 w-full space-y-2 rounded-xl bg-white p-4 text-left text-sm shadow-sm dark:bg-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Reference</span>
              <span className="text-slate-900 dark:text-white">{receipt.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Fee</span>
              <span className="text-slate-900 dark:text-white">₹{receipt.fee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Settlement</span>
              <span className="text-slate-900 dark:text-white">{receipt.eta}</span>
            </div>
          </div>
          <button
            onClick={() => {
              setReceipt(null);
              setStep("form");
              setAmount("");
              setRemarks("");
            }}
            className="mt-4 w-full rounded-xl bg-[#0b1b33] py-3 text-sm font-medium text-white"
          >
            New transfer
          </button>
        </div>
      </AppShell>
    );
  }

  if (step === "review") {
    return (
      <AppShell title="Review transfer" backHref="/payments">
        <div className="space-y-4 p-4">
          <div className="space-y-2 rounded-xl bg-white p-4 text-sm shadow-sm dark:bg-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">To</span>
              <span className="text-slate-900 dark:text-white">{selected?.nickname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Method</span>
              <span className="text-slate-900 dark:text-white">{method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Amount</span>
              <span className="text-slate-900 dark:text-white">₹{amount}</span>
            </div>
            {remarks && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Remarks</span>
                <span className="text-slate-900 dark:text-white">{remarks}</span>
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            onClick={submitTransfer}
            disabled={loading}
            className="w-full rounded-xl bg-[#0b1b33] py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm & authorize"}
          </button>
          <button
            onClick={() => setStep("form")}
            className="w-full rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            Edit details
          </button>
        </div>
        {modal}
      </AppShell>
    );
  }

  return (
    <AppShell title="Transfer money" backHref="/payments">
      <form onSubmit={goToReview} className="space-y-4 p-4">
        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Method</label>
          <div className="grid grid-cols-4 gap-2">
            {METHODS.map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMethod(m)}
                className={`rounded-lg py-2 text-xs font-medium ${
                  method === m ? "bg-[#0b1b33] text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Beneficiary</label>
          <select
            value={beneficiaryId}
            onChange={(e) => setBeneficiaryId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {beneficiaries.map((b) => (
              <option key={b.id} value={b.id} disabled={b.status === "pending"}>
                {b.nickname} — {b.bank} {b.status === "pending" ? "(pending activation)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Amount (₹)</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-slate-400">Remarks (optional)</label>
          <input
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" className="w-full rounded-xl bg-[#0b1b33] py-3 text-sm font-medium text-white">
          Review transfer
        </button>
      </form>

      <div className="space-y-4 px-4 pb-4">
        <InfoSection title="Charges &amp; settlement timing">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400 dark:border-slate-700">
                  <th className="py-1.5 pr-2">Method</th>
                  <th className="py-1.5 pr-2">Slab</th>
                  <th className="py-1.5 pr-2">Charge</th>
                  <th className="py-1.5">Settlement</th>
                </tr>
              </thead>
              <tbody>
                {CHARGES_TABLE.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 dark:border-slate-700/50">
                    <td className="py-1.5 pr-2 font-medium text-slate-900 dark:text-white">{row.method}</td>
                    <td className="py-1.5 pr-2">{row.slab}</td>
                    <td className="py-1.5 pr-2">{row.charge}</td>
                    <td className="py-1.5">{row.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            RTGS is available only for transfers of ₹2,00,000 and above and is not offered for smaller amounts.
            NEFT batches are processed in half-hourly cycles; transfers placed close to a cycle cut-off may settle
            in the next batch. Charges shown are exclusive of GST and subject to revision.
          </p>
        </InfoSection>

        <InfoSection title="Important information">
          <ul className="list-disc space-y-1.5 pl-4">
            <li>Always verify the beneficiary&apos;s name, account number, and IFSC code before confirming a transfer — funds credited to an incorrect account due to an input error may not be recoverable.</li>
            <li>A newly added beneficiary is subject to a cooling period before the first transfer can be made, as a fraud-prevention measure mandated for digital banking channels.</li>
            <li>Daily transfer limits apply per channel and may be lower for newly registered devices or accounts, in line with RBI&apos;s guidelines on digital payment security.</li>
            <li>For disputes relating to a failed or delayed transfer, raise a service request under Products → Service requests with the UTR/reference number noted on your receipt.</li>
          </ul>
        </InfoSection>
      </div>
    </AppShell>
  );
}
