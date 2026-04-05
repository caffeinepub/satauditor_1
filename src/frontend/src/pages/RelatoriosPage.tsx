import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

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

interface LinhaRelatorio {
  label: string;
  valor: number;
  nivel: number;
  tipo?: "total" | "subtotal" | "negativo";
}

const balancoAtivo: LinhaRelatorio[] = [
  { label: "ATIVO TOTAL", valor: 2847650, nivel: 0, tipo: "total" },
  { label: "Ativo Circulante", valor: 1534200, nivel: 1, tipo: "subtotal" },
  { label: "Caixa e Equivalentes (BTC)", valor: 892400, nivel: 2 },
  { label: "Contas a Receber", valor: 641800, nivel: 2 },
  { label: "Ativo Não Circulante", valor: 1313450, nivel: 1, tipo: "subtotal" },
  { label: "Imobilizado", valor: 820000, nivel: 2 },
  { label: "Intangível (Software)", valor: 493450, nivel: 2 },
];

const balancoPassivo: LinhaRelatorio[] = [
  { label: "PASSIVO + PL TOTAL", valor: 2847650, nivel: 0, tipo: "total" },
  { label: "Passivo Circulante", valor: 743200, nivel: 1, tipo: "subtotal" },
  { label: "Fornecedores", valor: 234500, nivel: 2 },
  { label: "Obrigações Fiscais", valor: 508700, nivel: 2 },
  {
    label: "Passivo Não Circulante",
    valor: 505700,
    nivel: 1,
    tipo: "subtotal",
  },
  { label: "Empréstimos LP", valor: 505700, nivel: 2 },
  { label: "Patrimônio Líquido", valor: 1598750, nivel: 1, tipo: "subtotal" },
  { label: "Capital Social", valor: 1400000, nivel: 2 },
  { label: "Lucros Acumulados", valor: 198750, nivel: 2 },
];

const dre: LinhaRelatorio[] = [
  { label: "Receita Bruta", valor: 487200, nivel: 0 },
  { label: "Receita de Assinaturas", valor: 312000, nivel: 1 },
  { label: "Receita de Consultoria", valor: 98400, nivel: 1 },
  { label: "Receita de Taxas BTC", valor: 76800, nivel: 1 },
  { label: "(-) Deduções", valor: -24360, nivel: 0, tipo: "negativo" },
  { label: "Impostos s/ Receita", valor: -24360, nivel: 1, tipo: "negativo" },
  { label: "Receita Líquida", valor: 462840, nivel: 0, tipo: "subtotal" },
  {
    label: "(-) Custos dos Serviços",
    valor: -187400,
    nivel: 0,
    tipo: "negativo",
  },
  { label: "Pessoal e Encargos", valor: -134200, nivel: 1, tipo: "negativo" },
  { label: "Serviços de TI", valor: -53200, nivel: 1, tipo: "negativo" },
  { label: "Lucro Bruto", valor: 275440, nivel: 0, tipo: "subtotal" },
  {
    label: "(-) Despesas Financeiras",
    valor: -111350,
    nivel: 0,
    tipo: "negativo",
  },
  {
    label: "Taxas Bancárias e BTC",
    valor: -111350,
    nivel: 1,
    tipo: "negativo",
  },
  { label: "Resultado Líquido", valor: 164090, nivel: 0, tipo: "total" },
];

