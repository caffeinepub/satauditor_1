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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Info, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { BusinessRole } from "../backend.d";
import type { UserProfile } from "../backend.d";

interface Transacao {
  id: number;
  hash: string;
  tipo: "Entrada" | "Saída";
  valorBtc: number;
  valorBrl: number;
  data: string;
  categoria: string;
  cliente: string;
  status: "Confirmada" | "Pendente" | "Falha";
}

const transacoes: Transacao[] = [
  {
    id: 1,
    hash: "3a8f2c1d9e4b7f6a",
    tipo: "Entrada",
    valorBtc: 0.2847,
    valorBrl: 86400,
    data: "04/04/2026",
    categoria: "Receita de Serviço",
    cliente: "TechFin Brasil",
    status: "Confirmada",
  },
  {
    id: 2,
    hash: "7b3e1f5a0c2d9e8b",
    tipo: "Saída",
    valorBtc: 0.0512,
    valorBrl: 15540,
    data: "04/04/2026",
    categoria: "Taxa de Operação",
    cliente: "Mercado Digital",
    status: "Confirmada",
  },
  {
    id: 3,
    hash: "9d2c4b8e1f3a7c5d",
    tipo: "Entrada",
    valorBtc: 0.1203,
    valorBrl: 36511,
    data: "03/04/2026",
    categoria: "Assinatura Mensal",
    cliente: "CriptoVault",
    status: "Confirmada",
  },
  {
    id: 4,
    hash: "2e9a7f3c5d1b4e8f",
    tipo: "Saída",
    valorBtc: 0.0081,
    valorBrl: 2460,
    data: "03/04/2026",
    categoria: "Reembolso",
    cliente: "StartupPay",
    status: "Pendente",
  },
  {
    id: 5,
    hash: "6c1b4d8f2a9e3c7d",
    tipo: "Entrada",
    valorBtc: 0.3922,
    valorBrl: 119118,
    data: "02/04/2026",
    categoria: "Receita de Serviço",
    cliente: "Holding Nacional",
    status: "Confirmada",
  },
  {
    id: 6,
    hash: "8f5a2e7d4c1b9e3a",
    tipo: "Entrada",
    valorBtc: 0.0444,
    valorBrl: 13482,
    data: "02/04/2026",
    categoria: "Consultoria",
    cliente: "FintechRedes Brasil",
    status: "Confirmada",
  },
  {
    id: 7,
    hash: "4d7c1f9b2e5a8f3c",
    tipo: "Saída",
    valorBtc: 0.11,
    valorBrl: 33408,
    data: "01/04/2026",
    categoria: "Pagamento Fornecedor",
    cliente: "TechFin Brasil",
    status: "Confirmada",
  },
  {
    id: 8,
    hash: "1a5e8c3d7f2b4e9a",
    tipo: "Entrada",
    valorBtc: 0.089,
    valorBrl: 27030,
    data: "01/04/2026",
    categoria: "Assinatura Mensal",
    cliente: "Mercado Digital",
    status: "Confirmada",
  },
  {
    id: 9,
    hash: "5b9d3e1c8f4a7d2b",
    tipo: "Entrada",
    valorBtc: 0.2155,
    valorBrl: 65461,
    data: "31/03/2026",
    categoria: "Receita de Serviço",
    cliente: "CriptoVault",
    status: "Confirmada",
  },
  {
    id: 10,
    hash: "0c4f7a2e9d1b5c8f",
    tipo: "Saída",
    valorBtc: 0.032,
    valorBrl: 9720,
    data: "31/03/2026",
    categoria: "Taxa de Operação",
    cliente: "StartupPay",
    status: "Falha",
  },
  {
    id: 11,
    hash: "3e8b1d5c9f2a6e4d",
    tipo: "Entrada",
    valorBtc: 0.167,
    valorBrl: 50728,
    data: "30/03/2026",
    categoria: "Consultoria",
    cliente: "Holding Nacional",
    status: "Confirmada",
  },
  {
    id: 12,
    hash: "7a2f5d0e4c8b1f9d",
    tipo: "Saída",
    valorBtc: 0.025,
    valorBrl: 7595,
    data: "30/03/2026",
    categoria: "Reembolso",
    cliente: "FintechRedes Brasil",
    status: "Confirmada",
  },
  {
    id: 13,
    hash: "9e4d2b6f1c7a3e8b",
    tipo: "Entrada",
    valorBtc: 0.45,
    valorBrl: 136710,
    data: "29/03/2026",
    categoria: "Assinatura Mensal",
    cliente: "TechFin Brasil",
    status: "Confirmada",
  },
  {
    id: 14,
    hash: "2c7a9f4e1d5b8c3a",
    tipo: "Saída",
    valorBtc: 0.014,
    valorBrl: 4252,
    data: "28/03/2026",
    categoria: "Pagamento Fornecedor",
    cliente: "Mercado Digital",
    status: "Pendente",
  },
  {
    id: 15,
    hash: "6f1e8b5a3d9c2f7e",
    tipo: "Entrada",
    valorBtc: 0.098,
    valorBrl: 29772,
    data: "28/03/2026",
    categoria: "Receita de Serviço",
    cliente: "CriptoVault",
    status: "Confirmada",
  },
];

