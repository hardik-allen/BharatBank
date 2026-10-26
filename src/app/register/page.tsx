"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

type Step = "mobile" | "otp" | "profile" | "mpin";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [demoOtp, setDemoOtp] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pan, setPan] = useState("");
  const [aadhaarLast4, setAadhaarLast4] = useState("");
  const [mpin, setMpin] = useState("");
  const [confirmMpin, setConfirmMpin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{10}$/.test(mobile)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send OTP");
        return;
      }
      setDemoOtp(data.demoOtp);
      setStep("otp");
    } finally {
      setLoading(false);
    }
  }

  function verifyOtpStep(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (otp !== demoOtp) {
      setError("Incorrect OTP");
      return;
    }
    setStep("profile");
  }

  function continueToMpin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name) {
      setError("Enter your name");
      return;
    }
    setStep("mpin");
  }

  async function finishRegistration(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(mpin)) {
      setError("MPIN must be 6 digits");
      return;
    }
    if (mpin !== confirmMpin) {
      setError("MPINs do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp, name, email, pan, aadhaarLast4, mpin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
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
          Create a demo account. All KYC fields are synthetic test data — never enter a real PAN or Aadhaar.
        </p>

        {step === "mobile" && (
          <form onSubmit={sendOtp} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Mobile number</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                inputMode="numeric"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={loading} className="w-full rounded-lg bg-[#0b1b33] py-2 text-sm font-medium text-white disabled:opacity-50">
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyOtpStep} className="space-y-4">
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
              Demo OTP (no real SMS sent): <strong>{demoOtp}</strong>
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Enter OTP</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tracking-widest dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button className="w-full rounded-lg bg-[#0b1b33] py-2 text-sm font-medium text-white">Verify</button>
          </form>
        )}

        {step === "profile" && (
          <form onSubmit={continueToMpin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Full name</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                PAN (synthetic test value only)
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase().slice(0, 10))}
                placeholder="ABCDE1234F"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Aadhaar last 4 digits (synthetic test value only)
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={aadhaarLast4}
                onChange={(e) => setAadhaarLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button className="w-full rounded-lg bg-[#0b1b33] py-2 text-sm font-medium text-white">Continue</button>
          </form>
        )}

        {step === "mpin" && (
          <form onSubmit={finishRegistration} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Create 6-digit MPIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tracking-widest dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={mpin}
                onChange={(e) => setMpin(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm MPIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tracking-widest dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                value={confirmMpin}
                onChange={(e) => setConfirmMpin(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={loading} className="w-full rounded-lg bg-[#0b1b33] py-2 text-sm font-medium text-white disabled:opacity-50">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
