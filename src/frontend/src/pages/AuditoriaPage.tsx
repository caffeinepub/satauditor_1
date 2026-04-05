import { Badge } from "@/components/ui/badge";
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
import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface EntradaAuditoria {
  id: number;
  dataHora: string;
  usuario: string;
  modulo: string;
  acao: "CREATE" | "UPDATE" | "DELETE" | "VIEW";
  detalhes: string;
}

const auditLog: EntradaAuditoria[] = [
  {
    id: 1,
    dataHora: "04/04/2026 14:32:15",
    usuario: "carlos@techfin.com",
    modulo: "Clientes",
    acao: "CREATE",
    detalhes: "Novo cliente criado: FintechRedes Brasil",
  },
  {
    id: 2,
    dataHora: "04/04/2026 13:45:08",
    usuario: "admin@satauditor.com",
    modulo: "Transações",
    acao: "VIEW",
    detalhes: "Listagem de transações filtrada por: Abr/2026",
  },
  {
    id: 3,
    dataHora: "04/04/2026 12:18:44",
    usuario: "contadora@criptovault.com",
    modulo: "Relatórios",
    acao: "VIEW",
    detalhes: "DRE gerado: Março/2026",
  },
  {
    id: 4,
    dataHora: "04/04/2026 11:55:30",
    usuario: "admin@satauditor.com",
    modulo: "Assinaturas",
    acao: "UPDATE",
    detalhes: "Plano alterado: TechFin Brasil → Enterprise",
  },
  {
    id: 5,
    dataHora: "04/04/2026 10:22:17",
    usuario: "carlos@techfin.com",
    modulo: "Transações",
    acao: "CREATE",
    detalhes: "Transação registrada: 0.2847 BTC entrada",
  },
  {
    id: 6,
    dataHora: "03/04/2026 18:41:02",
    usuario: "joao@mercadodigital.com",
    modulo: "Contabilidade",
    acao: "VIEW",
    detalhes: "Plano de Contas consultado",
  },
  {
    id: 7,
    dataHora: "03/04/2026 17:30:55",
    usuario: "admin@satauditor.com",
    modulo: "Clientes",
    acao: "UPDATE",
    detalhes: "Cliente atualizado: Mercado Digital — email alterado",
  },
  {
    id: 8,
    dataHora: "03/04/2026 16:12:43",
    usuario: "contadora@criptovault.com",
    modulo: "Relatórios",
    acao: "VIEW",
    detalhes: "Balanço Patrimonial: Fev/2026",
  },
  {
    id: 9,
    dataHora: "03/04/2026 15:08:29",
    usuario: "tech@startuppay.io",
    modulo: "Assinaturas",
    acao: "VIEW",
    detalhes: "Detalhes da assinatura Básico visualizados",
  },
  {
    id: 10,
    dataHora: "03/04/2026 14:22:11",
    usuario: "admin@satauditor.com",
    modulo: "Clientes",
    acao: "DELETE",
    detalhes: "Cliente removido: OldBusiness Ltda (inativo há 180 dias)",
  },
  {
    id: 11,
    dataHora: "02/04/2026 19:45:33",
    usuario: "carlos@techfin.com",
    modulo: "Transações",
    acao: "VIEW",
    detalhes: "Transação detalhada: hash 6c1b4d8f2a",
  },
  {
    id: 12,
    dataHora: "02/04/2026 17:14:50",
    usuario: "admin@satauditor.com",
    modulo: "Configurações",
    acao: "UPDATE",
    detalhes: "Configurações de sistema atualizadas",
  },
  {
    id: 13,
    dataHora: "02/04/2026 15:33:27",
    usuario: "joao@mercadodigital.com",
    modulo: "Contabilidade",
    acao: "CREATE",
    detalhes: "Lançamento criado: NF 1045 — Consultoria",
  },
  {
    id: 14,
    dataHora: "02/04/2026 13:22:14",
    usuario: "admin@satauditor.com",
    modulo: "Usuários",
    acao: "CREATE",
    detalhes: "Novo usuário criado: contadora@criptovault.com",
  },
  {
    id: 15,
    dataHora: "01/04/2026 20:11:08",
    usuario: "carlos@techfin.com",
    modulo: "Relatórios",
    acao: "VIEW",
    detalhes: "Fluxo de Caixa exportado: PDF Q1/2026",
  },
  {
    id: 16,
    dataHora: "01/04/2026 18:44:35",
    usuario: "contadora@criptovault.com",
    modulo: "Transações",
    acao: "CREATE",
    detalhes: "Transação em lote: 12 entradas importadas",
  },
  {
    id: 17,
    dataHora: "01/04/2026 16:20:12",
    usuario: "admin@satauditor.com",
    modulo: "Assinaturas",
    acao: "UPDATE",
    detalhes: "Vencimento renovado: CriptoVault — Abr/2026",
  },
  {
    id: 18,
    dataHora: "01/04/2026 14:58:44",
    usuario: "tech@startuppay.io",
    modulo: "Clientes",
    acao: "UPDATE",
    detalhes: "Endereço atualizado: StartupPay Tecnologia",
  },
  {
    id: 19,
    dataHora: "01/04/2026 12:31:00",
    usuario: "joao@mercadodigital.com",
    modulo: "Contabilidade",
    acao: "UPDATE",
    detalhes: "Lançamento corrigido: ID 00234 — valor ajustado",
  },
  {
    id: 20,
    dataHora: "31/03/2026 22:00:01",
    usuario: "sistema",
    modulo: "Sistema",
    acao: "CREATE",
    detalhes: "Fechamento automático Março/2026 — 48 transações processadas",
  },
  {
    id: 21,
    dataHora: "31/03/2026 21:45:30",
    usuario: "admin@satauditor.com",
    modulo: "Relatórios",
    acao: "CREATE",
    detalhes: "DRE Março/2026 finalizado e publicado",
  },
  {
    id: 22,
    dataHora: "31/03/2026 19:14:22",
    usuario: "carlos@techfin.com",
    modulo: "Transações",
    acao: "VIEW",
    detalhes: "Listagem completa Março/2026 exportada",
  },
];

