import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftRight, Bitcoin, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useActor } from "../hooks/useActor";
import {
  BusinessRole,
  type Transaction,
  type UserProfile,
} from "../types/domain";

interface DashboardPageProps {
  profile: UserProfile;
}

const PT_MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const CATEGORY_COLORS: Record<string, string> = {
  revenue: "#f59e0b",
  expense: "#ef4444",
  asset: "#6366f1",
  liability: "#ec4899",
  equity: "#10b981",
};

const CATEGORY_LABELS: Record<string, string> = {
  revenue: "Receitas",
  expense: "Despesas",
  asset: "Ativos",
  liability: "Passivos",
  equity: "Patrimônio",
};

function buildCashFlowData(transactions: Transaction[]) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  return months.map(({ year, month }) => {
    let receitas = 0;
    let despesas = 0;
    for (const tx of transactions) {
      const d = new Date(Number(tx.date) / 1_000_000);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const val = Number(tx.value);
        if (tx.transactionType === "income") {
          receitas += val;
        } else {
          despesas += val;
        }
      }
    }
    return {
      mes: PT_MONTHS[month],
      receitas,
      despesas,
      saldo: receitas - despesas,
    };
  });
}

function buildCategoryData(transactions: Transaction[]) {
  const counts: Record<string, number> = {};
  for (const tx of transactions) {
    const cat = String(tx.category);
    counts[cat] = (counts[cat] ?? 0) + 1;
  }
  const total = transactions.length;
  if (total === 0) return [];
  return Object.entries(counts).map(([cat, count]) => ({
    name: CATEGORY_LABELS[cat] ?? cat,
    value: Math.round((count / total) * 100),
    color: CATEGORY_COLORS[cat] ?? "#94a3b8",
  }));
}

const SKELETON_ROWS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

const statusColors: Record<string, string> = {
  Confirmada: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Pendente: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Falha: "bg-red-500/20 text-red-400 border-red-500/30",
};

function formatBtc(satoshis: bigint): string {
  const btc = Number(satoshis) / 100_000_000;
  return `${btc.toFixed(4)} BTC`;
}

function isCurrentMonth(nanos: bigint): boolean {
  const d = new Date(Number(nanos) / 1_000_000);
  const now = new Date();
  return (
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  );
}

