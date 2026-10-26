"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import ThemeToggle from "@/components/ThemeToggle";

type Profile = {
  name: string;
  mobile: string;
  email: string;
  panMasked: string;
  aadhaarMasked: string;
  kycStatus: string;
  accountNumber: string;
  upiId: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    fetch("/api/account").then((r) => r.json()).then(setProfile);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <AppShell title="Profile">
      <div className="space-y-4 p-4">
        {profile && (
          <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0b1b33] text-lg font-semibold text-white">
                {profile.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{profile.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{profile.mobile}</p>
              </div>
              <span
                className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${
                  profile.kycStatus === "verified"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                KYC {profile.kycStatus}
              </span>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Email</dt>
                <dd className="text-slate-900 dark:text-white">{profile.email || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">PAN</dt>
                <dd className="text-slate-900 dark:text-white">{profile.panMasked}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Aadhaar</dt>
                <dd className="text-slate-900 dark:text-white">{profile.aadhaarMasked}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">UPI ID</dt>
                <dd className="text-slate-900 dark:text-white">{profile.upiId}</dd>
              </div>
            </dl>
          </div>
        )}

        <Link
          href="/account"
          className="block rounded-xl bg-white p-4 text-sm font-medium text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
        >
          Account details →
        </Link>
        <Link
          href="/products/service-requests"
          className="block rounded-xl bg-white p-4 text-sm font-medium text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
        >
          Service requests →
        </Link>

        <ThemeToggle />

        <button
          onClick={handleLogout}
          className="w-full rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-medium text-red-600 dark:border-red-900 dark:bg-red-950/30"
        >
          Logout
        </button>

        <p className="pt-2 text-center text-[11px] text-slate-400">
          BharatBank is a fictional demo app. Not a real bank or financial institution.
        </p>
      </div>
    </AppShell>
  );
}
