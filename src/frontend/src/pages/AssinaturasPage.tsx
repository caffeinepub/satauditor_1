import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, Crown, Star } from "lucide-react";
import { motion } from "motion/react";
import { BusinessRole } from "../backend.d";
import type { UserProfile } from "../backend.d";

interface Plano {
  id: string;
  nome: string;
  descricao: string;
  destaque: boolean;
  recursos: string[];
  cor: string;
}

const planos: Plano[] = [
  {
    id: "basico",
    nome: "Básico",
    descricao: "Para pequenas empresas começando com Bitcoin",
    destaque: false,
    cor: "slate",
    recursos: [
      "Até 50 transações/mês",
      "1 endereço Bitcoin",
      "Relatórios Básicos (DRE, Balanço)",
      "Dashboard simples",
      "Suporte por e-mail",
      "Exportação PDF",
    ],
  },
  {
    id: "profissional",
    nome: "Profissional",
    descricao: "Para empresas em crescimento com múltiplas contas",
    destaque: true,
    cor: "amber",
    recursos: [
      "Até 500 transações/mês",
      "5 endereços Bitcoin",
      "Todos os relatórios financeiros",
      "Auditoria automática",
      "Dashboard avançado com gráficos",
      "Plano de Contas personalizável",
      "API de integração",
      "Suporte prioritário",
    ],
  },
  {
    id: "enterprise",
    nome: "Enterprise",
    descricao: "Para grandes empresas com volume alto de transações",
    destaque: false,
    cor: "purple",
    recursos: [
      "Transações ilimitadas",
      "Endereços Bitcoin ilimitados",
      "Todos os recursos do Profissional",
      "Conformidade e compliance avançado",
      "Auditoria em tempo real",
      "Relatórios personalizados",
      "SLA garantido 99.9%",
      "Suporte dedicado 24/7",
      "Treinamento e onboarding",
    ],
  },
];

interface AssinaturaCliente {
  id: number;
  cliente: string;
  plano: string;
  inicio: string;
  vencimento: string;
  status: "Ativo" | "Vencido" | "Cancelado";
}

const assinaturas: AssinaturaCliente[] = [
  {
    id: 1,
    cliente: "TechFin Brasil Ltda",
    plano: "Enterprise",
    inicio: "01/01/2026",
    vencimento: "01/01/2027",
    status: "Ativo",
  },
  {
    id: 2,
    cliente: "Mercado Digital S.A.",
    plano: "Profissional",
    inicio: "15/02/2026",
    vencimento: "15/02/2027",
    status: "Ativo",
  },
  {
    id: 3,
    cliente: "CriptoVault Investimentos",
    plano: "Enterprise",
    inicio: "10/01/2026",
    vencimento: "10/04/2026",
    status: "Ativo",
  },
  {
    id: 4,
    cliente: "StartupPay Tecnologia",
    plano: "Básico",
    inicio: "20/03/2026",
    vencimento: "20/04/2026",
    status: "Ativo",
  },
  {
    id: 5,
    cliente: "Holding Nacional Ltda",
    plano: "Enterprise",
    inicio: "05/06/2025",
    vencimento: "05/01/2026",
    status: "Vencido",
  },
  {
    id: 6,
    cliente: "FintechRedes Brasil",
    plano: "Profissional",
    inicio: "01/03/2026",
    vencimento: "01/03/2027",
    status: "Ativo",
  },
];