// Mock client name mapping for demo — first 3 transactions assigned to
// the "client" persona so the filtered view is non-empty
const CLIENT_MOCK_TRANSACTIONS = [1, 3, 5, 9, 11];

const categorias = [...new Set(transacoes.map((t) => t.categoria))];

const categoriaColors: Record<string, string> = {
  "Receita de Serviço": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Taxa de Operação": "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "Assinatura Mensal": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Reembolso: "bg-red-500/15 text-red-400 border-red-500/30",
  Consultoria: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Pagamento Fornecedor":
    "bg-orange-500/15 text-orange-400 border-orange-500/30",
};

const statusColors: Record<string, string> = {
  Confirmada: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Pendente: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Falha: "bg-red-500/20 text-red-400 border-red-500/30",
};

interface TransacoesPageProps {
  profile: UserProfile;
}

export default function TransacoesPage({ profile }: TransacoesPageProps) {
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterCategoria, setFilterCategoria] = useState("todas");
  const [filterPeriodo, setFilterPeriodo] = useState("todos");

  const isClient = profile.businessRole === BusinessRole.client;

  // For client role: show only mock transactions assigned to this client persona
  const baseTransacoes = isClient
    ? transacoes.filter((t) => CLIENT_MOCK_TRANSACTIONS.includes(t.id))
    : transacoes;

  const filtered = baseTransacoes.filter((t) => {
    const matchSearch = isClient
      ? t.hash.includes(search.toLowerCase())
      : t.hash.includes(search.toLowerCase()) ||
        t.cliente.toLowerCase().includes(search.toLowerCase());
    const matchTipo =
      filterTipo === "todos" ||
      (filterTipo === "entrada" && t.tipo === "Entrada") ||
      (filterTipo === "saida" && t.tipo === "Saída");
    const matchCat =
      filterCategoria === "todas" || t.categoria === filterCategoria;
    return matchSearch && matchTipo && matchCat;
  });

  const totalEntradas = filtered
    .filter((t) => t.tipo === "Entrada")
    .reduce((acc, t) => acc + t.valorBrl, 0);
  const totalSaidas = filtered
    .filter((t) => t.tipo === "Saída")
    .reduce((acc, t) => acc + t.valorBrl, 0);

  // Number of visible columns depends on role
  const colSpan = isClient ? 7 : 8;

  return (
    <div className="p-6 space-y-6">
      {/* Client-only banner */}
      {isClient && (
        <div
          data-ocid="transacoes.client.panel"
          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm"
        >
          <Info className="h-4 w-4 flex-shrink-0" />
          Exibindo suas transações vinculadas à sua conta.
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Entradas</p>
          <p className="text-lg font-display font-bold text-emerald-400">
            R$ {totalEntradas.toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Saídas</p>
          <p className="text-lg font-display font-bold text-red-400">
            R$ {totalSaidas.toLocaleString("pt-BR")}
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
            R$ {(totalEntradas - totalSaidas).toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-ocid="transacoes.search_input"
            placeholder={
              isClient ? "Buscar por hash..." : "Buscar hash ou cliente..."
            }
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
        <Select value={filterPeriodo} onValueChange={setFilterPeriodo}>
          <SelectTrigger
            data-ocid="transacoes.select"
            className="w-36 bg-card border-border"
          >
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todo período</SelectItem>
            <SelectItem value="hoje">Hoje</SelectItem>
            <SelectItem value="semana">Esta semana</SelectItem>
            <SelectItem value="mes">Este mês</SelectItem>
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
                  <TableHead className="text-right text-muted-foreground">
                    Valor BRL
                  </TableHead>
                  <TableHead className="text-muted-foreground">Data</TableHead>
                  <TableHead className="text-muted-foreground">
                    Categoria
                  </TableHead>
                  {!isClient && (
                    <TableHead className="text-muted-foreground">
                      Cliente
                    </TableHead>
                  )}
                  <TableHead className="text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      data-ocid="transacoes.empty_state"
                      colSpan={colSpan}
                      className="text-center text-muted-foreground py-12"
                    >
                      Nenhuma transação encontrada.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((t, i) => (
                  <motion.tr
                    key={t.id}
                    data-ocid={`transacoes.item.${i + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.025 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {t.hash.slice(0, 8)}...{t.hash.slice(-4)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          t.tipo === "Entrada"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-red-500/15 text-red-400 border-red-500/30"
                        }`}
                      >
                        {t.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-foreground">
                      {t.valorBtc.toFixed(4)} BTC
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-foreground">
                      R$ {t.valorBrl.toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {t.data}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${categoriaColors[t.categoria] || "bg-muted/30 text-muted-foreground border-border"}`}
                      >
                        {t.categoria}
                      </Badge>
                    </TableCell>
                    {!isClient && (
                      <TableCell className="text-sm text-muted-foreground">
                        {t.cliente}
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${statusColors[t.status]}`}
                      >
                        {t.status}
                      </Badge>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
