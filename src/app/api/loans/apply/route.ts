import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";
import { loanProducts, nextId, saveAccount } from "@/lib/db";
import { addMonths, calcEmi } from "@/lib/interest";

export async function POST(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { productId, amount, tenureMonths } = await req.json();
  const product = loanProducts.find((p) => p.id === productId);
  const value = Number(amount);
  const months = Number(tenureMonths);

  if (!product) return NextResponse.json({ error: "Unknown loan product" }, { status: 400 });
  if (!Number.isFinite(value) || value <= 0 || value > product.maxAmount) {
    return NextResponse.json({ error: `Amount must be up to ₹${product.maxAmount.toLocaleString("en-IN")}` }, { status: 400 });
  }
  if (!Number.isFinite(months) || months <= 0 || months > product.maxTenureMonths) {
    return NextResponse.json({ error: `Tenure must be up to ${product.maxTenureMonths} months` }, { status: 400 });
  }

  const emi = calcEmi(value, product.annualRate, months);
  // Simple demo eligibility rule: EMI shouldn't exceed half of declared monthly income.
  const eligible = account.monthlyIncome === 0 || emi <= account.monthlyIncome * 0.5;
  const applicationId = nextId("la");
  const appliedAt = new Date().toISOString().slice(0, 10);

  account.loanApplications.push({
    id: applicationId,
    productId: product.id,
    productName: product.name,
    amount: value,
    tenureMonths: months,
    annualRate: product.annualRate,
    emi,
    status: eligible ? "approved" : "rejected",
    appliedAt,
  });

  if (eligible) {
    account.loans.push({
      id: nextId("loan"),
      productName: product.name,
      principal: value,
      outstanding: value,
      emi,
      annualRate: product.annualRate,
      tenureMonths: months,
      nextDueDate: addMonths(appliedAt, 1),
      status: "active",
    });
  }
  saveAccount(account);

  return NextResponse.json({ ok: true, eligible, emi, applicationId });
}