const fluxoCaixa: { secao: string; itens: LinhaRelatorio[] }[] = [
  {
    secao: "Atividades Operacionais",
    itens: [
      { label: "Recebimentos de Clientes", valor: 487200, nivel: 1 },
      {
        label: "Pagamento a Fornecedores",
        valor: -187400,
        nivel: 1,
        tipo: "negativo",
      },
      { label: "Impostos Pagos", valor: -24360, nivel: 1, tipo: "negativo" },
      { label: "Saldo Operacional", valor: 275440, nivel: 0, tipo: "subtotal" },
    ],
  },
  {
    secao: "Atividades de Investimento",
    itens: [
      {
        label: "Aquisição de Software",
        valor: -85000,
        nivel: 1,
        tipo: "negativo",
      },
      {
        label: "Melhoria Imobilizado",
        valor: -42000,
        nivel: 1,
        tipo: "negativo",
      },
      {
        label: "Saldo de Investimento",
        valor: -127000,
        nivel: 0,
        tipo: "subtotal",
      },
    ],
  },
  {
    secao: "Atividades de Financiamento",
    itens: [
      { label: "Emprestimos obtidos", valor: 200000, nivel: 1 },
      { label: "Amortizações", valor: -50000, nivel: 1, tipo: "negativo" },
      {
        label: "Saldo de Financiamento",
        valor: 150000,
        nivel: 0,
        tipo: "subtotal",
      },
    ],
  },
];

function LinhaValor({ linha }: { linha: LinhaRelatorio }) {
  const isTotal = linha.tipo === "total";
  const isSubtotal = linha.tipo === "subtotal";
  const isNegativo = linha.tipo === "negativo";

  return (
    <div
      className={`flex justify-between items-center py-2 ${
        linha.nivel === 0
          ? isTotal
            ? "border-t border-b border-border mt-2 mb-1"
            : isSubtotal
              ? "border-t border-border mt-1"
              : ""
          : ""
      }`}
      style={{ paddingLeft: `${linha.nivel * 16 + 4}px` }}
    >
      <span
        className={`text-sm ${
          isTotal
            ? "font-bold text-foreground"
            : isSubtotal
              ? "font-semibold text-foreground"
              : "text-muted-foreground"
        }`}
      >
        {linha.label}
      </span>
      <span
        className={`text-sm font-mono ${
          isTotal
            ? "font-bold text-primary"
            : isNegativo || linha.valor < 0
              ? "text-red-400"
              : "text-emerald-400"
        }`}
      >
        {linha.valor < 0 ? "(" : ""}
        R$ {Math.abs(linha.valor).toLocaleString("pt-BR")}
        {linha.valor < 0 ? ")" : ""}
      </span>
    </div>
  );
}

export default function RelatoriosPage() {
  const [mes, setMes] = useState("3");
  const [ano, setAno] = useState("2026");

  return (
    <div className="p-6 space-y-6">
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
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      <Tabs defaultValue="balanco" data-ocid="relatorios.tab">
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            <Card className="bg-card border-border shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  Ativo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {balancoAtivo.map((linha) => (
                  <LinhaValor key={linha.label} linha={linha} />
                ))}
              </CardContent>
            </Card>
            <Card className="bg-card border-border shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-400" />
                  Passivo + Patrimônio Líquido
                </CardTitle>
              </CardHeader>
              <CardContent>
                {balancoPassivo.map((linha) => (
                  <LinhaValor key={linha.label} linha={linha} />
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="dre" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card border-border shadow-card max-w-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display">
                  Demonstração do Resultado do Exercício —{" "}
                  {MESES[Number.parseInt(mes)]}/{ano}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dre.map((linha) => (
                  <LinhaValor key={linha.label} linha={linha} />
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="fluxo" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {fluxoCaixa.map((secao) => (
              <Card
                key={secao.secao}
                className="bg-card border-border shadow-card max-w-2xl"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-display text-primary">
                    {secao.secao}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {secao.itens.map((linha) => (
                    <LinhaValor key={linha.label} linha={linha} />
                  ))}
                </CardContent>
              </Card>
            ))}

            <Card className="bg-primary/10 border border-primary/30 max-w-2xl">
              <CardContent className="py-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">
                    Variação Líquida de Caixa
                  </span>
                  <span className="font-bold text-xl text-primary font-mono">
                    R$ {(275440 - 127000 + 150000).toLocaleString("pt-BR")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
