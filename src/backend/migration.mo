import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type PlanType = {
    #basic;
    #professional;
    #enterprise;
  };

  type WalletType = {
    #manual;
    #ckbtc;
  };

  type ClientId = Nat;

  type Client = {
    id : ClientId;
    name : Text;
    cnpj : Text;
    email : Text;
    phone : Text;
    address : Text;
    plan : PlanType;
    active : Bool;
    bitcoinAddress : ?Text;
    walletType : ?WalletType;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type TransactionType = {
    #income;
    #expense;
  };

  type TransactionId = Nat;

  type Transaction = {
    id : TransactionId;
    hash : Text;
    transactionType : TransactionType;
    value : Nat;
    date : Time.Time;
    category : TransactionCategory;
    description : Text;
    clientId : ClientId;
    confirmed : Bool;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type TransactionCategory = {
    #revenue;
    #expense;
    #asset;
    #liability;
    #equity;
  };

  type AccountType = {
    #asset;
    #liability;
    #revenue;
    #expense;
    #equity;
  };

  type Account = {
    code : Text;
    name : Text;
    accountType : AccountType;
    balance : Int;
  };

  type SubscriptionStatus = {
    #active;
    #inactive;
    #suspended;
  };

  type SubscriptionId = Nat;

  type Subscription = {
    id : SubscriptionId;
    clientId : ClientId;
    plan : PlanType;
    startDate : Time.Time;
    status : SubscriptionStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type AuditLog = {
    timestamp : Time.Time;
    user : Principal.Principal;
    action : Text;
    previousData : ?Text;
    newData : ?Text;
  };

  type ComplianceAlert = {
    timestamp : Time.Time;
    transactionId : TransactionId;
    message : Text;
    resolved : Bool;
  };

  type Address = {
    street : Text;
    city : Text;
    state : Text;
    zipcode : Text;
    country : Text;
  };

  type BusinessRole = {
    #admin;
    #accountant;
    #client;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    businessRole : BusinessRole;
    clientId : ?ClientId;
  };

  type OldActor = {
    clients : Map.Map<ClientId, Client>;
    nextClientId : ClientId;
    transactions : Map.Map<TransactionId, Transaction>;
    nextTransactionId : TransactionId;
    accounts : Map.Map<Text, Account>;
    subscriptions : Map.Map<SubscriptionId, Subscription>;
    nextSubscriptionId : SubscriptionId;
    auditLogs : Map.Map<Nat, AuditLog>;
    nextAuditLogId : Nat;
    complianceAlerts : Map.Map<Nat, ComplianceAlert>;
    nextAlertId : Nat;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
  };

  public func run(old : OldActor) : OldActor {
    old;
  };
};
