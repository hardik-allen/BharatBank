import Link from "next/link";
import PublicNav from "@/components/PublicNav";

const PROMO_TILES = [
  { title: "UPI Payments", blurb: "Pay any UPI ID, mobile number, or scan a QR code instantly.", icon: "▣" },
  { title: "Fixed & Recurring Deposits", blurb: "Grow savings with quarterly-compounded interest.", icon: "₹" },
  { title: "Cards", blurb: "Debit and credit cards you can freeze or unfreeze instantly.", icon: "▭" },
  { title: "Loans", blurb: "Personal, home, car, education, and gold loans with live EMI calculators.", icon: "🏦" },
];

function CardStack() {
  return (
    <svg viewBox="0 0 320 220" className="w-full max-w-sm" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-8 160 110)">
        <rect x="40" y="90" width="200" height="120" rx="14" fill="#1e293b" />
        <rect x="56" y="112" width="26" height="18" rx="4" fill="#475569" />
        <text x="56" y="178" fill="#94a3b8" fontSize="14" fontFamily="monospace">
          •••• •••• •••• 7734
        </text>
      </g>
      <g transform="rotate(-2 160 100)">
        <rect x="55" y="60" width="200" height="120" rx="14" fill="#f59e0b" />
        <rect x="71" y="82" width="26" height="18" rx="4" fill="#fde68a" />
        <text x="71" y="148" fill="#78350f" fontSize="14" fontFamily="monospace">
          •••• •••• •••• 4821
        </text>
      </g>
      <g transform="rotate(5 160 90)">
        <rect x="75" y="30" width="200" height="120" rx="14" fill="#0b1b33" />
        <rect x="91" y="52" width="26" height="18" rx="4" fill="#2dd4bf" />
        <text x="91" y="118" fill="#cbd5e1" fontSize="14" fontFamily="monospace">
          •••• •••• •••• 4582
        </text>
        <text x="91" y="136" fill="#64748b" fontSize="11">
          BharatBank
        </text>
      </g>
    </svg>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <PublicNav />

      <section className="bg-[#0b1b33]">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 px-4 py-16 md:flex-row md:py-24">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
              Banking,
              <br />
              kept simple.
            </h1>
            <p className="mt-4 max-w-sm text-slate-300 md:mx-0 mx-auto">
              Accounts, UPI, deposits, cards and loans in one place — a fictional digital banking
              prototype built for reverse-engineering practice.
            </p>
            <div className="mt-8 flex justify-center gap-3 md:justify-start">
              <Link
                href="/register"
                className="rounded-full bg-teal-400 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-teal-300"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Login
              </Link>
            </div>
          </div>
          <div className="flex flex-1 justify-center">
            <CardStack />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-semibold text-slate-900 dark:text-white">
          Everything in your account
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {PROMO_TILES.map((tile) => (
            <div key={tile.title} className="rounded-2xl border border-slate-200 p-6 text-center dark:border-slate-800">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-xl dark:bg-teal-900/30">
                {tile.icon}
              </div>
              <h3 className="font-medium text-slate-900 dark:text-white">{tile.title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{tile.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        BharatBank is a fictional demo app built for reverse-engineering practice. It is not a real
        bank, is not RBI-authorized or NPCI-affiliated, and holds no real deposits.
      </footer>
    </main>
  );
}