export default function DashboardPage({ profile }: DashboardPageProps) {
  const { actor, isFetching } = useActor();
  const isAdmin = profile.businessRole === BusinessRole.admin;
  const isClient = profile.businessRole === BusinessRole.client;

  // Total clients — admin only
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["allClients"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClients();
    },
    enabled: !!actor && !isFetching && isAdmin,
  });

  // Transactions — all or by client
  const { data: transactions, isLoading: txLoading } = useQuery({
    queryKey: isClient
      ? ["transactionsByClient", profile.clientId?.toString()]
      : ["allTransactions"],
    queryFn: async () => {
      if (!actor) return [];
      if (isClient && profile.clientId !== undefined) {
        return actor.getTransactionsByClientId(profile.clientId);
      }
      return actor.getAllTransactions();
    },
    enabled:
      !!actor && !isFetching && (!isClient || profile.clientId !== undefined),
  });

  const txList = transactions ?? [];
  const txThisMonth = txList.filter((tx) => isCurrentMonth(tx.date));

  const recentTransactions = [...txList]
    .sort((a, b) => Number(b.date - a.date))
    .slice(0, 5);

  // Derived chart data (no effects needed)
  const cashFlowData = txLoading ? [] : buildCashFlowData(txList);
  const categoryData = txLoading ? [] : buildCategoryData(txList);
  const hasTransactions = txList.length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Clientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card
            data-ocid="dashboard.total_clientes.card"
            className="bg-card border-border hover:border-primary/30 transition-colors shadow-card"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Clientes
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isAdmin ? (
                clientsLoading ? (
                  <Skeleton
                    className="h-8 w-16"
                    data-ocid="dashboard.total_clientes.loading_state"
                  />
                ) : (
                  <div className="text-2xl font-display font-bold text-foreground">
                    {clients?.length ?? 0}
                  </div>
                )
              ) : (
                <div className="text-2xl font-display font-bold text-muted-foreground">
                  —
                </div>
              )}
              <p className="text-xs mt-1 text-muted-foreground">
                {isAdmin ? "Total cadastrado" : "Não disponível"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Volume BTC — static placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <Card
            data-ocid="dashboard.volume_btc.card"
            className="bg-card border-border hover:border-primary/30 transition-colors shadow-card"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Volume BTC
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bitcoin className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold text-muted-foreground">
                —
              </div>
              <p className="text-xs mt-1 text-muted-foreground">Em breve</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transações/Mês */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <Card
            data-ocid="dashboard.transacoes_mes.card"
            className="bg-card border-border hover:border-primary/30 transition-colors shadow-card"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Transações/Mês
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/10">
                  <ArrowLeftRight className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <Skeleton
                  className="h-8 w-16"
                  data-ocid="dashboard.transacoes_mes.loading_state"
                />
              ) : (
                <div className="text-2xl font-display font-bold text-foreground">
                  {txThisMonth.length}
                </div>
              )}
              <p className="text-xs mt-1 text-muted-foreground">Mês atual</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Receita Líquida — static placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
        >
          <Card
            data-ocid="dashboard.receita_liquida.card"
            className="bg-card border-border hover:border-primary/30 transition-colors shadow-card"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Receita Líquida
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold text-muted-foreground">
                —
              </div>
              <p className="text-xs mt-1 text-muted-foreground">Em breve</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Area chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="xl:col-span-2"
        >
          <Card className="bg-card border-border shadow-card h-full">
            <CardHeader>
              <CardTitle className="text-base font-display font-bold text-foreground">
                Fluxo de Caixa — Últimos 6 Meses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <div
                  data-ocid="dashboard.cashflow.loading_state"
                  className="h-56 flex items-center justify-center"
                >
                  <Skeleton className="h-full w-full rounded-lg" />
                </div>
              ) : !hasTransactions ? (
                <div
                  data-ocid="dashboard.cashflow.empty_state"
                  className="h-56 flex flex-col items-center justify-center text-center"
                >
                  <ArrowLeftRight className="h-8 w-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Sem dados suficientes
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Registre transações para visualizar o fluxo de caixa.
                  </p>
                </div>
              ) : (
                <>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={cashFlowData}
                        margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorReceitas"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="oklch(0.72 0.19 55)"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="95%"
                              stopColor="oklch(0.72 0.19 55)"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorDespesas"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="oklch(0.6 0.22 25)"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="oklch(0.6 0.22 25)"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="oklch(0.26 0.01 255)"
                        />
                        <XAxis
                          dataKey="mes"
                          tick={{ fill: "oklch(0.55 0.012 255)", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "oklch(0.55 0.012 255)", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v: number) =>
                            v === 0
                              ? "0"
                              : v >= 1_000_000
                                ? `${(v / 1_000_000).toFixed(1)}M sat`
                                : v >= 1_000
                                  ? `${(v / 1_000).toFixed(0)}k sat`
                                  : `${v} sat`
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "oklch(0.18 0.008 255)",
                            border: "1px solid oklch(0.26 0.01 255)",
                            borderRadius: "8px",
                          }}
                          labelStyle={{
                            color: "oklch(0.96 0.008 250)",
                            fontWeight: 600,
                          }}
                          formatter={(value: number, name: string) => [
                            `${value.toLocaleString("pt-BR")} sat`,
                            name === "receitas"
                              ? "Receitas"
                              : name === "despesas"
                                ? "Despesas"
                                : "Saldo",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="receitas"
                          stroke="oklch(0.72 0.19 55)"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorReceitas)"
                        />
                        <Area
                          type="monotone"
                          dataKey="despesas"
                          stroke="oklch(0.6 0.22 25)"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorDespesas)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-0.5 rounded bg-amber-500" />
                      <span className="text-xs text-muted-foreground">
                        Receitas
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-0.5 rounded bg-red-500" />
                      <span className="text-xs text-muted-foreground">
                        Despesas
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="bg-card border-border shadow-card h-full">
            <CardHeader>
              <CardTitle className="text-base font-display font-bold text-foreground">
                Distribuição por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <div
                  data-ocid="dashboard.category.loading_state"
                  className="h-44 flex items-center justify-center"
                >
                  <Skeleton className="h-full w-full rounded-lg" />
                </div>
              ) : !hasTransactions ? (
                <div
                  data-ocid="dashboard.category.empty_state"
                  className="h-44 flex flex-col items-center justify-center text-center"
                >
                  <TrendingUp className="h-8 w-8 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Sem dados suficientes
                  </p>
                </div>
              ) : (
                <>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={entry.color}
                              stroke="transparent"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "oklch(0.18 0.008 255)",
                            border: "1px solid oklch(0.26 0.01 255)",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number, name: string) => [
                            `${value}%`,
                            name,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-2">
                    {categoryData.map((cat) => (
                      <div
                        key={cat.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-xs text-muted-foreground truncate">
                            {cat.name}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          {cat.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <Card className="bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-display font-bold text-foreground">
              Transações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {txLoading ? (
              <div
                className="px-6 py-4 space-y-3"
                data-ocid="dashboard.transactions.loading_state"
              >
                {SKELETON_ROWS.map((key) => (
                  <div key={key} className="flex items-center gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-20 ml-auto" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                data-ocid="dashboard.transactions.empty_state"
              >
                <ArrowLeftRight className="h-8 w-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma transação registrada ainda.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Hash BTC
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Valor BTC
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Valor BRL
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx, i) => {
                      const tipo =
                        tx.transactionType === "income" ? "Entrada" : "Saída";
                      const status = tx.confirmed ? "Confirmada" : "Pendente";
                      const hashDisplay =
                        tx.hash.length > 10
                          ? `...${tx.hash.slice(-10)}`
                          : `...${tx.hash}`;
                      return (
                        <tr
                          key={String(tx.id)}
                          data-ocid={`dashboard.transactions.item.${i + 1}`}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                            {hashDisplay}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={
                                tipo === "Entrada"
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs"
                                  : "bg-red-500/15 text-red-400 border-red-500/30 text-xs"
                              }
                            >
                              {tipo}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-foreground">
                            {formatBtc(tx.value)}
                          </td>
                          <td className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
                            R$ —
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            Cliente #{String(tx.clientId)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={`text-xs ${statusColors[status]}`}
                            >
                              {status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
