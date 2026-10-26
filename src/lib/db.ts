// In-memory mock "backend" data — resets whenever the dev server restarts.
// This exists only to give the demo app something realistic to call over HTTP.
// BharatBank is a fictional demo bank. No real bank, no real money, no real KYC.

import { addMonths, calcFDMaturity, calcRDMaturity } from "./interest";

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number; // positive = credit, negative = debit
  channel?: "UPI" | "NEFT" | "RTGS" | "IMPS" | "Internal";
};

export type FixedDeposit = {
  id: string;
  principal: number;
  annualRate: number;
  tenureMonths: number;
  startDate: string;
  maturityDate: string;
  maturityAmount: number;
  payoutFrequency: "At maturity" | "Monthly" | "Quarterly";
  nomineeName: string;
  status: "active" | "closed";
};

export type RecurringDeposit = {
  id: string;
  monthlyInstallment: number;
  annualRate: number;
  tenureMonths: number;
  startDate: string;
  maturityDate: string;
  maturityAmount: number;
  installmentsPaid: number;
  missedInstallments: number;
  status: "active" | "closed";
};

export type Beneficiary = {
  id: string;
  name: string;
  nickname: string;
  accountNumber: string;
  ifsc: string;
  bank: string;
  status: "pending" | "active";
  activatesAt: string;
};

