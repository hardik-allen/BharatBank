import Link from "next/link";
import Logo from "./Logo";

const NAV_LINKS = ["Personal", "Business", "Deposits", "Cards", "Help"];

export default function PublicNav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/">
          <Logo />
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          {NAV_LINKS.map((label) => (
            <span key={label} className="cursor-default">
              {label}
            </span>
          ))}
        </div>
        <Link
          href="/login"
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Login
        </Link>
      </nav>
    </header>
  );
}
