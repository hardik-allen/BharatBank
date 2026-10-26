"use client";

import { useState } from "react";

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-slate-200 rounded-xl bg-white shadow-sm dark:divide-slate-700 dark:bg-slate-800">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-white"
          >
            <span className="pr-3">{item.q}</span>
            <span className="flex-shrink-0 text-slate-400">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && (
            <p className="px-4 pb-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{item.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
