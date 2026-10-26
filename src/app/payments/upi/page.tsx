"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { useStepUp } from "@/components/StepUp";

type UpiPayment = {
  id: string;
  date: string;
  payeeVpaOrMobile: string;
  amount: number;
  note: string;
  status: "success" | "pending" | "failed";
};
type Beneficiary = { id: string; nickname: string; bank: string; status: string };

const DEMO_QR_VPA = "merchant.demo@bharatbank";

export default function UpiPage() {
  const { requestStepUp, modal } = useStepUp();
  const [upiId, setUpiId] = useState("");
  const [payments, setPayments] = useState<UpiPayment[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [vpa, setVpa] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [simulate, setSimulate] = useState<"success" | "pending" | "failed">("success");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const res = await fetch("/api/upi");
    const data = await res.json();
    setUpiId(data.upiId ?? "");
    setPayments(data.upiPayments ?? []);
  }

  useEffect(() => {
    refresh();
    fetch("/api/beneficiaries").then((r) => r.json()).then((d) => setBeneficiaries(d.beneficiaries ?? []));
    const interval = setInterval(refresh, 4500);
    return () => clearInterval(interval);
  }, []);

  function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!vpa || !Number(amount)) {
      setMessage({ type: "error", text: "Enter a VPA/mobile and amount" });
      return;
    }
    requestStepUp(async () => {
      setLoading(true);
      setMessage(null);
      try {
        const res = await fetch("/api/upi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payeeVpaOrMobile: vpa, amount, note, simulate }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage({ type: "error", text: data.error ?? "Payment failed" });
          return;
        }
        setMessage({ type: "success", text: `Payment ${data.payment.status}.` });
        setAmount("");
        setNote("");
        refresh();
      } finally {
        setLoading(false);
      }
    });
  }

  const statusColor = { success: "text-emerald-600", pending: "text-amber-600", failed: "text-red-600" };

  return (
    <AppShell title="UPI / Scan & Pay" backHref="/payments">
      <div className="space-y-4 p-4">
        <div className="rounded-xl bg-white p-4 text-center shadow-sm dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Your UPI ID</p>
          <p className="text-sm font-medium text-slate-900 dark:text-white">{upiId}</p>
          <button
            onClick={() => setVpa(DEMO_QR_VPA)}
            className="mt-3 w-full rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200"
          >
            ▣ Simulate QR scan (demo merchant)
          </button>
        </div>

        {beneficiaries.length > 0 && (
          <div>
            <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">Saved payees</p>
            <div className="flex gap-2 overflow-x-auto">
              {beneficiaries.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setVpa(`${b.nickname.toLowerCase().replace(/\s/g, "")}@upi`)}
                  disabled={b.status === "pending"}
                  className="flex-shrink-0 rounded-lg bg-white px-3 py-2 text-xs text-slate-700 shadow-sm disabled:opacity-40 dark:bg-slate-800 dark:text-slate-200"
                >
                  {b.nickname}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={pay} className="space-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
          <input
            placeholder="UPI ID or mobile number"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            value={vpa}
            onChange={(e) => setVpa(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount (₹)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            placeholder="Note (optional)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div>
            <label className="mb-1 block text-[11px] text-slate-400">Demo control — simulate outcome</label>
            <div className="grid grid-cols-3 gap-2">
              {(["success", "pending", "failed"] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSimulate(s)}
                  className={`rounded-lg py-1.5 text-xs capitalize ${
                    simulate === s ? "bg-[#0b1b33] text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{message.text}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#0b1b33] py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Paying..." : "Pay"}
          </button>
        </form>

        <div>
          <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">Recent UPI payments</p>
          <div className="divide-y divide-slate-200 rounded-xl bg-white shadow-sm dark:divide-slate-700 dark:bg-slate-800">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-slate-900 dark:text-white">{p.payeeVpaOrMobile}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{p.date}{p.note ? ` · ${p.note}` : ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-900 dark:text-white">₹{p.amount.toLocaleString("en-IN")}</p>
                  <p className={`text-xs capitalize ${statusColor[p.status]}`}>{p.status}</p>
                </div>
              </div>
            ))}
            {payments.length === 0 && <p className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">No UPI payments yet.</p>}
          </div>
        </div>
      </div>
      {modal}
    </AppShell>
  );
}
