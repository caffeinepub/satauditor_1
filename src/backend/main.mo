import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type PlanType = {
    #basic;
    #professional;
    #enterprise;
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
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type TransactionId = Nat;

  type TransactionType = {
    #income;
    #expense;
  };

  type Transaction = {
    id : TransactionId;
    hash : Text;
    transactionType : TransactionType;
    value : Nat; // in satoshis
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
    balance : Int; // in satoshis
  };

  type SubscriptionId = Nat;

  type SubscriptionStatus = {
    #active;
    #inactive;
    #suspended;
  };

  type Subscription = {
    id : SubscriptionId;
    clientId : ClientId;
    plan : PlanType;
    startDate : Time.Time;
    status : SubscriptionStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type Address = {
    street : Text;
    city : Text;
    state : Text;
    zipcode : Text;
    country : Text;
  };

  type AuditLog = {
    timestamp : Time.Time;
    user : Principal;
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

  // User profile type for business roles
  public type UserProfile = {
    name : Text;
    email : Text;
    businessRole : BusinessRole; // Admin, Contador, Cliente
    clientId : ?ClientId; // Only set for Cliente role
  };

  type BusinessRole = {
    #admin;      // Full access
    #accountant; // Access to accounting modules
    #client;     // Access only to own data
  };

  // Access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // State
  let clients = Map.empty<ClientId, Client>();
  var nextClientId = 1;

  let transactions = Map.empty<TransactionId, Transaction>();
  var nextTransactionId = 1;

  let accounts = Map.empty<Text, Account>();

  let subscriptions = Map.empty<SubscriptionId, Subscription>();
  var nextSubscriptionId = 1;

  let auditLogs = Map.empty<Nat, AuditLog>();
  var nextAuditLogId = 1;

  let complianceAlerts = Map.empty<Nat, ComplianceAlert>();
  var nextAlertId = 1;

  // User profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};
