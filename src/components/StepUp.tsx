"use client";

import { useState } from "react";

export function useStepUp() {
  const [open, setOpen] = useState(false);
  const [mpin, setMpin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<(() => void) | null>(null);

  function requestStepUp(action: () => void) {
    setMpin("");
    setError(null);
    setPending(() => action);
    setOpen(true);
  }

  async function confirm() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/step-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mpin }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Incorrect MPIN");
        return;
      }
      setOpen(false);
      pending?.();
    } finally {
      setLoading(false);
    }
  }

  const modal = !open ? null : (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl dark:bg-slate-900">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Confirm with MPIN</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Enter your 6-digit MPIN to authorize this action.
        </p>
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          autoFocus
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-lg tracking-[0.5em] outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          value={mpin}
          onChange={(e) => setMpin(e.target.value.replace(/\D/g, ""))}
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => setOpen(false)}
            className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={mpin.length !== 6 || loading}
            className="flex-1 rounded-lg bg-[#0b1b33] py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Checking..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );

  return { requestStepUp, modal };
}
