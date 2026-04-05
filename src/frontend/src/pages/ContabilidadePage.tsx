import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "motion/react";

interface ContaContabil {
  codigo: string;
  conta: string;
  tipo: "Ativo" | "Passivo" | "Receita" | "Despesa" | "Patrimonio";
  saldo: number;
  nivel: number;
}

const planoDeContas: ContaContabil[] = [
  { codigo: "1", conta: "ATIVO", tipo: "Ativo", saldo: 2847650, nivel: 0 },
  {
    codigo: "1.1",
    conta: "Ativo Circulante",
    tipo: "Ativo",
    saldo: 1534200,
    nivel: 1,
  },
  {
    codigo: "1.1.1",
    conta: "Caixa e Equivalentes (BTC)",
    tipo: "Ativo",
    saldo: 892400,
    nivel: 2,
  },
  {
    codigo: "1.1.2",
    conta: "Contas a Receber",
    tipo: "Ativo",
    saldo: 641800,
    nivel: 2,
  },
  {
    codigo: "1.2",
    conta: "Ativo Não Circulante",
    tipo: "Ativo",
    saldo: 1313450,
    nivel: 1,
  },
  {
    codigo: "1.2.1",
    conta: "Imobilizado",
    tipo: "Ativo",
    saldo: 820000,
    nivel: 2,
  },
  {
    codigo: "1.2.2",
    conta: "Intangível (Software)",
    tipo: "Ativo",
    saldo: 493450,
    nivel: 2,
  },
  { codigo: "2", conta: "PASSIVO", tipo: "Passivo", saldo: 1248900, nivel: 0 },
  {
    codigo: "2.1",
    conta: "Passivo Circulante",
    tipo: "Passivo",
    saldo: 743200,
    nivel: 1,
  },
  {
    codigo: "2.1.1",
    conta: "Fornecedores",
    tipo: "Passivo",
    saldo: 234500,
    nivel: 2,
  },
  {
    codigo: "2.1.2",
    conta: "Obrigações Fiscais",
    tipo: "Passivo",
    saldo: 508700,
    nivel: 2,
  },
  {
    codigo: "2.2",
    conta: "Passivo Não Circulante",
    tipo: "Passivo",
    saldo: 505700,
    nivel: 1,
  },
  {
    codigo: "2.2.1",
    conta: "Empréstimos LP",
    tipo: "Passivo",
    saldo: 505700,
    nivel: 2,
  },
  { codigo: "3", conta: "RECEITAS", tipo: "Receita", saldo: 487200, nivel: 0 },
  {
    codigo: "3.1",
    conta: "Receita de Assinaturas",
    tipo: "Receita",
    saldo: 312000,
    nivel: 1,
  },
  {
    codigo: "3.2",
    conta: "Receita de Consultoria",
    tipo: "Receita",
    saldo: 98400,
    nivel: 1,
  },
  {
    codigo: "3.3",
    conta: "Receita de Taxas BTC",
    tipo: "Receita",
    saldo: 76800,
    nivel: 1,
  },
  { codigo: "4", conta: "DESPESAS", tipo: "Despesa", saldo: 298750, nivel: 0 },
  {
    codigo: "4.1",
    conta: "Despesas Operacionais",
    tipo: "Despesa",
    saldo: 187400,
    nivel: 1,
  },
  {
    codigo: "4.1.1",
    conta: "Pessoal e Encargos",
    tipo: "Despesa",
    saldo: 134200,
    nivel: 2,
  },
  {
    codigo: "4.1.2",
    conta: "Serviços de TI",
    tipo: "Despesa",
    saldo: 53200,
    nivel: 2,
  },
  {
    codigo: "4.2",
    conta: "Despesas Financeiras",
    tipo: "Despesa",
    saldo: 111350,
    nivel: 1,
  },
  {
    codigo: "4.2.1",
    conta: "Taxas Bancárias e BTC",
    tipo: "Despesa",
    saldo: 111350,
    nivel: 2,
  },
];

interface Lancamento {
  id: number;
  data: string;
  debito: string;
  credito: string;
  valor: number;
  historico: string;
}

