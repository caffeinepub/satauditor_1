import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    clientId?: ClientId;
    name: string;
    businessRole: BusinessRole;
    email: string;
}
export type Time = bigint;
export interface Subscription {
    id: SubscriptionId;
    status: SubscriptionStatus;
    clientId: ClientId;
    createdAt: Time;
    plan: PlanType;
    updatedAt: Time;
    startDate: Time;
}
export type SubscriptionId = bigint;
export type TransactionId = bigint;
export interface Transaction {
    id: TransactionId;
    clientId: ClientId;
    transactionType: TransactionType;
    value: bigint;
    date: Time;
    hash: string;
    createdAt: Time;
    description: string;
    updatedAt: Time;
    category: TransactionCategory;
    confirmed: boolean;
}
export interface Client {
    id: ClientId;
    active: boolean;
    cnpj: string;
    name: string;
    createdAt: Time;
    plan: PlanType;
    walletType?: WalletType;
    email: string;
    updatedAt: Time;
    address: string;
    bitcoinAddress?: string;
    phone: string;
}
export type ClientId = bigint;
export interface ClientBitcoinAddressResult {
    walletType: WalletType;
    address: string;
}

// Accounting types
export type AccountId = bigint;
export interface ChartAccount {
    id: AccountId;
    code: string;
    name: string;
    accountType: AccountType;
    parentCode?: string;
    description: string;
    active: boolean;
    createdAt: Time;
}
export type JournalEntryId = bigint;
export interface JournalEntry {
    id: JournalEntryId;
    date: Time;
    description: string;
    clientId: ClientId;
    debitAccountCode: string;
    creditAccountCode: string;
    value: bigint;
    reference?: string;
    createdBy: Principal;
    createdAt: Time;
}
export interface BalanceSheetLine {
    accountCode: string;
    accountName: string;
    total: bigint;
}
export interface BalanceSheet {
    assets: Array<BalanceSheetLine>;
    liabilities: Array<BalanceSheetLine>;
    equity: Array<BalanceSheetLine>;
    totalAssets: bigint;
    totalLiabilities: bigint;
    totalEquity: bigint;
    month: bigint;
    year: bigint;
}
export interface IncomeStatementLine {
    accountCode: string;
    accountName: string;
    total: bigint;
}
export interface IncomeStatement {
    revenues: Array<IncomeStatementLine>;
    expenses: Array<IncomeStatementLine>;
    totalRevenue: bigint;
    totalExpenses: bigint;
    netIncome: bigint;
    month: bigint;
    year: bigint;
}
export interface CashFlowLine {
    description: string;
    value: bigint;
}
export interface CashFlow {
    inflows: Array<CashFlowLine>;
    outflows: Array<CashFlowLine>;
    totalInflows: bigint;
    totalOutflows: bigint;
    netCashFlow: bigint;
    month: bigint;
    year: bigint;
}

// Audit Log types
export type AuditLogId = bigint;
export interface AuditLog {
    id: AuditLogId;
    timestamp: Time;
    user: Principal;
    action: string;
    details: string;
}

export enum AccountType {
    asset = "asset",
    liability = "liability",
    revenue = "revenue",
    expense = "expense",
    equity = "equity"
}
export enum BusinessRole {
    accountant = "accountant",
    client = "client",
    admin = "admin"
}
export enum PlanType {
    enterprise = "enterprise",
    professional = "professional",
    basic = "basic"
}
export enum SubscriptionStatus {
    active = "active",
    inactive = "inactive",
    suspended = "suspended"
}
export enum TransactionCategory {
    revenue = "revenue",
    liability = "liability",
    expense = "expense",
    asset = "asset",
    equity = "equity"
}
export enum TransactionType {
    expense = "expense",
    income = "income"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum WalletType {
    ckbtc = "ckbtc",
    manual = "manual"
}
export interface backendInterface {
    // Existing
    addSubscription(newSub: Subscription): Promise<SubscriptionId>;
    addTransaction(newTx: Transaction): Promise<TransactionId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteClient(clientId: ClientId): Promise<void>;
    editClient(clientId: ClientId, updatedClient: Client): Promise<void>;
    generateCkBtcAddress(clientId: ClientId): Promise<string>;
    getAllClients(): Promise<Array<Client>>;
    getAllSubscriptions(): Promise<Array<Subscription>>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCkBtcBalance(clientId: ClientId): Promise<bigint>;
    getClient(clientId: ClientId): Promise<Client | null>;
    getClientBitcoinAddress(clientId: ClientId): Promise<ClientBitcoinAddressResult | null>;
    getSubscriptionByClientId(clientId: ClientId): Promise<Subscription | null>;
    getTransactionsByClientId(clientId: ClientId): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerClient(newClient: Client): Promise<ClientId>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setClientBitcoinAddress(clientId: ClientId, address: string, walletType: WalletType): Promise<void>;
    // Chart of Accounts
    addChartAccount(account: ChartAccount): Promise<AccountId>;
    editChartAccount(accountId: AccountId, updated: ChartAccount): Promise<void>;
    deleteChartAccount(accountId: AccountId): Promise<void>;
    getChartAccount(accountId: AccountId): Promise<ChartAccount | null>;
    getAllChartAccounts(): Promise<Array<ChartAccount>>;
    // Journal Entries
    addJournalEntry(entry: JournalEntry): Promise<JournalEntryId>;
    getAllJournalEntries(): Promise<Array<JournalEntry>>;
    getJournalEntriesByClientId(clientId: ClientId): Promise<Array<JournalEntry>>;
    // Financial Reports
    getBalanceSheet(clientId: ClientId, month: bigint, year: bigint): Promise<BalanceSheet>;
    getIncomeStatement(clientId: ClientId, month: bigint, year: bigint): Promise<IncomeStatement>;
    getCashFlow(clientId: ClientId, month: bigint, year: bigint): Promise<CashFlow>;
    // Audit Logs
    getAllAuditLogs(): Promise<Array<AuditLog>>;
}
