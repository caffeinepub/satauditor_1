import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Blob "mo:core/Blob";
import Array "mo:core/Array";
import Int "mo:core/Int";

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

  // ── ACCOUNTING TYPES ──────────────────────────────────────────────────────

  public type AccountId = Nat;

  public type ChartAccount = {
    id : AccountId;
    code : Text;
    name : Text;
    accountType : AccountType;
    parentCode : ?Text;
    description : Text;
    active : Bool;
    createdAt : Time.Time;
  };

  public type JournalEntryId = Nat;

  public type JournalEntry = {
    id : JournalEntryId;
    date : Time.Time;
    description : Text;
    clientId : ClientId;
    debitAccountCode : Text;
    creditAccountCode : Text;
    value : Int;
    reference : ?Text;
    createdBy : Principal;
    createdAt : Time.Time;
  };

  public type BalanceSheetLine = {
    accountCode : Text;
    accountName : Text;
    total : Int;
  };

  public type BalanceSheet = {
    assets : [BalanceSheetLine];
    liabilities : [BalanceSheetLine];
    equity : [BalanceSheetLine];
    totalAssets : Int;
    totalLiabilities : Int;
    totalEquity : Int;
    month : Nat;
    year : Nat;
  };

  public type IncomeStatementLine = {
    accountCode : Text;
    accountName : Text;
    total : Int;
  };

  public type IncomeStatement = {
    revenues : [IncomeStatementLine];
    expenses : [IncomeStatementLine];
    totalRevenue : Int;
    totalExpenses : Int;
    netIncome : Int;
    month : Nat;
    year : Nat;
  };

  public type CashFlowLine = {
    description : Text;
    value : Int;
  };

  public type CashFlow = {
    inflows : [CashFlowLine];
    outflows : [CashFlowLine];
    totalInflows : Int;
    totalOutflows : Int;
    netCashFlow : Int;
    month : Nat;
    year : Nat;
  };

  // ── END ACCOUNTING TYPES ─────────────────────────────────────────────────

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

  // ── AUDIT LOG TYPES ───────────────────────────────────────────────────────

  // Internal stable storage type — kept identical to the original persisted shape
  // so Motoko upgrade compatibility is maintained.
  type AuditLogStored = {
    timestamp : Time.Time;
    user : Principal;
    action : Text;
    previousData : ?Text;  // legacy field (unused going forward)
    newData : ?Text;       // repurposed: stores the "details" text
  };

  public type AuditLogId = Nat;

  // Public-facing type with cleaner fields
  public type AuditLog = {
    id : AuditLogId;
    timestamp : Time.Time;
    user : Principal;
    action : Text;
    details : Text;
  };

  // ── END AUDIT LOG TYPES ────────────────────────────────────────────────────

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

  // Stable map using the original AuditLogStored shape — fully compatible with persisted data.
  // newData field stores the "details" text for new entries.
  var auditLogs = Map.empty<Nat, AuditLogStored>();
  var nextAuditLogId = 1;

  var complianceAlerts = Map.empty<Nat, ComplianceAlert>();
  var nextAlertId = 1;

  var userProfiles = Map.empty<Principal, UserProfile>();

  // ── ACCOUNTING STATE ──────────────────────────────────────────────────────
  var chartAccounts = Map.empty<AccountId, ChartAccount>();
  var nextAccountId = 1;

  var journalEntries = Map.empty<JournalEntryId, JournalEntry>();
  var nextJournalEntryId = 1;
  // ── END ACCOUNTING STATE ──────────────────────────────────────────────────

  // Helper: check if caller is admin or accountant
  private func isAdminOrAccountant(caller : Principal) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) { return true };
    switch (userProfiles.get(caller)) {
      case (?p) { p.businessRole == #accountant };
      case (null) { false };
    };
  };

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

  // Helper: nanosecond timestamp -> (month: Nat, year: Nat)
  private func timestampToMonthYear(ts : Time.Time) : (Nat, Nat) {
    let seconds = Int.abs(ts) / 1_000_000_000;
    let days = seconds / 86400;
    var year = 1970;
    var remaining = days;
    label yearLoop loop {
      let daysInYear : Nat = if (year % 400 == 0) { 366 } else if (year % 100 == 0) { 365 } else if (year % 4 == 0) { 366 } else { 365 };
      if (remaining < daysInYear) { break yearLoop };
      remaining -= daysInYear;
      year += 1;
    };
    let isLeap = (year % 400 == 0) or (year % 4 == 0 and year % 100 != 0);
    let monthDays : [Nat] = [31, if isLeap { 29 } else { 28 }, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var month = 1;
    label monthLoop for (md in monthDays.vals()) {
      if (remaining < md) { break monthLoop };
      remaining -= md;
      month += 1;
    };
    (month, year);
  };

  // ── AUDIT LOG HELPER ──────────────────────────────────────────────────────
  // Writes using the stable AuditLogStored shape; details go into newData.
  private func logAction(user : Principal, action : Text, details : Text) {
    let entry : AuditLogStored = {
      timestamp = Time.now();
      user;
      action;
      previousData = null;
      newData = ?details;
    };
    auditLogs.add(nextAuditLogId, entry);
    nextAuditLogId += 1;
  };

  // Converts stored entry to the public AuditLog shape.
  private func storedToAuditLog(id : Nat, stored : AuditLogStored) : AuditLog {
    {
      id;
      timestamp = stored.timestamp;
      user = stored.user;
      action = stored.action;
      details = switch (stored.newData) {
        case (?d) { d };
        case (null) { "" };
      };
    };
  };
  // ── END AUDIT LOG HELPER ──────────────────────────────────────────────────

  // User profile management
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
          case (?address, ?walletType) { ?{ address; walletType } };
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
      case (null) { Runtime.trap("Client does not exist") };
      case (?client) {
        clients.add(clientId, { client with bitcoinAddress = ?address; walletType = ?walletType });
      };
    };
  };

  public shared ({ caller }) func getCkBtcBalance(clientId : ClientId) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view balances");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not callerOwnsClient(caller, clientId)) {
      Runtime.trap("Unauthorized: Can only view balance for your own client");
    };
    switch (clients.get(clientId)) {
      case (null) { Runtime.trap("Client does not exist") };
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
    let clientWithId = { newClient with id = nextClientId; createdAt = Time.now() };
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
          bitcoinAddress = existingClient.bitcoinAddress;
          walletType = existingClient.walletType;
        };
        clients.add(clientId, clientToUpdate);
      };
    };
  };

  public shared ({ caller }) func deleteClient(clientId : ClientId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete clients");
    };
    switch (clients.get(clientId)) {
      case (null) { Runtime.trap("Client not found") };
      case (?_) { clients.remove(clientId) };
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
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return clients.values().toArray();
    };
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

  // ── TRANSACTIONS ──────────────────────────────────────────────────────────

  public query ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return transactions.values().toArray();
    };
    switch (userProfiles.get(caller)) {
      case (null) { [] };
      case (?profile) {
        switch (profile.clientId) {
          case (null) { [] };
          case (?ownedClientId) {
            transactions.values().filter(func(t) { t.clientId == ownedClientId }).toArray();
          };
        };
      };
    };
  };

  public query ({ caller }) func getTransactionsByClientId(clientId : ClientId) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transactions");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not callerOwnsClient(caller, clientId)) {
      Runtime.trap("Unauthorized: Can only view your own transactions");
    };
    transactions.values().filter(func(t) { t.clientId == clientId }).toArray();
  };

  public shared ({ caller }) func addTransaction(newTx : Transaction) : async TransactionId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add transactions");
    };
    let txWithId = { newTx with id = nextTransactionId; createdAt = Time.now() };
    transactions.add(nextTransactionId, txWithId);
    let txId = nextTransactionId;
    nextTransactionId += 1;
    logAction(caller, "Adicionar Transação", "ID: " # debug_show(txId) # " | Descrição: " # newTx.description # " | Cliente: " # debug_show(newTx.clientId));
    txId;
  };

  // ── SUBSCRIPTIONS ─────────────────────────────────────────────────────────

  public query ({ caller }) func getAllSubscriptions() : async [Subscription] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all subscriptions");
    };
    subscriptions.values().toArray();
  };

  public query ({ caller }) func getSubscriptionByClientId(clientId : ClientId) : async ?Subscription {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view subscriptions");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not callerOwnsClient(caller, clientId)) {
      Runtime.trap("Unauthorized: Can only view your own subscription");
    };
    let matches = subscriptions.values().filter(func(s) { s.clientId == clientId }).toArray();
    if (matches.size() == 0) { return null };
    ?matches[0];
  };

  public shared ({ caller }) func addSubscription(newSub : Subscription) : async SubscriptionId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add subscriptions");
    };
    let subWithId = { newSub with id = nextSubscriptionId; createdAt = Time.now() };
    subscriptions.add(nextSubscriptionId, subWithId);
    nextSubscriptionId += 1;
    subWithId.id;
  };

  // ── CHART OF ACCOUNTS (PLANO DE CONTAS) ───────────────────────────────────

  public shared ({ caller }) func addChartAccount(account : ChartAccount) : async AccountId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add accounts");
    };
    let withId = { account with id = nextAccountId; createdAt = Time.now() };
    chartAccounts.add(nextAccountId, withId);
    nextAccountId += 1;
    withId.id;
  };

  public shared ({ caller }) func editChartAccount(accountId : AccountId, updated : ChartAccount) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can edit accounts");
    };
    switch (chartAccounts.get(accountId)) {
      case (null) { Runtime.trap("Account not found") };
      case (?existing) {
        chartAccounts.add(accountId, { updated with id = accountId; createdAt = existing.createdAt });
      };
    };
  };

  public shared ({ caller }) func deleteChartAccount(accountId : AccountId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete accounts");
    };
    switch (chartAccounts.get(accountId)) {
      case (null) { Runtime.trap("Account not found") };
      case (?_) { chartAccounts.remove(accountId) };
    };
  };

  public query ({ caller }) func getChartAccount(accountId : AccountId) : async ?ChartAccount {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    chartAccounts.get(accountId);
  };

  public query ({ caller }) func getAllChartAccounts() : async [ChartAccount] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    chartAccounts.values().toArray();
  };

  // ── JOURNAL ENTRIES (LANÇAMENTOS CONTÁBEIS) ───────────────────────────────

  public shared ({ caller }) func addJournalEntry(entry : JournalEntry) : async JournalEntryId {
    if (not isAdminOrAccountant(caller)) {
      Runtime.trap("Unauthorized: Only admins or accountants can add journal entries");
    };
    let withId = { entry with id = nextJournalEntryId; createdBy = caller; createdAt = Time.now() };
    journalEntries.add(nextJournalEntryId, withId);
    let entryId = nextJournalEntryId;
    nextJournalEntryId += 1;
    logAction(caller, "Adicionar Lançamento Contábil", "ID: " # debug_show(entryId) # " | Descrição: " # entry.description # " | Cliente: " # debug_show(entry.clientId) # " | Débito: " # entry.debitAccountCode # " | Crédito: " # entry.creditAccountCode);
    entryId;
  };

  public query ({ caller }) func getAllJournalEntries() : async [JournalEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all journal entries");
    };
    journalEntries.values().toArray();
  };

  public query ({ caller }) func getJournalEntriesByClientId(clientId : ClientId) : async [JournalEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not isAdminOrAccountant(caller) and not callerOwnsClient(caller, clientId)) {
      Runtime.trap("Unauthorized: Can only view your own journal entries");
    };
    journalEntries.values().filter(func(e) { e.clientId == clientId }).toArray();
  };

  // ── AUDIT LOGS ────────────────────────────────────────────────────────────

  public query ({ caller }) func getAllAuditLogs() : async [AuditLog] {
    if (not isAdminOrAccountant(caller)) {
      Runtime.trap("Unauthorized: Only admins and accountants can view audit logs");
    };
    auditLogs.entries().map(func((k, stored) : (Nat, AuditLogStored)) : AuditLog {
      storedToAuditLog(k, stored);
    }).toArray();
  };

  // ── END AUDIT LOGS ────────────────────────────────────────────────────────

  // ── FINANCIAL REPORTS ─────────────────────────────────────────────────────

  public query ({ caller }) func getBalanceSheet(clientId : ClientId, month : Nat, year : Nat) : async BalanceSheet {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not isAdminOrAccountant(caller) and not callerOwnsClient(caller, clientId)) {
      Runtime.trap("Unauthorized: Can only view your own reports");
    };

    let entries = journalEntries.values().filter(func(e) {
      let (m, y) = timestampToMonthYear(e.date);
      e.clientId == clientId and m <= month and y <= year;
    }).toArray();

    let activeAccounts = chartAccounts.values().filter(func(a) { a.active }).toArray();

    let assetLines = activeAccounts.filter(func(a) { a.accountType == #asset }).map(func(acc) {
      var total : Int = 0;
      for (e in entries.vals()) {
        if (e.debitAccountCode == acc.code) { total += e.value };
        if (e.creditAccountCode == acc.code) { total -= e.value };
      };
      { accountCode = acc.code; accountName = acc.name; total } : BalanceSheetLine;
    });

    let liabilityLines = activeAccounts.filter(func(a) { a.accountType == #liability }).map(func(acc) {
      var total : Int = 0;
      for (e in entries.vals()) {
        if (e.debitAccountCode == acc.code) { total += e.value };
        if (e.creditAccountCode == acc.code) { total -= e.value };
      };
      { accountCode = acc.code; accountName = acc.name; total } : BalanceSheetLine;
    });

    let equityLines = activeAccounts.filter(func(a) { a.accountType == #equity }).map(func(acc) {
      var total : Int = 0;
      for (e in entries.vals()) {
        if (e.debitAccountCode == acc.code) { total += e.value };
        if (e.creditAccountCode == acc.code) { total -= e.value };
      };
      { accountCode = acc.code; accountName = acc.name; total } : BalanceSheetLine;
    });

    var totalAssets : Int = 0;
    for (l in assetLines.vals()) { totalAssets += l.total };
    var totalLiabilities : Int = 0;
    for (l in liabilityLines.vals()) { totalLiabilities += l.total };
    var totalEquity : Int = 0;
    for (l in equityLines.vals()) { totalEquity += l.total };

    { assets = assetLines; liabilities = liabilityLines; equity = equityLines; totalAssets; totalLiabilities; totalEquity; month; year };
  };

  public query ({ caller }) func getIncomeStatement(clientId : ClientId, month : Nat, year : Nat) : async IncomeStatement {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not isAdminOrAccountant(caller) and not callerOwnsClient(caller, clientId)) {
      Runtime.trap("Unauthorized: Can only view your own reports");
    };

    let entries = journalEntries.values().filter(func(e) {
      let (m, y) = timestampToMonthYear(e.date);
      e.clientId == clientId and m == month and y == year;
    }).toArray();

    let activeAccounts = chartAccounts.values().filter(func(a) { a.active }).toArray();

    let revenueLines = activeAccounts.filter(func(a) { a.accountType == #revenue }).map(func(acc) {
      var total : Int = 0;
      for (e in entries.vals()) {
        if (e.creditAccountCode == acc.code) { total += e.value };
        if (e.debitAccountCode == acc.code) { total -= e.value };
      };
      { accountCode = acc.code; accountName = acc.name; total } : IncomeStatementLine;
    });

    let expenseLines = activeAccounts.filter(func(a) { a.accountType == #expense }).map(func(acc) {
      var total : Int = 0;
      for (e in entries.vals()) {
        if (e.debitAccountCode == acc.code) { total += e.value };
        if (e.creditAccountCode == acc.code) { total -= e.value };
      };
      { accountCode = acc.code; accountName = acc.name; total } : IncomeStatementLine;
    });

    var totalRevenue : Int = 0;
    for (l in revenueLines.vals()) { totalRevenue += l.total };
    var totalExpenses : Int = 0;
    for (l in expenseLines.vals()) { totalExpenses += l.total };

    { revenues = revenueLines; expenses = expenseLines; totalRevenue; totalExpenses; netIncome = totalRevenue - totalExpenses; month; year };
  };

  public query ({ caller }) func getCashFlow(clientId : ClientId, month : Nat, year : Nat) : async CashFlow {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not isAdminOrAccountant(caller) and not callerOwnsClient(caller, clientId)) {
      Runtime.trap("Unauthorized: Can only view your own reports");
    };

    let entries = journalEntries.values().filter(func(e) {
      let (m, y) = timestampToMonthYear(e.date);
      e.clientId == clientId and m == month and y == year;
    }).toArray();

    let inflows = entries.filter(func(e) { e.value > 0 }).map(func(e) {
      { description = e.description; value = e.value } : CashFlowLine;
    });

    let outflows = entries.filter(func(e) { e.value < 0 }).map(func(e) {
      { description = e.description; value = Int.abs(e.value) } : CashFlowLine;
    });

    var totalInflows : Int = 0;
    for (l in inflows.vals()) { totalInflows += l.value };
    var totalOutflows : Int = 0;
    for (l in outflows.vals()) { totalOutflows += l.value };

    { inflows; outflows; totalInflows; totalOutflows; netCashFlow = totalInflows - totalOutflows; month; year };
  };
};
