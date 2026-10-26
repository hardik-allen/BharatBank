"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("9999999999");
  const [mpin, setMpin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showLegacy, setShowLegacy] = useState(false);
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("");

  async function handleMpinSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login-mpin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, mpin }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Login failed");
        return;
      }
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function handleLegacySubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Login failed");
        return;
      }
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900">
        <Logo />
        <p className="mb-6 mt-2 text-sm text-slate-500 dark:text-slate-400">
          Demo app — not a real bank. Use mobile <code>9999999999</code> / MPIN <code>123456</code>.
        </p>

        {!showLegacy ? (
          <form onSubmit={handleMpinSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Mobile number</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">MPIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tracking-widest outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={mpin}
                onChange={(e) => setMpin(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#0b1b33] py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLegacySubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#0b1b33] py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}

        <button
          onClick={() => setShowLegacy((v) => !v)}
          className="mt-4 w-full text-center text-xs text-slate-400 hover:text-slate-600"
        >
          {showLegacy ? "Use mobile + MPIN instead" : "Legacy sign-in (username/password)"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          New here?{" "}
          <Link href="/register" className="text-teal-600 dark:text-teal-400">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
