"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";

type Beneficiary = {
  id: string;
  name: string;
  nickname: string;
  accountNumber: string;
  ifsc: string;
  bank: string;
  status: "pending" | "active";
};

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bank, setBank] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    const res = await fetch("/api/beneficiaries");
    const data = await res.json();
    setBeneficiaries(data.beneficiaries ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/beneficiaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, nickname, accountNumber, ifsc, bank }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error ?? "Could not add beneficiary" });
        return;
      }
      setMessage({ type: "success", text: "Beneficiary added — pending activation for 30s (demo cooling period)." });
      setName("");
      setNickname("");
      setAccountNumber("");
      setIfsc("");
      setBank("");
      setShowForm(false);
      refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/beneficiaries/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <AppShell title="Beneficiaries" backHref="/payments">
      <div className="space-y-4 p-4">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="w-full rounded-xl bg-[#0b1b33] py-3 text-sm font-medium text-white"
        >
          {showForm ? "Cancel" : "+ Add beneficiary"}
        </button>

        {showForm && (
          <form onSubmit={handleAdd} className="space-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
            <input
              placeholder="Full name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              placeholder="Nickname (optional)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <input
              placeholder="Account number"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
            <input
              placeholder="IFSC code"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value)}
              required
            />
            <input
              placeholder="Bank name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#0b1b33] py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add beneficiary"}
            </button>
          </form>
        )}

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>{message.text}</p>
        )}

        <div className="divide-y divide-slate-200 rounded-xl bg-white shadow-sm dark:divide-slate-700 dark:bg-slate-800">
          {beneficiaries.map((b) => (
            <div key={b.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {b.name} <span className="text-slate-400">({b.nickname})</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {b.bank} · {b.accountNumber} · {b.ifsc}
                </p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] ${
                    b.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {b.status === "active" ? "Active" : "Pending activation"}
                </span>
              </div>
              <button
                onClick={() => handleDelete(b.id)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                Remove
              </button>
            </div>
          ))}
          {beneficiaries.length === 0 && <p className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">No beneficiaries yet.</p>}
        </div>
      </div>
    </AppShell>
  );
}