export type Card = {
  id: string;
  type: "debit" | "credit";
  network: "RuPay" | "Visa" | "Mastercard";
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

export type LoanProduct = {
  id: string;
  name: string;
  category: "Personal" | "Home" | "Car" | "Education" | "Gold" | "Loan against FD";
  annualRate: number;
  maxTenureMonths: number;
  maxAmount: number;
};

export type LoanApplication = {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  tenureMonths: number;
  annualRate: number;
  emi: number;
  status: "submitted" | "approved" | "rejected";
  appliedAt: string;
};

export type Loan = {
  id: string;
  productName: string;
  principal: number;
  outstanding: number;
  emi: number;
  annualRate: number;
  tenureMonths: number;
  nextDueDate: string;
  status: "active" | "closed";
};

export type Biller = {
  id: string;
  name: string;
  category: string;
};

export type BillPayment = {
  id: string;
  billerId: string;
  billerName: string;
  consumerNumber: string;
  amount: number;
  date: string;
  scheduledFor: string | null;
  autopay: boolean;
};

export type UpiPayment = {
  id: string;
  date: string;
  payeeVpaOrMobile: string;
  amount: number;
  note: string;
  status: "success" | "pending" | "failed";
};

export type ServiceRequest = {
  id: string;
  type:
    | "cheque_book"
    | "stop_cheque"
    | "address_update"
    | "nominee_update"
    | "card_replacement"
    | "transaction_dispute"
    | "fraud_report";
  label: string;
  details: string;
  status: "submitted" | "in_progress" | "resolved";
  createdAt: string;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
};

export type Account = {
  username: string; // login key: mobile number for new accounts, legacy username for the seeded demo account
  password?: string; // legacy login path only
  mpin: string;
  name: string;
  mobile: string;
  email: string;
  panMasked: string;
  aadhaarMasked: string;
  kycStatus: "verified" | "pending";
  accountNumber: string;
  accountType: "Savings" | "Current" | "Salary" | "Joint";
  ifsc: string;
  branch: string;
  monthlyIncome: number;
  nomineeName: string;
  upiId: string;
  balance: number;
  transactions: Transaction[];
  fixedDeposits: FixedDeposit[];
  recurringDeposits: RecurringDeposit[];
  beneficiaries: Beneficiary[];
  cards: Card[];
  loans: Loan[];
  loanApplications: LoanApplication[];
  billPayments: BillPayment[];
  upiPayments: UpiPayment[];
  serviceRequests: ServiceRequest[];
  notifications: Notification[];
};

export const billers: Biller[] = [
  { id: "b1", name: "State Electricity Board", category: "Electricity" },
  { id: "b2", name: "Municipal Water Supply", category: "Water" },
  { id: "b3", name: "City Piped Gas", category: "Gas" },
  { id: "b4", name: "Home Broadband", category: "Broadband" },
  { id: "b5", name: "Mobile Prepaid Recharge", category: "Mobile Prepaid" },
  { id: "b6", name: "Mobile Postpaid", category: "Mobile Postpaid" },
  { id: "b7", name: "DTH Recharge", category: "DTH" },
  { id: "b8", name: "FASTag Recharge", category: "FASTag" },
  { id: "b9", name: "Credit Card Bill", category: "Credit Card" },
  { id: "b10", name: "Life Insurance Premium", category: "Insurance" },
  { id: "b11", name: "School / Education Fees", category: "Education" },
  { id: "b12", name: "Municipal Property Tax", category: "Municipal Tax" },
];

export const loanProducts: LoanProduct[] = [
  { id: "lp1", name: "Personal Loan", category: "Personal", annualRate: 11.5, maxTenureMonths: 60, maxAmount: 1500000 },
  { id: "lp2", name: "Home Loan", category: "Home", annualRate: 8.4, maxTenureMonths: 240, maxAmount: 10000000 },
  { id: "lp3", name: "Car Loan", category: "Car", annualRate: 9.2, maxTenureMonths: 84, maxAmount: 2000000 },
  { id: "lp4", name: "Education Loan", category: "Education", annualRate: 9.8, maxTenureMonths: 120, maxAmount: 2500000 },
  { id: "lp5", name: "Gold Loan", category: "Gold", annualRate: 10.5, maxTenureMonths: 36, maxAmount: 1000000 },
  { id: "lp6", name: "Loan Against FD", category: "Loan against FD", annualRate: 8.9, maxTenureMonths: 60, maxAmount: 500000 },
];

const fd1Start = "2026-04-15";
const fd1Tenure = 12;
const rd1Start = "2026-01-05";
const rd1Tenure = 24;

// Next.js dev (Turbopack) can lazily recompile individual route modules, which would otherwise
// give each route its own fresh copy of this module's state. Anchoring to globalThis makes it a
// true singleton for the life of the Node process, so registrations/mutations are visible everywhere.
type GlobalStore = { bharatbankAccounts?: Record<string, Account>; bharatbankIdCounter?: number };
const globalStore = globalThis as unknown as GlobalStore;

function createSeedAccounts(): Record<string, Account> {
  return {
  demo: {
    username: "demo",
    password: "demo1234",
    mpin: "123456",
    name: "Demo Customer",
    mobile: "9999999999",
    email: "demo.customer@example.com",
    panMasked: "ABCDE1234F",
    aadhaarMasked: "XXXX XXXX 4321",
    kycStatus: "verified",
    accountNumber: "XXXX XXXX 4582",
    accountType: "Savings",
    ifsc: "BHRT0001234",
    branch: "Bengaluru",
    monthlyIncome: 85000,
    nomineeName: "Anita Customer",
    upiId: "9999999999@bharatbank",
    balance: 72000,
    transactions: [
      { id: "t1", date: "2026-10-20", description: "Salary credit", amount: 45000, channel: "Internal" },
      { id: "t2", date: "2026-10-21", description: "Grocery store", amount: -1875.5, channel: "UPI" },
      { id: "t3", date: "2026-10-23", description: "Electricity bill", amount: -2200, channel: "Internal" },
      { id: "t4", date: "2026-10-25", description: "Transfer from Rahul", amount: 5000, channel: "UPI" },
    ],
    fixedDeposits: [
      {
        id: "fd1",
        principal: 100000,
        annualRate: 7.1,
        tenureMonths: fd1Tenure,
        startDate: fd1Start,
        maturityDate: addMonths(fd1Start, fd1Tenure),
        maturityAmount: calcFDMaturity(100000, 7.1, fd1Tenure),
        payoutFrequency: "At maturity",
        nomineeName: "Anita Customer",
        status: "active",
      },
    ],
    recurringDeposits: [
      {
        id: "rd1",
        monthlyInstallment: 5000,
        annualRate: 6.9,
        tenureMonths: rd1Tenure,
        startDate: rd1Start,
        maturityDate: addMonths(rd1Start, rd1Tenure),
        maturityAmount: calcRDMaturity(5000, 6.9, rd1Tenure),
        installmentsPaid: 10,
        missedInstallments: 0,
        status: "active",
      },
    ],
    beneficiaries: [
      {
        id: "ben1",
        name: "Rahul Verma",
        nickname: "Rahul",
        accountNumber: "XXXXXX5678",
        ifsc: "HDFC0001234",
        bank: "HDFC Bank",
        status: "active",
        activatesAt: "2026-01-01",
      },
      {
        id: "ben2",
        name: "Priya Sharma",
        nickname: "Priya",
        accountNumber: "XXXXXX9087",
        ifsc: "ICIC0002345",
        bank: "ICICI Bank",
        status: "active",
        activatesAt: "2026-01-01",
      },
    ],
    cards: [
      {
        id: "card1",
        type: "debit",
        network: "RuPay",
        last4: "4821",
        expiry: "08/29",
        status: "active",
        domesticEnabled: true,
        internationalEnabled: false,
        onlineEnabled: true,
        spendingLimit: 100000,
      },
      {
        id: "card2",
        type: "credit",
        network: "Visa",
        last4: "7734",
        expiry: "03/28",
        status: "active",
        domesticEnabled: true,
        internationalEnabled: true,
        onlineEnabled: true,
        spendingLimit: 200000,
        creditLimit: 200000,
        outstanding: 18450,
      },
    ],
    loans: [
      {
        id: "loan1",
        productName: "Personal Loan",
        principal: 300000,
        outstanding: 185000,
        emi: 9800,
        annualRate: 11.5,
        tenureMonths: 36,
        nextDueDate: "2026-11-05",
        status: "active",
      },
    ],
    loanApplications: [],
    billPayments: [],
    upiPayments: [],
    serviceRequests: [],
    notifications: [
      { id: "n1", title: "Welcome to BharatBank", body: "Your account is ready to use.", date: "2026-10-20", read: true },
      { id: "n2", title: "FD matures soon", body: "Your Fixed Deposit matures on 2027-04-15.", date: "2026-10-24", read: false },
    ],
  },
  };
}

export const accounts: Record<string, Account> = globalStore.bharatbankAccounts ?? (globalStore.bharatbankAccounts = createSeedAccounts());

export function findAccount(key: string): Account | undefined {
  return accounts[key];
}

export function findAccountByMobile(mobile: string): Account | undefined {
  return Object.values(accounts).find((a) => a.mobile === mobile);
}

export function nextId(prefix: string): string {
  globalStore.bharatbankIdCounter = (globalStore.bharatbankIdCounter ?? 100) + 1;
  return `${prefix}${globalStore.bharatbankIdCounter}`;
}

export function maskAccountNumber(last4: string): string {
  return `XXXX XXXX ${last4}`;
}
