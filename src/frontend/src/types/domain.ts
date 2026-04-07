// ── Domain enums ──────────────────────────────────────────────────────────────

export enum BusinessRole {
  admin = "admin",
  accountant = "accountant",
  client = "client",
}

export enum UserApprovalStatus {
  pending = "pending",
  approved = "approved",
  rejected = "rejected",
}

export enum WalletType {
  ckbtc = "ckbtc",
  cold = "cold",
  manual = "manual",
}

export enum PlanType {
  basic = "basic",
  professional = "professional",
  enterprise = "enterprise",
}

export enum TransactionType {
  income = "income",
  expense = "expense",
}

export enum TransactionCategory {
  revenue = "revenue",
  cost = "cost",
  operational = "operational",
  financial = "financial",
  other = "other",
}

export enum AccountType {
  asset = "asset",
  liability = "liability",
  revenue = "revenue",
  expense = "expense",
  equity = "equity",
}

// ── Domain interfaces ─────────────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  email: string;
  businessRole: BusinessRole;
  clientId?: number | bigint;
}

export interface Client {
  id: number | bigint;
  name: string;
  empresa: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  planType: PlanType;
  plan?: Record<string, unknown>;
  status: string | Record<string, unknown>;
  bitcoinAddress?: string;
  walletType?: WalletType;
  ckbtcBalance?: bigint;
}

export interface Subscription {
  id: number | bigint;
  clientId: number | bigint;
  planType?: PlanType;
  plan?: Record<string, unknown>;
  status: Record<string, unknown> | string;
  startDate: bigint;
  endDate?: bigint;
}

export interface Transaction {
  id: number | bigint;
  clientId: number | bigint;
  amount?: bigint;
  value?: bigint;
  hash?: string;
  transactionType: TransactionType;
  category: TransactionCategory;
  description: string;
  date: bigint;
  bitcoinTxId?: string;
  confirmed?: boolean;
}

export interface AuditLog {
  id: number | bigint;
  principal?: { toString(): string };
  user?: { toString(): string };
  action: string;
  details: string;
  timestamp: bigint;
}

export interface ChartAccount {
  id: number | bigint;
  code: string;
  name: string;
  accountType: AccountType;
  parentCode?: string;
  description: string;
  active: boolean;
  createdAt?: bigint;
}

export interface JournalEntry {
  id: number | bigint;
  date: bigint;
  description: string;
  debitAccountId?: number | bigint;
  creditAccountId?: number | bigint;
  debitAccountCode?: string;
  creditAccountCode?: string;
  amount?: bigint;
  value?: bigint;
  clientId: number | bigint;
  reference?: string;
  createdBy?: unknown;
  createdAt?: bigint;
}

// ── Report line items ─────────────────────────────────────────────────────────

export interface ReportLine {
  name?: string;
  accountCode?: string;
  accountName?: string;
  description?: string;
  value: bigint;
  total: bigint;
}

export interface BalanceSheet {
  assets: ReportLine[];
  liabilities: ReportLine[];
  equity: ReportLine[];
  totalAssets: bigint;
  totalLiabilities: bigint;
  totalEquity: bigint;
}

export interface IncomeStatement {
  revenues: ReportLine[];
  expenses: ReportLine[];
  totalRevenues?: bigint;
  totalRevenue?: bigint;
  totalExpenses: bigint;
  netIncome: bigint;
}

export interface CashFlow {
  inflows: ReportLine[];
  outflows: ReportLine[];
  totalInflows: bigint;
  totalOutflows: bigint;
  netCashFlow: bigint;
}

// ── Import ────────────────────────────────────────────────────────────────────

export interface ImportRecord {
  id: bigint;
  filename: string;
  importedAt: bigint; // nanoseconds timestamp
  recordCount: bigint;
  importedBy: { toString(): string };
}
