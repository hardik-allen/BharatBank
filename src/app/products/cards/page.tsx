"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { useStepUp } from "@/components/StepUp";
import { InfoSection } from "@/components/InfoSection";
import { Accordion } from "@/components/Accordion";

const DEBIT_FEES = [
  { label: "Annual maintenance fee", value: "₹199 + GST (waived in first year)" },
  { label: "ATM withdrawals — own network", value: "First 5 free/month, then ₹21 + GST" },
  { label: "ATM withdrawals — other bank", value: "First 3 free/month, then ₹21 + GST" },
  { label: "International transaction markup", value: "3.5% of transaction value" },
  { label: "Card replacement", value: "₹200 + GST" },
  { label: "PIN reissue", value: "Free via app; ₹50 at branch" },
];

const CREDIT_FEES = [
  { label: "Joining fee", value: "₹500 + GST" },
  { label: "Annual fee", value: "₹999 + GST (waived on ₹3L+ annual spend)" },
  { label: "Interest on revolving credit", value: "3.49% per month (41.88% p.a.)" },
  { label: "Cash advance fee", value: "2.5% of amount withdrawn (min ₹500)" },
  { label: "Late payment charges", value: "Up to ₹1,300 depending on outstanding" },
  { label: "Over-limit charges", value: "2.5% of over-limit amount (min ₹500)" },
  { label: "Foreign currency markup", value: "3.5% of transaction value" },
];

const CARD_FAQ = [
  {
    q: "How do I report my card lost or stolen?",
    a: "Freeze the card instantly from this screen, then request a replacement — this also files the loss report in this demo. In a real emergency, always call your bank's 24x7 helpline immediately in addition to freezing the card in-app.",
  },
  {
    q: "What do the usage toggles actually control?",
    a: "Domestic usage controls POS/ATM transactions within India, international usage controls cross-border transactions, and online usage controls card-not-present (e-commerce) transactions. Turning a channel off blocks all transactions of that type immediately.",
  },
  {
    q: "Why was my spending limit capped?",
    a: "Spending limits are a self-service control for your own protection — lowering the limit reduces exposure if your card details are compromised. Limits can be raised instantly up to the card's maximum eligible limit.",
  },
  {
    q: "How are reward points calculated on the credit card?",
    a: "2 reward points per ₹100 spent on retail transactions, 5x points on dining and travel categories, excluding fuel, rent, wallet loads, and government payments. Points expire 24 months from the date earned.",
  },
];

type Card = {
  id: string;
  type: "debit" | "credit";
  network: string;
  last4: string;
  expiry: string;
  status: "active" | "blocked";
  domesticEnabled: boolean;
  internationalEnabled: boolean;
  onlineEnabled: boolean;
  spendingLimit: number;
  creditLimit?: number;
  outstanding?: number;
};

