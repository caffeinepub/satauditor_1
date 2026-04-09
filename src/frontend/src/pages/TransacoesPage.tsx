import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftRight, Download, Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { PageName } from "../App";
import { useActor } from "../hooks/useActor";
import {
  type Transaction,
  TransactionType,
  type UserProfile,
} from "../types/domain";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  return new Date(ms).toLocaleDateString("pt-BR");
}

function satoshisToFloat(sats: bigint): number {
  return Number(sats) / 1e8;
}

function getTransactionTypeLabel(tx: Transaction): "Entrada" | "Saída" {
  return tx.transactionType === TransactionType.income ? "Entrada" : "Saída";
}

function getCategoryLabel(tx: Transaction): string {
  const map: Record<string, string> = {
    revenue: "Receita",
    expense: "Despesa",
    asset: "Ativo",
    liability: "Passivo",
    equity: "Patrimônio",
  };
  return map[tx.category] ?? tx.category;
}

const SKELETON_ROWS = ["sk1", "sk2", "sk3", "sk4", "sk5"] as const;

const categoryColors: Record<string, string> = {
  Receita: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Despesa: "bg-red-500/15 text-red-400 border-red-500/30",
  Ativo: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Passivo: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Patrimônio: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

// ─── Page ────────────────────────────────────────────────────────────────────

interface TransacoesPageProps {
  profile: UserProfile;
  onNavigate?: (page: PageName) => void;
}

export default function TransacoesPage({
  profile,
  onNavigate,
}: TransacoesPageProps) {
  const { actor, isFetching } = useActor();
  const isDemoMode = profile.demoMode === true;

  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterCategoria, setFilterCategoria] = useState("todas");

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTransactions();
    },
    enabled: !!actor && !isFetching && !isDemoMode,
  });

  const categorias = useMemo(() => {
    const set = new Set(transactions.map(getCategoryLabel));
    return Array.from(set);
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const tipo = getTransactionTypeLabel(t);
      const categoria = getCategoryLabel(t);
      const matchSearch =
        (t.hash ?? "").toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchTipo =
        filterTipo === "todos" ||
        (filterTipo === "entrada" && tipo === "Entrada") ||
        (filterTipo === "saida" && tipo === "Saída");
      const matchCat =
        filterCategoria === "todas" || categoria === filterCategoria;
      return matchSearch && matchTipo && matchCat;
    });
  }, [transactions, search, filterTipo, filterCategoria]);

  const totalEntradas = filtered
    .filter((t) => t.transactionType === TransactionType.income)
    .reduce((acc, t) => acc + Number(t.value ?? 0n), 0);
  const totalSaidas = filtered
    .filter((t) => t.transactionType === TransactionType.expense)
    .reduce((acc, t) => acc + Number(t.value ?? 0n), 0);

  const colSpan = 7;

  // Demo mode: show prompt to activate company
  if (isDemoMode) {
    return (
      <div className="p-6 space-y-6">
        <div
          data-ocid="transacoes.demo.banner"
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-5 py-4 rounded-xl bg-amber-500/10 border border-amber-500/25"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <ArrowLeftRight className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-400">
                Você está no modo demonstração
              </p>
              <p className="text-xs text-amber-400/80 mt-0.5">
                Cadastre os dados da sua empresa para ver suas transações reais.
              </p>
            </div>
          </div>
          {onNavigate && (
            <Button
              size="sm"
              data-ocid="transacoes.demo.activate_btn"
              onClick={() => onNavigate("minha-empresa")}
              className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold shrink-0"
            >
              Cadastrar Empresa
            </Button>
          )}
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ArrowLeftRight className="h-12 w-12 text-muted-foreground/20 mb-4" />
          <p className="text-base font-medium text-muted-foreground">
            Nenhuma transação disponível no modo demonstração.
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Ative sua conta para começar a registrar transações reais.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Entradas</p>
          <p className="text-lg font-display font-bold text-emerald-400">
            {satoshisToFloat(BigInt(totalEntradas)).toFixed(6)} BTC
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Saídas</p>
          <p className="text-lg font-display font-bold text-red-400">
            {satoshisToFloat(BigInt(totalSaidas)).toFixed(6)} BTC
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Saldo Líquido</p>
          <p
            className={`text-lg font-display font-bold ${
              totalEntradas - totalSaidas >= 0
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {satoshisToFloat(
              BigInt(Math.abs(totalEntradas - totalSaidas)),
            ).toFixed(6)}{" "}
            BTC
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-ocid="transacoes.search_input"
            placeholder="Buscar hash ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger
            data-ocid="transacoes.select"
            className="w-36 bg-card border-border"
          >
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="entrada">Entrada</SelectItem>
            <SelectItem value="saida">Saída</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategoria} onValueChange={setFilterCategoria}>
          <SelectTrigger
            data-ocid="transacoes.select"
            className="w-48 bg-card border-border"
          >
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas categorias</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          data-ocid="transacoes.secondary_button"
          variant="outline"
          className="border-border"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Table */}
      <Card className="bg-card border-border shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">
                    Hash BTC
                  </TableHead>
                  <TableHead className="text-muted-foreground">Tipo</TableHead>
                  <TableHead className="text-right text-muted-foreground">
                    Valor BTC
                  </TableHead>
                  <TableHead className="text-muted-foreground">Data</TableHead>
                  <TableHead className="text-muted-foreground">
                    Categoria
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Descrição
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  SKELETON_ROWS.map((key) => (
                    <TableRow
                      key={key}
                      data-ocid="transacoes.loading_state"
                      className="border-border/50"
                    >
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      data-ocid="transacoes.empty_state"
                      colSpan={colSpan}
                      className="text-center text-muted-foreground py-12"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <ArrowLeftRight className="h-8 w-8 text-muted-foreground/30" />
                        <span>Nenhuma transação encontrada.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((t, i) => {
                    const tipo = getTransactionTypeLabel(t);
                    const categoria = getCategoryLabel(t);
                    return (
                      <motion.tr
                        key={t.id.toString()}
                        data-ocid={`transacoes.item.${i + 1}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.025 }}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {(t.hash ?? "").length > 12
                            ? `${(t.hash ?? "").slice(0, 8)}...${(t.hash ?? "").slice(-4)}`
                            : (t.hash ?? "—")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              tipo === "Entrada"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : "bg-red-500/15 text-red-400 border-red-500/30"
                            }`}
                          >
                            {tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-foreground">
                          {satoshisToFloat(t.value ?? 0n).toFixed(6)} BTC
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(t.date)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              categoryColors[categoria] ??
                              "bg-muted/30 text-muted-foreground border-border"
                            }`}
                          >
                            {categoria}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">
                          {t.description || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              t.confirmed
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {t.confirmed ? "Confirmada" : "Pendente"}
                          </Badge>
                        </TableCell>
                      </motion.tr>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
