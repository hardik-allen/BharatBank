import AppShell from "@/components/AppShell";

const PRODUCTS = [
  { name: "Health Insurance", blurb: "Cover hospitalization and medical expenses for you and your family." },
  { name: "Life Insurance", blurb: "Financial protection for your family in your absence." },
  { name: "Term Insurance", blurb: "High cover, low premium life protection for a fixed term." },
  { name: "Motor Insurance", blurb: "Cover for your car or two-wheeler against damage and liability." },
  { name: "Travel Insurance", blurb: "Cover for trip cancellations, medical emergencies, and lost baggage." },
];

export default function InsurancePage() {
  return (
    <AppShell title="Insurance" backHref="/products">
      <div className="space-y-4 p-4">
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          Educational demo only — illustrative product information, no real policies or purchases.
        </p>
        {PRODUCTS.map((p) => (
          <div key={p.name} className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
            <p className="text-sm font-medium text-slate-900 dark:text-white">{p.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{p.blurb}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
