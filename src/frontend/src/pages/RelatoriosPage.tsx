import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Download,
  FileText,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { BusinessRole } from "../backend.d";
import type {
  BalanceSheet,
  CashFlow,
  IncomeStatement,
  UserProfile,
} from "../backend.d";
import { useActor } from "../hooks/useActor";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function formatBtc(value: bigint): string {
  return `${(Number(value) / 100_000_000).toFixed(8)} BTC`;
}

function formatBtcSigned(value: bigint): { text: string; positive: boolean } {
  const n = Number(value) / 100_000_000;
  return { text: `${n.toFixed(8)} BTC`, positive: n >= 0 };
}

const SKELETON_ROWS = ["sk1", "sk2", "sk3", "sk4"] as const;

function ReportSkeleton() {
  return (
    <div data-ocid="relatorios.loading_state" className="space-y-2">
      {SKELETON_ROWS.map((k) => (
        <div key={k} className="flex justify-between px-4 py-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  );
}

function EmptyReport() {
  return (
    <div
      data-ocid="relatorios.empty_state"
      className="flex flex-col items-center justify-center py-16 gap-3 text-center"
    >
      <div className="rounded-full bg-muted/40 p-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-base font-semibold text-foreground">
        Nenhum dado para o período
      </p>
      <p className="text-sm text-muted-foreground max-w-xs">
        Não há lançamentos contábeis registrados para este período. Adicione
        lançamentos na aba Contabilidade para gerar relatórios.
      </p>
    </div>
  );
}

// ─── Balanço Patrimonial ───────────────────────────────────────────────────────

function BalancoTab({
  clientId,
  mesIndex,
  ano,
}: {
  clientId: bigint;
  mesIndex: number;
  ano: number;
}) {
  const { actor, isFetching } = useActor();

  const { data, isLoading } = useQuery<BalanceSheet>({
    queryKey: ["balanceSheet", clientId.toString(), mesIndex, ano],
    queryFn: async () => {
      if (!actor) throw new Error("actor not ready");
      return (actor as any).getBalanceSheet(
        clientId,
        BigInt(mesIndex + 1),
        BigInt(ano),
      );
    },
    enabled: !!actor && !isFetching,
  });

  const isEmpty =
    !isLoading &&
    data &&
    data.assets.length === 0 &&
    data.liabilities.length === 0 &&
    data.equity.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {isLoading ? (
        <Card className="bg-card border-border shadow-card">
          <CardContent className="pt-4">
            <ReportSkeleton />
          </CardContent>
        </Card>
      ) : isEmpty ? (
        <Card className="bg-card border-border shadow-card">
          <CardContent>
            <EmptyReport />
          </CardContent>
        </Card>
      ) : data ? (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Ativos */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Ativos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs pl-4">
                      Conta
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs text-right pr-4">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.assets.map((line, i) => (
                    <TableRow
                      key={line.accountCode}
                      data-ocid={`relatorios.balanco.item.${i + 1}`}
                      className="border-border/50 hover:bg-muted/20"
                    >
                      <TableCell className="pl-4 text-sm">
                        <span className="font-mono text-xs text-muted-foreground mr-2">
                          {line.accountCode}
                        </span>
                        {line.accountName}
                      </TableCell>
                      <TableCell className="text-right pr-4 font-mono text-xs text-foreground">
                        {formatBtc(line.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter className="bg-muted/10">
                  <TableRow className="border-border">
                    <TableCell className="pl-4 font-semibold text-sm">
                      Total Ativos
                    </TableCell>
                    <TableCell className="text-right pr-4 font-mono text-sm font-bold text-blue-400">
                      {formatBtc(data.totalAssets)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          {/* Passivos + Patrimônio */}
          <div className="space-y-4">
            <Card className="bg-card border-border shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  Passivos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableBody>
                    {data.liabilities.length === 0 ? (
                      <TableRow>
                        <TableCell className="text-center text-sm text-muted-foreground py-4">
                          Nenhum passivo
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.liabilities.map((line, i) => (
                        <TableRow
                          key={line.accountCode}
                          data-ocid={`relatorios.passivos.item.${i + 1}`}
                          className="border-border/50 hover:bg-muted/20"
                        >
                          <TableCell className="pl-4 text-sm">
                            <span className="font-mono text-xs text-muted-foreground mr-2">
                              {line.accountCode}
                            </span>
                            {line.accountName}
                          </TableCell>
                          <TableCell className="text-right pr-4 font-mono text-xs text-foreground">
                            {formatBtc(line.total)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  <TableFooter className="bg-muted/10">
                    <TableRow className="border-border">
                      <TableCell className="pl-4 font-semibold text-sm">
                        Total Passivos
                      </TableCell>
                      <TableCell className="text-right pr-4 font-mono text-sm font-bold text-red-400">
                        {formatBtc(data.totalLiabilities)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display">
                  Patrimônio Líquido
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableBody>
                    {data.equity.length === 0 ? (
                      <TableRow>
                        <TableCell className="text-center text-sm text-muted-foreground py-4">
                          Nenhum patrimônio
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.equity.map((line, i) => (
                        <TableRow
                          key={line.accountCode}
                          data-ocid={`relatorios.equity.item.${i + 1}`}
                          className="border-border/50 hover:bg-muted/20"
                        >
                          <TableCell className="pl-4 text-sm">
                            <span className="font-mono text-xs text-muted-foreground mr-2">
                              {line.accountCode}
                            </span>
                            {line.accountName}
                          </TableCell>
                          <TableCell className="text-right pr-4 font-mono text-xs text-foreground">
                            {formatBtc(line.total)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  <TableFooter className="bg-muted/10">
                    <TableRow className="border-border">
                      <TableCell className="pl-4 font-semibold text-sm">
                        Total Patrimônio
                      </TableCell>
                      <TableCell className="text-right pr-4 font-mono text-sm font-bold text-amber-400">
                        {formatBtc(data.totalEquity)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}

// ─── DRE ──────────────────────────────────────────────────────────────────────

function DreTab({
  clientId,
  mesIndex,
  ano,
}: {
  clientId: bigint;
  mesIndex: number;
  ano: number;
}) {
  const { actor, isFetching } = useActor();

  const { data, isLoading } = useQuery<IncomeStatement>({
    queryKey: ["incomeStatement", clientId.toString(), mesIndex, ano],
    queryFn: async () => {
      if (!actor) throw new Error("actor not ready");
      return (actor as any).getIncomeStatement(
        clientId,
        BigInt(mesIndex + 1),
        BigInt(ano),
      );
    },
    enabled: !!actor && !isFetching,
  });

  const isEmpty =
    !isLoading &&
    data &&
    data.revenues.length === 0 &&
    data.expenses.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {isLoading ? (
        <Card className="bg-card border-border shadow-card">
          <CardContent className="pt-4">
            <ReportSkeleton />
          </CardContent>
        </Card>
      ) : isEmpty ? (
        <Card className="bg-card border-border shadow-card">
          <CardContent>
            <EmptyReport />
          </CardContent>
        </Card>
      ) : data ? (
        <Card className="bg-card border-border shadow-card">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground pl-4">
                    Conta
                  </TableHead>
                  <TableHead className="text-muted-foreground text-right pr-4">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Receitas */}
                <TableRow className="bg-emerald-500/5 border-border">
                  <TableCell
                    colSpan={2}
                    className="pl-4 py-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider"
                  >
                    Receitas
                  </TableCell>
                </TableRow>
                {data.revenues.map((line, i) => (
                  <TableRow
                    key={line.accountCode}
                    data-ocid={`relatorios.dre.item.${i + 1}`}
                    className="border-border/50 hover:bg-muted/20"
                  >
                    <TableCell className="pl-6 text-sm">
                      <span className="font-mono text-xs text-muted-foreground mr-2">
                        {line.accountCode}
                      </span>
                      {line.accountName}
                    </TableCell>
                    <TableCell className="text-right pr-4 font-mono text-xs text-emerald-400">
                      {formatBtc(line.total)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-emerald-500/5 border-border">
                  <TableCell className="pl-4 font-semibold text-sm">
                    Total Receitas
                  </TableCell>
                  <TableCell className="text-right pr-4 font-mono text-sm font-bold text-emerald-400">
                    {formatBtc(data.totalRevenue)}
                  </TableCell>
                </TableRow>

                {/* Despesas */}
                <TableRow className="bg-red-500/5 border-border">
                  <TableCell
                    colSpan={2}
                    className="pl-4 py-2 text-xs font-semibold text-red-400 uppercase tracking-wider"
                  >
                    Despesas
                  </TableCell>
                </TableRow>
                {data.expenses.map((line, i) => (
                  <TableRow
                    key={line.accountCode}
                    data-ocid={`relatorios.dre.expense.item.${i + 1}`}
                    className="border-border/50 hover:bg-muted/20"
                  >
                    <TableCell className="pl-6 text-sm">
                      <span className="font-mono text-xs text-muted-foreground mr-2">
                        {line.accountCode}
                      </span>
                      {line.accountName}
                    </TableCell>
                    <TableCell className="text-right pr-4 font-mono text-xs text-red-400">
                      {formatBtc(line.total)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-red-500/5 border-border">
                  <TableCell className="pl-4 font-semibold text-sm">
                    Total Despesas
                  </TableCell>
                  <TableCell className="text-right pr-4 font-mono text-sm font-bold text-red-400">
                    {formatBtc(data.totalExpenses)}
                  </TableCell>
                </TableRow>
              </TableBody>
              <TableFooter className="bg-muted/20">
                <TableRow className="border-border">
                  <TableCell className="pl-4 font-bold text-sm">
                    Lucro / Prejuízo Líquido
                  </TableCell>
                  <TableCell
                    className={`text-right pr-4 font-mono text-sm font-bold ${
                      formatBtcSigned(data.netIncome).positive
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatBtcSigned(data.netIncome).text}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </motion.div>
  );
}

// ─── Fluxo de Caixa ───────────────────────────────────────────────────────────

function FluxoTab({
  clientId,
  mesIndex,
  ano,
}: {
  clientId: bigint;
  mesIndex: number;
  ano: number;
}) {
  const { actor, isFetching } = useActor();

  const { data, isLoading } = useQuery<CashFlow>({
    queryKey: ["cashFlow", clientId.toString(), mesIndex, ano],
    queryFn: async () => {
      if (!actor) throw new Error("actor not ready");
      return (actor as any).getCashFlow(
        clientId,
        BigInt(mesIndex + 1),
        BigInt(ano),
      );
    },
    enabled: !!actor && !isFetching,
  });

  const isEmpty =
    !isLoading &&
    data &&
    data.inflows.length === 0 &&
    data.outflows.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {isLoading ? (
        <Card className="bg-card border-border shadow-card">
          <CardContent className="pt-4">
            <ReportSkeleton />
          </CardContent>
        </Card>
      ) : isEmpty ? (
        <Card className="bg-card border-border shadow-card">
          <CardContent>
            <EmptyReport />
          </CardContent>
        </Card>
      ) : data ? (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Entradas */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Entradas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {data.inflows.map((line, i) => (
                    <TableRow
                      key={`inflow-${line.description}-${i}`}
                      data-ocid={`relatorios.fluxo.inflow.item.${i + 1}`}
                      className="border-border/50 hover:bg-muted/20"
                    >
                      <TableCell className="pl-4 text-sm">
                        {line.description}
                      </TableCell>
                      <TableCell className="text-right pr-4 font-mono text-xs text-emerald-400">
                        {formatBtc(line.value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter className="bg-muted/10">
                  <TableRow className="border-border">
                    <TableCell className="pl-4 font-semibold text-sm">
                      Total Entradas
                    </TableCell>
                    <TableCell className="text-right pr-4 font-mono text-sm font-bold text-emerald-400">
                      {formatBtc(data.totalInflows)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          {/* Saídas */}
          <Card className="bg-card border-border shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-400" />
                Saídas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {data.outflows.map((line, i) => (
                    <TableRow
                      key={`outflow-${line.description}-${i}`}
                      data-ocid={`relatorios.fluxo.outflow.item.${i + 1}`}
                      className="border-border/50 hover:bg-muted/20"
                    >
                      <TableCell className="pl-4 text-sm">
                        {line.description}
                      </TableCell>
                      <TableCell className="text-right pr-4 font-mono text-xs text-red-400">
                        {formatBtc(line.value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter className="bg-muted/10">
                  <TableRow className="border-border">
                    <TableCell className="pl-4 font-semibold text-sm">
                      Total Saídas
                    </TableCell>
                    <TableCell className="text-right pr-4 font-mono text-sm font-bold text-red-400">
                      {formatBtc(data.totalOutflows)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          {/* Net */}
          <Card className="md:col-span-2 bg-card border-border shadow-card">
            <CardContent className="flex items-center justify-between py-4 px-6">
              <span className="font-display font-semibold text-sm">
                Fluxo de Caixa Líquido
              </span>
              <Separator orientation="vertical" className="h-5" />
              <span
                className={`font-mono text-lg font-bold ${
                  formatBtcSigned(data.netCashFlow).positive
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {formatBtcSigned(data.netCashFlow).text}
              </span>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </motion.div>
  );
}

// ─── Page Entry ───────────────────────────────────────────────────────────────

interface RelatoriosPageProps {
  profile: UserProfile;
}

export default function RelatoriosPage({ profile }: RelatoriosPageProps) {
  const [mes, setMes] = useState(String(new Date().getMonth()));
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const [activeTab, setActiveTab] = useState("balanco");

  const clientId =
    profile.businessRole === BusinessRole.admin ? 1n : (profile.clientId ?? 1n);

  const mesIndex = Number.parseInt(mes);
  const anoNum = Number.parseInt(ano);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <BarChart3 className="h-5 w-5" />
        <span className="text-sm">Relatórios Financeiros</span>
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Período:</span>
        <Select value={mes} onValueChange={setMes}>
          <SelectTrigger
            data-ocid="relatorios.select"
            className="w-36 bg-card border-border"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MESES.map((m, i) => (
              <SelectItem key={m} value={String(i)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={ano} onValueChange={setAno}>
          <SelectTrigger
            data-ocid="relatorios.select"
            className="w-24 bg-card border-border"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
          </SelectContent>
        </Select>
        <Button
          data-ocid="relatorios.secondary_button"
          variant="outline"
          size="sm"
          className="border-border"
          disabled
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        data-ocid="relatorios.tab"
      >
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="balanco" data-ocid="relatorios.tab">
            Balanço Patrimonial
          </TabsTrigger>
          <TabsTrigger value="dre" data-ocid="relatorios.tab">
            DRE
          </TabsTrigger>
          <TabsTrigger value="fluxo" data-ocid="relatorios.tab">
            Fluxo de Caixa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balanco" className="mt-4">
          <BalancoTab clientId={clientId} mesIndex={mesIndex} ano={anoNum} />
        </TabsContent>

        <TabsContent value="dre" className="mt-4">
          <DreTab clientId={clientId} mesIndex={mesIndex} ano={anoNum} />
        </TabsContent>

        <TabsContent value="fluxo" className="mt-4">
          <FluxoTab clientId={clientId} mesIndex={mesIndex} ano={anoNum} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