const lancamentos: Lancamento[] = [
  {
    id: 1,
    data: "04/04/2026",
    debito: "1.1.1 — Caixa BTC",
    credito: "3.1 — Receita Assinaturas",
    valor: 48000,
    historico: "Recebimento assinatura TechFin Brasil — Abr/2026",
  },
  {
    id: 2,
    data: "04/04/2026",
    debito: "1.1.2 — Contas a Receber",
    credito: "3.2 — Receita Consultoria",
    valor: 15600,
    historico: "NF 1045 — Consultoria CriptoVault",
  },
  {
    id: 3,
    data: "03/04/2026",
    debito: "4.1.1 — Pessoal",
    credito: "2.1.1 — Fornecedores",
    valor: 18400,
    historico: "Pagamento Folha Março/2026",
  },
  {
    id: 4,
    data: "03/04/2026",
    debito: "2.1.2 — Obrigações Fiscais",
    credito: "1.1.1 — Caixa BTC",
    valor: 8920,
    historico: "DARF — IRPJ/CSL Trimestral",
  },
  {
    id: 5,
    data: "02/04/2026",
    debito: "1.1.1 — Caixa BTC",
    credito: "3.3 — Taxas BTC",
    valor: 2840,
    historico: "Receita de taxas de rede Bitcoin — Mar/2026",
  },
  {
    id: 6,
    data: "01/04/2026",
    debito: "4.1.2 — Serviços TI",
    credito: "2.1.1 — Fornecedores",
    valor: 6800,
    historico: "Infraestrutura ICP — Nodes Março/2026",
  },
  {
    id: 7,
    data: "31/03/2026",
    debito: "1.1.1 — Caixa BTC",
    credito: "3.1 — Receita Assinaturas",
    valor: 72000,
    historico: "Fechamento mensal — Assinaturas Março/2026",
  },
  {
    id: 8,
    data: "31/03/2026",
    debito: "4.2.1 — Taxas BTC",
    credito: "1.1.1 — Caixa BTC",
    valor: 4320,
    historico: "Taxas de rede Bitcoin — Mar/2026",
  },
];

const tipoColors: Record<string, string> = {
  Ativo: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Passivo: "bg-red-500/15 text-red-400 border-red-500/30",
  Receita: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Despesa: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Patrimonio: "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

export default function ContabilidadePage() {
  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="plano" data-ocid="contabilidade.tab">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="plano" data-ocid="contabilidade.tab">
            Plano de Contas
          </TabsTrigger>
          <TabsTrigger value="lancamentos" data-ocid="contabilidade.tab">
            Lançamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plano" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card border-border shadow-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">
                          Código
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          Conta
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          Tipo
                        </TableHead>
                        <TableHead className="text-right text-muted-foreground">
                          Saldo
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {planoDeContas.map((conta, i) => (
                        <TableRow
                          key={conta.codigo}
                          data-ocid={`contabilidade.item.${i + 1}`}
                          className={`border-border/50 hover:bg-muted/20 transition-colors ${
                            conta.nivel === 0 ? "bg-muted/20 font-bold" : ""
                          }`}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {conta.codigo}
                          </TableCell>
                          <TableCell
                            className={`text-sm ${
                              conta.nivel === 0
                                ? "font-bold text-foreground"
                                : conta.nivel === 1
                                  ? "font-semibold text-foreground pl-6"
                                  : "text-muted-foreground pl-10"
                            }`}
                          >
                            {conta.conta}
                          </TableCell>
                          <TableCell>
                            {conta.nivel > 0 && (
                              <Badge
                                variant="outline"
                                className={`text-xs ${tipoColors[conta.tipo]}`}
                              >
                                {conta.tipo}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell
                            className={`text-right font-mono text-sm font-semibold ${
                              conta.tipo === "Receita" || conta.tipo === "Ativo"
                                ? "text-emerald-400"
                                : conta.tipo === "Despesa" ||
                                    conta.tipo === "Passivo"
                                  ? "text-red-400"
                                  : "text-foreground"
                            }`}
                          >
                            R$ {conta.saldo.toLocaleString("pt-BR")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="lancamentos" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card border-border shadow-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">
                          Data
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          Débito
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          Crédito
                        </TableHead>
                        <TableHead className="text-right text-muted-foreground">
                          Valor
                        </TableHead>
                        <TableHead className="text-muted-foreground">
                          Histórico
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lancamentos.map((l, i) => (
                        <TableRow
                          key={l.id}
                          data-ocid={`contabilidade.lancamento.item.${i + 1}`}
                          className="border-border/50 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="text-sm text-muted-foreground">
                            {l.data}
                          </TableCell>
                          <TableCell className="text-xs text-foreground">
                            {l.debito}
                          </TableCell>
                          <TableCell className="text-xs text-foreground">
                            {l.credito}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-emerald-400">
                            R$ {l.valor.toLocaleString("pt-BR")}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                            {l.historico}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
