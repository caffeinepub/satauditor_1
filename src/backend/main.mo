import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Blob "mo:core/Blob";
import Array "mo:core/Array";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


actor {
  type PlanType = {
    #basic;
    #professional;
    #enterprise;
  };

  public type WalletType = {
    #manual;
    #ckbtc;
  };

  public type ClientId = Nat;

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

  // Chart of Accounts, Balance Sheet, and Income Statement
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

  public type Address = {
    street : Text;
    city : Text;
    state : Text;
    zipcode : Text;
    country : Text;
  };

  public type BusinessRole = {
    #admin;
    #accountant;
    #client;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    businessRole : BusinessRole;
    clientId : ?ClientId;
  };

  type ClientBitcoinAddressResult = {
    address : Text;
    walletType : WalletType;
  };

  // ICRC-1 types for ckBTC ledger
  type Icrc1Account = {
    owner : Principal;
    subaccount : ?Blob;
  };

  type Icrc1Ledger = actor {
    icrc1_balance_of : query (Icrc1Account) -> async Nat;
  };

  let ckBtcLedger : Icrc1Ledger = actor ("mxzaz-hqaaa-aaaar-qaada-cai");

  var accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var clients = Map.empty<ClientId, Client>();
  var nextClientId = 1;

  var transactions = Map.empty<TransactionId, Transaction>();
  var nextTransactionId = 1;

  var accounts = Map.empty<Text, Account>();

  var subscriptions = Map.empty<SubscriptionId, Subscription>();
  var nextSubscriptionId = 1;

  var auditLogs = Map.empty<Nat, AuditLog>();
  var nextAuditLogId = 1;

  var complianceAlerts = Map.empty<Nat, ComplianceAlert>();
  var nextAlertId = 1;

  var userProfiles = Map.empty<Principal, UserProfile>();

  // Helper function to check if caller owns the client
  private func callerOwnsClient(caller : Principal, clientId : ClientId) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.clientId) {
          case (null) { false };
          case (?ownedClientId) { ownedClientId == clientId };
        };
      };
    };
  };

  // Helper function to convert clientId to single-byte Blob for ICRC-1 subaccount
  private func clientIdToSubaccount(clientId : ClientId) : Blob {
    let byteArray = [Nat8.fromNat(clientId)];
    Blob.fromArray(byteArray);
  };

  // User profile management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Bitcoin wallet management
  public shared ({ caller }) func generateCkBtcAddress(clientId : ClientId) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not callerOwnsClient(caller, clientId)) {
      Runtime.trap("Unauthorized: Only admins or client owners can generate Bitcoin addresses");
    };
    Runtime.trap("Not yet implemented");
  };

  public query ({ caller }) func getClientBitcoinAddress(clientId : ClientId) : async ?ClientBitcoinAddressResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view Bitcoin addresses");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not callerOwnsClient(caller, clientId)) {
      Runtime.trap("Unauthorized: Can only view Bitcoin address for your own client");
    };
    switch (clients.get(clientId)) {
      case (null) { null };
      case (?client) {
        switch (client.bitcoinAddress, client.walletType) {
          case (?address, ?walletType) {
            ?{
              address;
              walletType;
            };
          };
          case (_) { null };
        };
      };
    };
  };

  public shared ({ caller }) func setClientBitcoinAddress(clientId : ClientId, address : Text, walletType : WalletType) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not callerOwnsClient(caller, clientId)) {
      Runtime.trap("Unauthorized: Only admins or client owners can set Bitcoin addresses");
    };
    switch (clients.get(clientId)) {
      case (null) {
        Runtime.trap("Client does not exist");
      };
      case (?client) {
        let updatedClient = {
          client with
          bitcoinAddress = ?address;
          walletType = ?walletType;
        };
        clients.add(clientId, updatedClient);
      };
    };
  };

  // NEW: Get ckBTC balance for a client
  public shared ({ caller }) func getCkBtcBalance(clientId : ClientId) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view balances");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not callerOwnsClient(caller, clientId)) {
      Runtime.trap("Unauthorized: Can only view balance for your own client");
    };

    switch (clients.get(clientId)) {
      case (null) {
        Runtime.trap("Client does not exist");
      };
      case (?client) {
        switch (client.bitcoinAddress) {
          case (null) { 0 };
          case (?_) {
            let subaccount = clientIdToSubaccount(clientId);
            let account : Icrc1Account = {
              owner = Principal.fromText("mxzaz-hqaaa-aaaar-qaada-cai");
              subaccount = ?subaccount;
            };
            await ckBtcLedger.icrc1_balance_of(account);
          };
        };
      };
    };
  };

  // Client management
  public shared ({ caller }) func registerClient(newClient : Client) : async ClientId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can register clients");
    };
    let clientWithId = {
      newClient with
      id = nextClientId;
      createdAt = Time.now();
    };
    clients.add(nextClientId, clientWithId);
    nextClientId += 1;
    clientWithId.id;
  };

  public shared ({ caller }) func editClient(clientId : ClientId, updatedClient : Client) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can edit clients");
    };
    switch (clients.get(clientId)) {
      case (null) { Runtime.trap("Client not found") };
      case (?existingClient) {
        let clientToUpdate = {
          updatedClient with
          id = clientId;
          createdAt = existingClient.createdAt;
          bitcoinAddress = existingClient.bitcoinAddress; // Preserve bitcoin address
          walletType = existingClient.walletType; // Preserve wallet type
        };
        clients.add(clientId, clientToUpdate);
      };
    };
  };

  // NEW: Delete client (admin only)
  public shared ({ caller }) func deleteClient(clientId : ClientId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete clients");
    };
    switch (clients.get(clientId)) {
      case (null) {
        Runtime.trap("Client not found");
      };
      case (?_) {
        clients.remove(clientId);
      };
    };
  };

  public query ({ caller }) func getClient(clientId : ClientId) : async ?Client {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clients");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not callerOwnsClient(caller, clientId)) {
      Runtime.trap("Unauthorized: Can only view your own client");
    };
    clients.get(clientId);
  };

  public query ({ caller }) func getAllClients() : async [Client] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view clients");
    };
    // Admins can see all clients
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return clients.values().toArray();
    };
    // Regular users can only see their own client
    switch (userProfiles.get(caller)) {
      case (null) { [] };
      case (?profile) {
        switch (profile.clientId) {
          case (null) { [] };
          case (?ownedClientId) {
            switch (clients.get(ownedClientId)) {
              case (null) { [] };
              case (?client) { [client] };
            };
          };
        };
      };
    };
  };

  // ⚠🔼 6 NEW FUNCTIONS ADDED BELOW 🔼⚠

  // 1. Get all transactions (with filter for non-admins)
  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };

    if (AccessControl.isAdmin(accessControlState, caller)) {
      // Admins see all transactions
      return transactions.values().toArray();
    };

    // Non-admins: filter transactions by their clientId
    switch (userProfiles.get(caller)) {
      case (null) { [] };
      case (?profile) {
        switch (profile.clientId) {
          case (null) { [] };
          case (?ownedClientId) {
            transactions.values().filter(
              func(transaction) {
                transaction.clientId == ownedClientId;
              }
            ).toArray();
          };
        };
      };
    };
  };

  // 2. Get transactions by specific clientId
  public query ({ caller }) func getTransactionsByClientId(clientId : ClientId) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };

    if (not (AccessControl.isAdmin(accessControlState, caller)) and not callerOwnsClient(caller, clientId)) {
      Runtime.trap("Unauthorized: Can only view your own transactions");
    };

    transactions.values().filter(
      func(transaction) {
        transaction.clientId == clientId;
      }
    ).toArray();
  };

  // 3. Add new transaction (admin only)
  public shared ({ caller }) func addTransaction(newTx : Transaction) : async TransactionId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add transactions");
    };

    let txWithId = {
      newTx with
      id = nextTransactionId;
      createdAt = Time.now();
    };
    transactions.add(nextTransactionId, txWithId);
    nextTransactionId += 1;
    txWithId.id;
  };

  // 4. Get all subscriptions (admin only)
  public query ({ caller }) func getAllSubscriptions() : async [Subscription] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all subscriptions");
    };
    subscriptions.values().toArray();
  };

  // 5. Get subscription by clientId
  public query ({ caller }) func getSubscriptionByClientId(clientId : ClientId) : async ?Subscription {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view subscriptions");
    };

    if (not (AccessControl.isAdmin(accessControlState, caller)) and not callerOwnsClient(caller, clientId)) {
      Runtime.trap("Unauthorized: Can only view your own subscription");
    };

    let matches = subscriptions.values().filter(
      func(sub) {
        sub.clientId == clientId;
      }
    ).toArray();

    if (matches.size() == 0) { return null };
    ?matches[0];
  };

  // 6. Add new subscription (admin only)
  public shared ({ caller }) func addSubscription(newSub : Subscription) : async SubscriptionId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add subscriptions");
    };

    let subWithId = {
      newSub with
      id = nextSubscriptionId;
      createdAt = Time.now();
    };
    subscriptions.add(nextSubscriptionId, subWithId);
    nextSubscriptionId += 1;
    subWithId.id;
  };
};
