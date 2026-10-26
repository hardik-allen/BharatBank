import { ReactNode } from "react";

export function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
      <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">{children}</div>
    </div>
  );
}
