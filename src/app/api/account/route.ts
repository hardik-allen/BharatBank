import { NextRequest, NextResponse } from "next/server";
import { getSessionAccount } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const account = getSessionAccount(req);
  if (!account) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    name: account.name,
    mobile: account.mobile,
    email: account.email,
    panMasked: account.panMasked,
    aadhaarMasked: account.aadhaarMasked,
    kycStatus: account.kycStatus,
    accountNumber: account.accountNumber,
    accountType: account.accountType,
    ifsc: account.ifsc,
    branch: account.branch,
    monthlyIncome: account.monthlyIncome,
    nomineeName: account.nomineeName,
    upiId: account.upiId,
    balance: account.balance,
  });
}
