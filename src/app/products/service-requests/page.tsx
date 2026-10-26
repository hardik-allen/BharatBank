"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";

type ServiceRequest = {
  id: string;
  type: string;
  label: string;
  details: string;
  status: "submitted" | "in_progress" | "resolved";
  createdAt: string;
};

const REQUEST_TYPES = [
  { value: "cheque_book", label: "Cheque book request" },
  { value: "stop_cheque", label: "Stop cheque payment" },
  { value: "address_update", label: "Address update" },
  { value: "nominee_update", label: "Nominee update" },
  { value: "transaction_dispute", label: "Transaction dispute" },
  { value: "fraud_report", label: "Fraud report" },
];

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [type, setType] = useState(REQUEST_TYPES[0].value);
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const res = await fetch("/api/service-requests");
    const data = await res.json();
    setRequests(data.serviceRequests ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, details }),
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error ?? "Could not submit request");
        return;
      }
      setMessage("Request submitted.");
      setDetails("");
      refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Service requests" backHref="/products">
      <div className="space-y-4 p-4">
        <form onSubmit={handleSubmit} className="space-y-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {REQUEST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Details (optional)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            rows={3}
          />
          {message && <p className="text-sm text-emerald-600">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#0b1b33] py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit request"}
          </button>
        </form>

        <div className="divide-y divide-slate-200 rounded-xl bg-white shadow-sm dark:divide-slate-700 dark:bg-slate-800">
          {requests.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-slate-900 dark:text-white">{r.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{r.createdAt}{r.details ? ` · ${r.details}` : ""}</p>
              </div>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">{r.status.replace("_", " ")}</span>
            </div>
          ))}
          {requests.length === 0 && <p className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">No requests yet.</p>}
        </div>
      </div>
    </AppShell>
  );
}
