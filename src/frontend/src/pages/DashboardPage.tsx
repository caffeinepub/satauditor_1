import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const cashFlowData = [
  { mes: "Nov", receitas: 38000, despesas: 22000, saldo: 16000 },
  { mes: "Dez", receitas: 42000, despesas: 25000, saldo: 17000 },
  { mes: "Jan", receitas: 45000, despesas: 27000, saldo: 18000 },
  { mes: "Fev", receitas: 39000, despesas: 24000, saldo: 15000 },
  { mes: "Mar", receitas: 51000, despesas: 28000, saldo: 23000 },
  { mes: "Abr", receitas: 48920, despesas: 26000, saldo: 22920 },
];

const categoryData = [
  { name: "Receitas de Serviços", value: 45, color: "#f59e0b" },
  { name: "Taxas BTC", value: 20, color: "#10b981" },
  { name: "Assinaturas SaaS", value: 25, color: "#6366f1" },
  { name: "Consultoria", value: 10, color: "#ec4899" },
];

interface Transaction {
  hash: string;
  tipo: "Entrada" | "Saída";
  valorBtc: string;
  valorBrl: string;
  data: string;
  cliente: string;
  status: "Confirmada" | "Pendente" | "Falha";
}

const recentTransactions: Transaction[] = [
  {
    hash: "3a8f2c1d9e",
    tipo: "Entrada",
    valorBtc: "0.2847 BTC",
    valorBrl: "R$ 86.400",
    data: "04/04/2026",
    cliente: "TechFin Brasil",
    status: "Confirmada",
  },
  {
    hash: "7b3e1f5a0c",
    tipo: "Saída",
    valorBtc: "0.0512 BTC",
    valorBrl: "R$ 15.540",
    data: "04/04/2026",
    cliente: "Mercado Digital",
    status: "Confirmada",
  },
  {
    hash: "9d2c4b8e1f",
    tipo: "Entrada",
    valorBtc: "0.1203 BTC",
    valorBrl: "R$ 36.511",
    data: "03/04/2026",
    cliente: "CriptoVault",
    status: "Confirmada",
  },
  {
    hash: "2e9a7f3c5d",
    tipo: "Saída",
    valorBtc: "0.0081 BTC",
    valorBrl: "R$ 2.460",
    data: "03/04/2026",
    cliente: "StartupPay",
    status: "Pendente",
  },
  {
    hash: "6c1b4d8f2a",
    tipo: "Entrada",
    valorBtc: "0.3922 BTC",
    valorBrl: "R$ 119.118",
    data: "02/04/2026",
    cliente: "Holding Nacional",
    status: "Confirmada",
  },
];

const metrics = [
  {
    title: "Total Clientes",
    value: "24",
    icon: Users,
    change: "+3 este mês",
    positive: true,
  },
  {
    title: "Volume BTC",
    value: "12.847 BTC",
    icon: Bitcoin,
    change: "+8.4% vs mês anterior",
    positive: true,
  },
  {
    title: "Transações/Mês",
    value: "342",
    icon: ArrowLeftRight,
    change: "+42 este mês",
    positive: true,
  },
  {
    title: "Receita Líquida",
    value: "R$ 48.920",
    icon: TrendingUp,
    change: "+12.3% vs mês anterior",
    positive: true,
  },
];

const statusColors: Record<string, string> = {
  Confirmada: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Pendente: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Falha: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card
              data-ocid={`dashboard.${metric.title.toLowerCase().replace(/\s+/g, "_")}.card`}
              className="bg-card border-border hover:border-primary/30 transition-colors shadow-card"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <metric.icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-display font-bold text-foreground">
                  {metric.value}
                </div>
                <p
                  className={`text-xs mt-1 ${
                    metric.positive ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {metric.change}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
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
                      tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
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
                        `R$ ${value.toLocaleString("pt-BR")}`,
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
                  {recentTransactions.map((tx, i) => (
                    <tr
                      key={tx.hash}
                      data-ocid={`dashboard.transactions.item.${i + 1}`}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                        ...{tx.hash}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={
                            tx.tipo === "Entrada"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs"
                              : "bg-red-500/15 text-red-400 border-red-500/30 text-xs"
                          }
                        >
                          {tx.tipo}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-foreground">
                        {tx.valorBtc}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold text-foreground">
                        {tx.valorBrl}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {tx.cliente}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusColors[tx.status]}`}
                        >
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