const acaoColors: Record<string, string> = {
  CREATE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  UPDATE: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
  VIEW: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const modulos = [...new Set(auditLog.map((e) => e.modulo))];

export default function AuditoriaPage() {
  const [search, setSearch] = useState("");
  const [filterAcao, setFilterAcao] = useState("todas");
  const [filterModulo, setFilterModulo] = useState("todos");

  const filtered = auditLog.filter((e) => {
    const matchSearch =
      e.usuario.toLowerCase().includes(search.toLowerCase()) ||
      e.detalhes.toLowerCase().includes(search.toLowerCase());
    const matchAcao = filterAcao === "todas" || e.acao === filterAcao;
    const matchModulo = filterModulo === "todos" || e.modulo === filterModulo;
    return matchSearch && matchAcao && matchModulo;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["CREATE", "UPDATE", "DELETE", "VIEW"] as const).map((acao) => (
          <div
            key={acao}
            className="bg-card border border-border rounded-lg p-3"
          >
            <p className="text-xs text-muted-foreground mb-1">{acao}</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-display font-bold text-foreground">
                {auditLog.filter((e) => e.acao === acao).length}
              </p>
              <Badge
                variant="outline"
                className={`text-xs ${acaoColors[acao]}`}
              >
                {acao}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-ocid="auditoria.search_input"
            placeholder="Buscar usuário ou ação..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <Select value={filterAcao} onValueChange={setFilterAcao}>
          <SelectTrigger
            data-ocid="auditoria.select"
            className="w-36 bg-card border-border"
          >
            <SelectValue placeholder="Ação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as ações</SelectItem>
            <SelectItem value="CREATE">CREATE</SelectItem>
            <SelectItem value="UPDATE">UPDATE</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
            <SelectItem value="VIEW">VIEW</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterModulo} onValueChange={setFilterModulo}>
          <SelectTrigger
            data-ocid="auditoria.select"
            className="w-44 bg-card border-border"
          >
            <SelectValue placeholder="Módulo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os módulos</SelectItem>
            {modulos.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="bg-card border-border shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">
                    Data/Hora
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Usuário
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Módulo
                  </TableHead>
                  <TableHead className="text-muted-foreground">Ação</TableHead>
                  <TableHead className="text-muted-foreground">
                    Detalhes
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      data-ocid="auditoria.empty_state"
                      colSpan={5}
                      className="text-center text-muted-foreground py-12"
                    >
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((entry, i) => (
                  <motion.tr
                    key={entry.id}
                    data-ocid={`auditoria.item.${i + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {entry.dataHora}
                    </TableCell>
                    <TableCell className="text-xs text-foreground max-w-32 truncate">
                      {entry.usuario}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {entry.modulo}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs font-mono ${acaoColors[entry.acao]}`}
                      >
                        {entry.acao}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs">
                      <span className="line-clamp-2">{entry.detalhes}</span>
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
