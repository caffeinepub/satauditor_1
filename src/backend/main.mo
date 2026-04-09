import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Blob "mo:core/Blob";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Result "mo:core/Result";

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

  // Legacy UserProfile shape — used only for stable migration from previous deployment.
  // This matches the on-disk type that was stored before company/demo fields were added.
  type UserProfileLegacy = {
    name : Text;
    email : Text;
    businessRole : BusinessRole;
    clientId : ?ClientId;
  };

  // Current UserProfile — all new fields are optional for forward compatibility.
  // demoMode: null means not set → defaults to true (new user in demo)
  // Company fields are all optional for gradual activation
  public type UserProfile = {
    name : Text;
    email : Text;
    businessRole : BusinessRole;
    clientId : ?ClientId;
    // Demo mode flag — null = not set (default true for new/existing users)
    demoMode : ?Bool;
    // Company activation fields
    companyName : ?Text;
    cnpj : ?Text;
    segment : ?Text;
    responsibleName : ?Text;
    companyEmail : ?Text;
    companyPhone : ?Text;
    companyWallet : ?Text;
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

  // Stable migration store — uses the legacy shape (without company/demo fields).
  // Keeps the original variable name 'userProfiles' to preserve stable data across upgrade.
  // After postupgrade, data is migrated to the transient userProfilesNew working map.
  var userProfiles = Map.empty<Principal, UserProfileLegacy>();

  // Transient working map — holds the current UserProfile shape with all new fields.
  // Populated from userProfiles in postupgrade. Serialized back to userProfiles in preupgrade.
  transient var userProfilesNew = Map.empty<Principal, UserProfile>();

  system func preupgrade() {
    // Serialize current userProfilesNew back into the legacy stable store for persistence.
    userProfiles := Map.empty<Principal, UserProfileLegacy>();
    for ((principal, profile) in userProfilesNew.entries()) {
      userProfiles.add(principal, {
        name = profile.name;
        email = profile.email;
        businessRole = profile.businessRole;
        clientId = profile.clientId;
      });
    };
  };

  system func postupgrade() {
    // Migrate legacy stable entries to full UserProfile with null for new optional fields.
    for ((principal, legacy) in userProfiles.entries()) {
      let migrated : UserProfile = {
        name = legacy.name;
        email = legacy.email;
        businessRole = legacy.businessRole;
        clientId = legacy.clientId;
        demoMode = null; // null → defaults to true (demo mode on for migrated users)
        companyName = null;
        cnpj = null;
        segment = null;
        responsibleName = null;
        companyEmail = null;
        companyPhone = null;
        companyWallet = null;
      };
      userProfilesNew.add(principal, migrated);
    };
  };

  // ── DEPRECATED: approval workflow removed — kept for stable upgrade compatibility ──
  type _UserApprovalStatus = { #pending; #approved; #rejected };
  type _AccessRequest = {
    clientPrincipal : Principal;
    clientEmail : Text;
    clientName : Text;
    requestedAt : Time.Time;
    expiresAt : Time.Time;
  };
  var userApprovalStatus = Map.empty<Principal, _UserApprovalStatus>();
  var accessRequests = Map.empty<Principal, _AccessRequest>();
  // ── END DEPRECATED ────────────────────────────────────────────────────────

  // ── ACCOUNTING STATE ──────────────────────────────────────────────────────
  var chartAccounts = Map.empty<AccountId, ChartAccount>();
  var nextAccountId = 1;

  var journalEntries = Map.empty<JournalEntryId, JournalEntry>();
  var nextJournalEntryId = 1;
  // ── END ACCOUNTING STATE ──────────────────────────────────────────────────

  // Helper: resolve demoMode from profile (null → true = demo by default)
  private func isDemoMode(profile : UserProfile) : Bool {
    switch (profile.demoMode) {
      case (?v) { v };
      case (null) { true };
    };
  };

  // Helper: check if caller is in demo mode
  private func callerIsInDemoMode(caller : Principal) : Bool {
    switch (userProfilesNew.get(caller)) {
      case (?profile) { isDemoMode(profile) };
      case (null) { true };
    };
  };

  // Helper: check if caller has admin role via UserProfile (primary source of truth for businessRole)
  private func isProfileAdmin(caller : Principal) : Bool {
    switch (userProfilesNew.get(caller)) {
      case (?p) { p.businessRole == #admin };
      case (null) { false };
    };
  };

  // Helper: check if caller is admin or accountant
  private func isAdminOrAccountant(caller : Principal) : Bool {
    if (isProfileAdmin(caller)) { return true };
    switch (userProfilesNew.get(caller)) {
      case (?p) { p.businessRole == #accountant };
      case (null) { false };
    };
  };

  // Helper function to check if caller owns the client
  private func callerOwnsClient(caller : Principal, clientId : ClientId) : Bool {
    switch (userProfilesNew.get(caller)) {
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

  // ── MOCK DATA HELPERS ─────────────────────────────────────────────────────

  // Reference time: use a fixed past timestamp for mock data (Jan 2026 in nanoseconds)
  // We compute relative offsets from a base so mocks have realistic recent dates.
  private func mockTime(daysAgo : Nat) : Time.Time {
    // 1735689600 seconds = 2026-01-01 00:00:00 UTC
    let baseSeconds : Int = 1735689600;
    let offsetSeconds : Int = -(daysAgo.toInt() * 86400);
    (baseSeconds + offsetSeconds) * 1_000_000_000;
  };

  private func mockTransactions() : [Transaction] {
    [
      { id = 9001; hash = "mock-001"; transactionType = #income; value = 15000_00; date = mockTime(5); category = #revenue; description = "Receita de serviços"; clientId = 0; confirmed = true; createdAt = mockTime(5); updatedAt = mockTime(5) },
      { id = 9002; hash = "mock-002"; transactionType = #expense; value = 3500_00; date = mockTime(8); category = #expense; description = "Pagamento de fornecedor"; clientId = 0; confirmed = true; createdAt = mockTime(8); updatedAt = mockTime(8) },
      { id = 9003; hash = "mock-003"; transactionType = #expense; value = 2800_00; date = mockTime(12); category = #expense; description = "Aluguel"; clientId = 0; confirmed = true; createdAt = mockTime(12); updatedAt = mockTime(12) },
      { id = 9004; hash = "mock-004"; transactionType = #expense; value = 12000_00; date = mockTime(15); category = #expense; description = "Salários"; clientId = 0; confirmed = true; createdAt = mockTime(15); updatedAt = mockTime(15) },
      { id = 9005; hash = "mock-005"; transactionType = #income; value = 25000_00; date = mockTime(20); category = #revenue; description = "Vendas do mês"; clientId = 0; confirmed = true; createdAt = mockTime(20); updatedAt = mockTime(20) },
      { id = 9006; hash = "mock-006"; transactionType = #expense; value = 4200_00; date = mockTime(22); category = #expense; description = "Impostos"; clientId = 0; confirmed = true; createdAt = mockTime(22); updatedAt = mockTime(22) },
      { id = 9007; hash = "mock-007"; transactionType = #expense; value = 650_00; date = mockTime(28); category = #expense; description = "Energia elétrica"; clientId = 0; confirmed = true; createdAt = mockTime(28); updatedAt = mockTime(28) },
      { id = 9008; hash = "mock-008"; transactionType = #income; value = 8500_00; date = mockTime(35); category = #revenue; description = "Receita de serviços"; clientId = 0; confirmed = true; createdAt = mockTime(35); updatedAt = mockTime(35) },
      { id = 9009; hash = "mock-009"; transactionType = #expense; value = 1200_00; date = mockTime(42); category = #expense; description = "Manutenção de equipamentos"; clientId = 0; confirmed = true; createdAt = mockTime(42); updatedAt = mockTime(42) },
      { id = 9010; hash = "mock-010"; transactionType = #income; value = 18000_00; date = mockTime(50); category = #revenue; description = "Contrato de consultoria"; clientId = 0; confirmed = true; createdAt = mockTime(50); updatedAt = mockTime(50) },
      { id = 9011; hash = "mock-011"; transactionType = #expense; value = 500_00; date = mockTime(60); category = #expense; description = "Material de escritório"; clientId = 0; confirmed = true; createdAt = mockTime(60); updatedAt = mockTime(60) },
      { id = 9012; hash = "mock-012"; transactionType = #income; value = 6300_00; date = mockTime(75); category = #revenue; description = "Prestação de serviços avulsos"; clientId = 0; confirmed = true; createdAt = mockTime(75); updatedAt = mockTime(75) },
    ];
  };

  private func mockChartAccounts() : [ChartAccount] {
    [
      { id = 9001; code = "1.1.01"; name = "Caixa"; accountType = #asset; parentCode = ?"1.1"; description = "Numerário em caixa"; active = true; createdAt = mockTime(90) },
      { id = 9002; code = "1.1.02"; name = "Bancos"; accountType = #asset; parentCode = ?"1.1"; description = "Saldos em contas bancárias"; active = true; createdAt = mockTime(90) },
      { id = 9003; code = "1.2.01"; name = "Clientes"; accountType = #asset; parentCode = ?"1.2"; description = "Contas a receber de clientes"; active = true; createdAt = mockTime(90) },
      { id = 9004; code = "2.1.01"; name = "Fornecedores"; accountType = #liability; parentCode = ?"2.1"; description = "Contas a pagar a fornecedores"; active = true; createdAt = mockTime(90) },
      { id = 9005; code = "3.1.01"; name = "Receita de Serviços"; accountType = #revenue; parentCode = ?"3.1"; description = "Receitas provenientes de serviços prestados"; active = true; createdAt = mockTime(90) },
      { id = 9006; code = "3.1.02"; name = "Receita de Vendas"; accountType = #revenue; parentCode = ?"3.1"; description = "Receitas provenientes de vendas de produtos"; active = true; createdAt = mockTime(90) },
      { id = 9007; code = "4.1.01"; name = "Despesas Operacionais"; accountType = #expense; parentCode = ?"4.1"; description = "Despesas gerais de operação"; active = true; createdAt = mockTime(90) },
      { id = 9008; code = "4.1.02"; name = "Salários"; accountType = #expense; parentCode = ?"4.1"; description = "Folha de pagamento"; active = true; createdAt = mockTime(90) },
      { id = 9009; code = "4.1.03"; name = "Impostos"; accountType = #expense; parentCode = ?"4.1"; description = "Tributos e contribuições"; active = true; createdAt = mockTime(90) },
      { id = 9010; code = "5.1.01"; name = "Capital Social"; accountType = #equity; parentCode = ?"5.1"; description = "Capital integralizado pelos sócios"; active = true; createdAt = mockTime(90) },
    ];
  };

  private func mockJournalEntries() : [JournalEntry] {
    let demoCreator = Principal.fromText("aaaaa-aa");
    [
      { id = 9001; date = mockTime(5); description = "Receita de serviços — NF 1001"; clientId = 0; debitAccountCode = "1.1.02"; creditAccountCode = "3.1.01"; value = 15000_00; reference = ?"NF-1001"; createdBy = demoCreator; createdAt = mockTime(5) },
      { id = 9002; date = mockTime(8); description = "Pagamento de fornecedor"; clientId = 0; debitAccountCode = "2.1.01"; creditAccountCode = "1.1.02"; value = 3500_00; reference = null; createdBy = demoCreator; createdAt = mockTime(8) },
      { id = 9003; date = mockTime(12); description = "Pagamento de aluguel"; clientId = 0; debitAccountCode = "4.1.01"; creditAccountCode = "1.1.02"; value = 2800_00; reference = null; createdBy = demoCreator; createdAt = mockTime(12) },
      { id = 9004; date = mockTime(15); description = "Folha de pagamento"; clientId = 0; debitAccountCode = "4.1.02"; creditAccountCode = "1.1.02"; value = 12000_00; reference = null; createdBy = demoCreator; createdAt = mockTime(15) },
      { id = 9005; date = mockTime(20); description = "Vendas à vista"; clientId = 0; debitAccountCode = "1.1.01"; creditAccountCode = "3.1.02"; value = 25000_00; reference = null; createdBy = demoCreator; createdAt = mockTime(20) },
      { id = 9006; date = mockTime(22); description = "Recolhimento de impostos"; clientId = 0; debitAccountCode = "4.1.03"; creditAccountCode = "1.1.02"; value = 4200_00; reference = null; createdBy = demoCreator; createdAt = mockTime(22) },
      { id = 9007; date = mockTime(35); description = "Receita de consultoria — NF 1002"; clientId = 0; debitAccountCode = "1.2.01"; creditAccountCode = "3.1.01"; value = 8500_00; reference = ?"NF-1002"; createdBy = demoCreator; createdAt = mockTime(35) },
      { id = 9008; date = mockTime(50); description = "Contrato de consultoria mensal"; clientId = 0; debitAccountCode = "1.1.02"; creditAccountCode = "3.1.01"; value = 18000_00; reference = ?"CT-2026-01"; createdBy = demoCreator; createdAt = mockTime(50) },
    ];
  };

  private func mockBalanceSheet(month : Nat, year : Nat) : BalanceSheet {
    {
      assets = [
        { accountCode = "1.1.01"; accountName = "Caixa"; total = 18500_00 },
        { accountCode = "1.1.02"; accountName = "Bancos"; total = 42300_00 },
        { accountCode = "1.2.01"; accountName = "Clientes"; total = 23500_00 },
      ];
      liabilities = [
        { accountCode = "2.1.01"; accountName = "Fornecedores"; total = 8700_00 },
      ];
      equity = [
        { accountCode = "5.1.01"; accountName = "Capital Social"; total = 50000_00 },
        { accountCode = "5.2.01"; accountName = "Lucros Acumulados"; total = 25600_00 },
      ];
      totalAssets = 84300_00;
      totalLiabilities = 8700_00;
      totalEquity = 75600_00;
      month;
      year;
    };
  };

  private func mockIncomeStatement(month : Nat, year : Nat) : IncomeStatement {
    {
      revenues = [
        { accountCode = "3.1.01"; accountName = "Receita de Serviços"; total = 41500_00 },
        { accountCode = "3.1.02"; accountName = "Receita de Vendas"; total = 25000_00 },
      ];
      expenses = [
        { accountCode = "4.1.01"; accountName = "Despesas Operacionais"; total = 4450_00 },
        { accountCode = "4.1.02"; accountName = "Salários"; total = 12000_00 },
        { accountCode = "4.1.03"; accountName = "Impostos"; total = 4200_00 },
      ];
      totalRevenue = 66500_00;
      totalExpenses = 20650_00;
      netIncome = 45850_00;
      month;
      year;
    };
  };

  private func mockCashFlow(month : Nat, year : Nat) : CashFlow {
    {
      inflows = [
        { description = "Receita de serviços"; value = 41500_00 },
        { description = "Receita de vendas"; value = 25000_00 },
      ];
      outflows = [
        { description = "Pagamento de salários"; value = 12000_00 },
        { description = "Impostos pagos"; value = 4200_00 },
        { description = "Aluguel"; value = 2800_00 },
        { description = "Fornecedores"; value = 3500_00 },
        { description = "Energia elétrica"; value = 650_00 },
      ];
      totalInflows = 66500_00;
      totalOutflows = 23150_00;
      netCashFlow = 43350_00;
      month;
      year;
    };
  };

  // ── END MOCK DATA HELPERS ─────────────────────────────────────────────────

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfilesNew.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfilesNew.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    // Preserve existing demoMode if incoming profile doesn't set it (migration safety)
    let existing = userProfilesNew.get(caller);
    let resolvedDemoMode : ?Bool = switch (profile.demoMode) {
      case (?v) { ?v };
      case (null) {
        switch (existing) {
          case (?e) { ?isDemoMode(e) };
          case (null) { ?true }; // new profile → demo mode on
        };
      };
    };
    userProfilesNew.add(caller, { profile with demoMode = resolvedDemoMode });
    // Sync AccessControl role so both systems stay consistent.
    // When a profile is saved as admin, elevate the AccessControl role to #admin.
    if (profile.businessRole == #admin) {
      accessControlState.userRoles.add(caller, #admin);
      accessControlState.adminAssigned := true;
    };
  };

  // ── DEMO MODE FUNCTIONS ───────────────────────────────────────────────────

  public shared ({ caller }) func setCallerDemoMode(demoMode : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can change demo mode");
    };
    switch (userProfilesNew.get(caller)) {
      case (null) { Runtime.trap("Perfil não encontrado") };
      case (?profile) {
        userProfilesNew.add(caller, { profile with demoMode = ?demoMode });
      };
    };
  };

  public query ({ caller }) func getCallerDemoMode() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can query demo mode");
    };
    callerIsInDemoMode(caller);
  };

  // saveCompanyProfile: saves all company fields and sets demoMode = false atomically
  public shared ({ caller }) func saveCompanyProfile(
    companyName : Text,
    cnpj : Text,
    segment : Text,
    responsibleName : Text,
    companyEmail : Text,
    companyPhone : Text,
    companyWallet : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save company profiles");
    };
    let base : UserProfile = switch (userProfilesNew.get(caller)) {
      case (?p) { p };
      case (null) {
        {
          name = "";
          email = "";
          businessRole = #client;
          clientId = null;
          demoMode = ?false;
          companyName = null;
          cnpj = null;
          segment = null;
          responsibleName = null;
          companyEmail = null;
          companyPhone = null;
          companyWallet = null;
        }
      };
    };
    userProfilesNew.add(caller, {
      base with
      demoMode = ?false;
      companyName = ?companyName;
      cnpj = ?cnpj;
      segment = ?segment;
      responsibleName = ?responsibleName;
      companyEmail = ?companyEmail;
      companyPhone = ?companyPhone;
      companyWallet = ?companyWallet;
    });
  };

  // ── END DEMO MODE FUNCTIONS ───────────────────────────────────────────────

  // Bitcoin wallet management
  public shared ({ caller }) func generateCkBtcAddress(clientId : ClientId) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller)) and not callerOwnsClient(caller, clientId)) {
      Runtime.trap("Unauthorized: Only admins or client owners can generate Bitcoin addresses");
    };
    // Derive a deterministic ckBTC-style address from the caller principal.
    // Real on-chain address generation requires async management canister calls;
    // this returns a stable, non-crashing placeholder based on the principal text.
    let principalText = caller.toText();
    let address = "bc1q" # principalText;
    // Persist the generated address on the client record if not already set
    switch (clients.get(clientId)) {
      case (?client) {
        switch (client.bitcoinAddress) {
          case (null) {
            clients.add(clientId, { client with bitcoinAddress = ?address; walletType = ?#ckbtc });
          };
          case (?existing) { return existing };
        };
      };
      case (null) {};
    };
    address;
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
    switch (userProfilesNew.get(caller)) {
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
    // Demo mode: return mock data
    if (callerIsInDemoMode(caller)) {
      return mockTransactions();
    };
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return transactions.values().toArray();
    };
    switch (userProfilesNew.get(caller)) {
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
    // Demo mode: return mock data
    if (callerIsInDemoMode(caller)) {
      return mockTransactions();
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
    // Demo mode: return mock data
    if (callerIsInDemoMode(caller)) {
      return mockChartAccounts();
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
    // Demo mode: return mock data
    if (callerIsInDemoMode(caller)) {
      return mockJournalEntries();
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
    // Demo mode: return mock data
    if (callerIsInDemoMode(caller)) {
      return mockJournalEntries();
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
    // Demo mode: return mock data
    if (callerIsInDemoMode(caller)) {
      return mockBalanceSheet(month, year);
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
    // Demo mode: return mock data
    if (callerIsInDemoMode(caller)) {
      return mockIncomeStatement(month, year);
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
    // Demo mode: return mock data
    if (callerIsInDemoMode(caller)) {
      return mockCashFlow(month, year);
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

  // ── AUTHORIZED EMAILS ────────────────────────────────────────────────────

  var authorizedEmails = Map.empty<Text, Bool>();

  public shared ({ caller }) func addAuthorizedEmail(email : Text) : async () {
    if (not isProfileAdmin(caller)) {
      Runtime.trap("Não autorizado: apenas administradores podem adicionar e-mails autorizados");
    };
    authorizedEmails.add(email, true);
  };

  public shared ({ caller }) func removeAuthorizedEmail(email : Text) : async () {
    if (not isProfileAdmin(caller)) {
      Runtime.trap("Não autorizado: apenas administradores podem remover e-mails autorizados");
    };
    authorizedEmails.remove(email);
  };

  public query ({ caller }) func getAuthorizedEmails() : async [Text] {
    if (not isProfileAdmin(caller)) {
      Runtime.trap("Não autorizado: apenas administradores podem listar e-mails autorizados");
    };
    authorizedEmails.keys().toArray();
  };

  public query func isEmailAuthorized(email : Text) : async Bool {
    switch (authorizedEmails.get(email)) {
      case (?_) { true };
      case (null) { false };
    };
  };

  // ── END AUTHORIZED EMAILS ─────────────────────────────────────────────────

  // ── IMPORTAÇÃO DE EXTRATOS ────────────────────────────────────────────────

  public type ImportRecord = {
    id : Nat;
    filename : Text;
    importedAt : Time.Time;
    recordCount : Nat;
    importedBy : Principal;
  };

  var importRecords = Map.empty<Nat, ImportRecord>();
  var nextImportRecordId = 1;

  public shared ({ caller }) func importTransactions(txs : [Transaction], filename : Text) : async { #ok : Nat; #err : Text } {
    if (not isAdminOrAccountant(caller)) {
      return #err("Não autorizado: apenas administradores e contadores podem importar extratos");
    };
    for (tx in txs.vals()) {
      let txWithId = { tx with id = nextTransactionId; createdAt = Time.now() };
      transactions.add(nextTransactionId, txWithId);
      nextTransactionId += 1;
    };
    let count = txs.size();
    let record : ImportRecord = {
      id = nextImportRecordId;
      filename;
      importedAt = Time.now();
      recordCount = count;
      importedBy = caller;
    };
    importRecords.add(nextImportRecordId, record);
    nextImportRecordId += 1;
    logAction(caller, "Importar Extrato", "Arquivo: " # filename # " | Registros: " # count.toText());
    #ok(count);
  };

  public query ({ caller }) func getImportHistory() : async [ImportRecord] {
    if (not isAdminOrAccountant(caller)) {
      Runtime.trap("Não autorizado: apenas administradores e contadores podem ver o histórico de importações");
    };
    importRecords.values().sort(func(a, b) { Int.compare(b.importedAt, a.importedAt) }).toArray();
  };

  // ── END IMPORTAÇÃO DE EXTRATOS ────────────────────────────────────────────

};
