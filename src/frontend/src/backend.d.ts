import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface IncomeStatement {
    month: bigint;
    expenses: Array<IncomeStatementLine>;
    year: bigint;
    totalExpenses: bigint;
    revenues: Array<IncomeStatementLine>;
    totalRevenue: bigint;
    netIncome: bigint;
}
export interface AuditLog {
    id: AuditLogId;
    action: string;
    user: Principal;
    timestamp: Time;
    details: string;
}
export type Time = bigint;
export interface CashFlow {
    inflows: Array<CashFlowLine>;
    month: bigint;
    outflows: Array<CashFlowLine>;
    year: bigint;
    totalOutflows: bigint;
    netCashFlow: bigint;
    totalInflows: bigint;
}
export type AuditLogId = bigint;
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
export type AccountId = bigint;
export interface IncomeStatementLine {
    total: bigint;
    accountCode: string;
    accountName: string;
}
export interface BalanceSheetLine {
    total: bigint;
    accountCode: string;
    accountName: string;
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
export interface ClientBitcoinAddressResult {
    walletType: WalletType;
    address: string;
}
export type ClientId = bigint;
export interface ChartAccount {
    id: AccountId;
    active: boolean;
    code: string;
    name: string;
    createdAt: Time;
    description: string;
    accountType: AccountType;
    parentCode?: string;
}
export interface CashFlowLine {
    value: bigint;
    description: string;
}
export type JournalEntryId = bigint;
export interface ImportRecord {
    id: bigint;
    importedAt: Time;
    importedBy: Principal;
    filename: string;
    recordCount: bigint;
}
export interface JournalEntry {
    id: JournalEntryId;
    clientId: ClientId;
    value: bigint;
    date: Time;
    createdAt: Time;
    createdBy: Principal;
    reference?: string;
    description: string;
    debitAccountCode: string;
    creditAccountCode: string;
}
export interface BalanceSheet {
    month: bigint;
    liabilities: Array<BalanceSheetLine>;
    totalAssets: bigint;
    totalLiabilities: bigint;
    assets: Array<BalanceSheetLine>;
    year: bigint;
    totalEquity: bigint;
    equity: Array<BalanceSheetLine>;
}
export interface UserProfile {
    clientId?: ClientId;
    name: string;
    businessRole: BusinessRole;
    email: string;
}
export enum AccountType {
    revenue = "revenue",
    liability = "liability",
    expense = "expense",
    asset = "asset",
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
export enum TransactionType {
    expense = "expense",
    income = "income"
}
export enum UserApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
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
    addChartAccount(account: ChartAccount): Promise<AccountId>;
    addJournalEntry(entry: JournalEntry): Promise<JournalEntryId>;
    addSubscription(newSub: Subscription): Promise<SubscriptionId>;
    addTransaction(newTx: Transaction): Promise<TransactionId>;
    approveUser(user: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteChartAccount(accountId: AccountId): Promise<void>;
    deleteClient(clientId: ClientId): Promise<void>;
    editChartAccount(accountId: AccountId, updated: ChartAccount): Promise<void>;
    editClient(clientId: ClientId, updatedClient: Client): Promise<void>;
    generateCkBtcAddress(clientId: ClientId): Promise<string>;
    getAllAuditLogs(): Promise<Array<AuditLog>>;
    getAllChartAccounts(): Promise<Array<ChartAccount>>;
    getAllClients(): Promise<Array<Client>>;
    getAllJournalEntries(): Promise<Array<JournalEntry>>;
    getAllSubscriptions(): Promise<Array<Subscription>>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getBalanceSheet(clientId: ClientId, month: bigint, year: bigint): Promise<BalanceSheet>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCashFlow(clientId: ClientId, month: bigint, year: bigint): Promise<CashFlow>;
    getChartAccount(accountId: AccountId): Promise<ChartAccount | null>;
    getCkBtcBalance(clientId: ClientId): Promise<bigint>;
    getClient(clientId: ClientId): Promise<Client | null>;
    getClientBitcoinAddress(clientId: ClientId): Promise<ClientBitcoinAddressResult | null>;
    getImportHistory(): Promise<Array<ImportRecord>>;
    getIncomeStatement(clientId: ClientId, month: bigint, year: bigint): Promise<IncomeStatement>;
    getJournalEntriesByClientId(clientId: ClientId): Promise<Array<JournalEntry>>;
    getPendingUsers(): Promise<Array<[Principal, UserProfile]>>;
    getSubscriptionByClientId(clientId: ClientId): Promise<Subscription | null>;
    getTransactionsByClientId(clientId: ClientId): Promise<Array<Transaction>>;
    getUserApprovalStatus(): Promise<UserApprovalStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    importTransactions(txs: Array<Transaction>, filename: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    isCallerAdmin(): Promise<boolean>;
    registerClient(newClient: Client): Promise<ClientId>;
    rejectUser(user: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setClientBitcoinAddress(clientId: ClientId, address: string, walletType: WalletType): Promise<void>;
}
