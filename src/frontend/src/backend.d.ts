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
}