const statusColors: Record<string, string> = {
  Ativo: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Vencido: "bg-red-500/20 text-red-400 border-red-500/30",
  Cancelado: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const planColors: Record<string, string> = {
  Básico: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  Profissional: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Enterprise: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

// Map plan id → display name for lookup
const planIdToNome: Record<string, string> = {
  basico: "Básico",
  profissional: "Profissional",
  enterprise: "Enterprise",
};

interface AssinaturasPageProps {
  profile: UserProfile;
}

export default function AssinaturasPage({ profile }: AssinaturasPageProps) {
  const isClient = profile.businessRole === BusinessRole.client;

  // For client view: determine the plan to highlight.
  // In a real app this would come from profile.clientId → client.plan.
  // For mock purposes, default to "profissional" for client role.
  const clientPlanId = "profissional";
  const clientPlano = planos.find((p) => p.id === clientPlanId) ?? planos[1];
  const clientPlanNome = planIdToNome[clientPlanId] ?? "Profissional";

  if (isClient) {
    return (
      <div className="p-6 space-y-6">
        {/* Client view: show only their current plan */}
        <div
          data-ocid="assinaturas.client.panel"
          className="max-w-xl mx-auto space-y-6"
        >
          <div className="text-center space-y-1">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Seu Plano Atual
            </h2>
            <p className="text-sm text-muted-foreground">
              Detalhes da sua assinatura ativa no SatAuditor
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
            data-ocid={`assinaturas.${clientPlano.id}.card`}
          >
            {/* Active indicator */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <Badge className="bg-emerald-500 text-white px-3 py-1 text-xs font-bold">
                <Star className="h-3 w-3 mr-1" />
                Plano Ativo
              </Badge>
            </div>

            <Card className="bg-card border-primary/60 shadow-btc">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-2xl">
                    {clientPlano.nome}
                  </CardTitle>
                  {clientPlano.destaque && (
                    <Badge className="bg-primary/20 text-primary border border-primary/30 text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      Mais Popular
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {clientPlano.descricao}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current subscription info */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/20 border border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge
                      variant="outline"
                      className="text-xs mt-1 bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    >
                      Ativo
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Renovação</p>
                    <p className="text-sm font-medium text-foreground mt-1">
                      15/02/2027
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Início</p>
                    <p className="text-sm font-medium text-foreground mt-1">
                      15/02/2026
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Plano</p>
                    <Badge
                      variant="outline"
                      className={`text-xs mt-1 ${planColors[clientPlanNome]}`}
                    >
                      {clientPlanNome}
                    </Badge>
                  </div>
                </div>

                <ul className="space-y-2">
                  {clientPlano.recursos.map((r) => (
                    <li key={r} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{r}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  data-ocid="assinaturas.client.button"
                  variant="outline"
                  className="w-full border-primary/30 hover:border-primary/60 text-primary"
                >
                  Consultar Upgrade de Plano
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Admin / accountant view: full plan grid + table
  return (
    <div className="p-6 space-y-8">
      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planos.map((plano, i) => (
          <motion.div
            key={plano.id}
            data-ocid={`assinaturas.${plano.id}.card`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative"
          >
            {plano.destaque && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-bold">
                  <Crown className="h-3 w-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
            )}
            <Card
              className={`bg-card border h-full ${
                plano.destaque
                  ? "border-primary/60 shadow-btc"
                  : "border-border"
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-xl">
                    {plano.nome}
                  </CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plano.descricao}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plano.recursos.map((r) => (
                    <li key={r} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{r}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  data-ocid={`assinaturas.${plano.id}.button`}
                  variant={plano.destaque ? "default" : "outline"}
                  className={`w-full mt-4 ${
                    plano.destaque
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-btc"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  Consultar Valores
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Subscriptions table */}
      <div>
        <h2 className="font-display text-lg font-bold text-foreground mb-4">
          Assinaturas dos Clientes
        </h2>
        <Card className="bg-card border-border shadow-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Cliente
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Plano
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Início
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Vencimento
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assinaturas.map((a, i) => (
                    <TableRow
                      key={a.id}
                      data-ocid={`assinaturas.item.${i + 1}`}
                      className="border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">
                        {a.cliente}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${planColors[a.plano]}`}
                        >
                          {a.plano}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {a.inicio}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {a.vencimento}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${statusColors[a.status]}`}
                        >
                          {a.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