export default function CardsPage() {
  const { requestStepUp, modal } = useStepUp();
  const [cards, setCards] = useState<Card[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pinDrafts, setPinDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/cards");
    const data = await res.json();
    setCards(data.cards ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleToggleBlock(id: string) {
    requestStepUp(async () => {
      await fetch(`/api/cards/${id}/toggle`, { method: "POST" });
      refresh();
    });
  }

  async function handleControl(id: string, patch: object) {
    await fetch(`/api/cards/${id}/controls`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    refresh();
  }

  async function handlePinChange(id: string) {
    const pin = pinDrafts[id] ?? "";
    const res = await fetch(`/api/cards/${id}/pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    setMessage(res.ok ? "PIN updated (demo only — not stored)." : data.error);
    setPinDrafts((d) => ({ ...d, [id]: "" }));
  }

  async function handleReplace(id: string) {
    await fetch(`/api/cards/${id}/replace`, { method: "POST" });
    setMessage("Replacement card requested — tracked under Service requests.");
  }

  return (
    <AppShell title="Cards" backHref="/products">
      <div className="space-y-4 p-4">
        {message && <p className="text-sm text-emerald-600">{message}</p>}
        {cards.map((card) => (
          <div key={card.id} className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-5 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-slate-300">{card.type} card</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  card.status === "active" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                }`}
              >
                {card.status}
              </span>
            </div>
            <p className="mt-6 text-lg tracking-widest">•••• •••• •••• {card.last4}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
              <span>{card.network}</span>
              <span>Exp {card.expiry}</span>
            </div>
            {card.type === "credit" && (
              <p className="mt-2 text-xs text-slate-300">
                Outstanding ₹{card.outstanding?.toLocaleString("en-IN")} of ₹{card.creditLimit?.toLocaleString("en-IN")} limit
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleToggleBlock(card.id)}
                className="flex-1 rounded-lg bg-white/10 py-1.5 text-xs font-medium hover:bg-white/20"
              >
                {card.status === "active" ? "Freeze card" : "Unfreeze card"}
              </button>
              <button
                onClick={() => setExpandedId(expandedId === card.id ? null : card.id)}
                className="flex-1 rounded-lg bg-white/10 py-1.5 text-xs font-medium hover:bg-white/20"
              >
                {expandedId === card.id ? "Hide controls" : "Manage controls"}
              </button>
            </div>

            {expandedId === card.id && (
              <div className="mt-4 space-y-3 rounded-xl bg-black/20 p-3 text-slate-100">
                {(["domesticEnabled", "internationalEnabled", "onlineEnabled"] as const).map((key) => (
                  <label key={key} className="flex items-center justify-between text-xs">
                    <span className="capitalize">{key.replace("Enabled", "")} usage</span>
                    <input
                      type="checkbox"
                      checked={card[key]}
                      onChange={(e) => handleControl(card.id, { [key]: e.target.checked })}
                    />
                  </label>
                ))}
                <div>
                  <label className="mb-1 block text-xs">Spending limit: ₹{card.spendingLimit.toLocaleString("en-IN")}</label>
                  <input
                    type="range"
                    min="5000"
                    max="300000"
                    step="5000"
                    value={card.spendingLimit}
                    onChange={(e) => handleControl(card.id, { spendingLimit: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="New 4-digit PIN"
                    value={pinDrafts[card.id] ?? ""}
                    onChange={(e) => setPinDrafts((d) => ({ ...d, [card.id]: e.target.value.replace(/\D/g, "") }))}
                    className="flex-1 rounded-lg border border-white/20 bg-transparent px-2 py-1.5 text-xs text-white placeholder:text-slate-400"
                  />
                  <button
                    onClick={() => handlePinChange(card.id)}
                    className="rounded-lg bg-white/10 px-3 text-xs font-medium hover:bg-white/20"
                  >
                    Set PIN
                  </button>
                </div>
                <button
                  onClick={() => handleReplace(card.id)}
                  className="w-full rounded-lg bg-white/10 py-1.5 text-xs font-medium hover:bg-white/20"
                >
                  Request replacement card
                </button>
              </div>
            )}
          </div>
        ))}
        {cards.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No cards found.</p>}

        <InfoSection title="Debit card — fees &amp; charges">
          <ul className="space-y-1.5">
            {DEBIT_FEES.map((f) => (
              <li key={f.label} className="flex justify-between gap-3">
                <span>{f.label}</span>
                <span className="flex-shrink-0 text-right font-medium text-slate-900 dark:text-white">{f.value}</span>
              </li>
            ))}
          </ul>
        </InfoSection>

        <InfoSection title="Credit card — fees &amp; charges">
          <ul className="space-y-1.5">
            {CREDIT_FEES.map((f) => (
              <li key={f.label} className="flex justify-between gap-3">
                <span>{f.label}</span>
                <span className="flex-shrink-0 text-right font-medium text-slate-900 dark:text-white">{f.value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-slate-400">
            Minimum amount due is 5% of the outstanding balance or ₹200, whichever is higher. Paying only the
            minimum due attracts interest on the full outstanding balance from the transaction date, not just the
            unpaid portion. All charges exclusive of applicable GST.
          </p>
        </InfoSection>

        <div>
          <h3 className="mb-2 px-1 text-sm font-semibold text-slate-900 dark:text-white">Frequently asked questions</h3>
          <Accordion items={CARD_FAQ} />
        </div>
      </div>
      {modal}
    </AppShell>
  );
}
