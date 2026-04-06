import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Check, Crown, Star } from "lucide-react";
import { motion } from "motion/react";
import { BusinessRole } from "../backend.d";
import type { Client, Subscription, UserProfile } from "../backend.d";
import { useActor } from "../hooks/useActor";

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

const planTypeToNome: Record<string, string> = {
  basic: "Básico",
  professional: "Profissional",
  enterprise: "Enterprise",
};

const planTypeToPlanoId: Record<string, string> = {
  basic: "basico",
  professional: "profissional",
  enterprise: "enterprise",
};

const statusToLabel: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  suspended: "Suspenso",
};

const statusToColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  inactive: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  suspended: "bg-red-500/20 text-red-400 border-red-500/30",
};

const planColors: Record<string, string> = {
  Básico: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  Profissional: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Enterprise: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const SKELETON_CARD_FIELDS = [
  "status",
  "renovacao",
  "inicio",
  "plano",
] as const;
const SKELETON_RECURSOS = ["r1", "r2", "r3", "r4"] as const;
const SKELETON_TABLE_ROWS = ["sk1", "sk2", "sk3", "sk4", "sk5"] as const;

function formatDate(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  return new Date(ms).toLocaleDateString("pt-BR");
}

function addOneYear(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  const d = new Date(ms);
  d.setFullYear(d.getFullYear() + 1);
  return d.toLocaleDateString("pt-BR");
}

interface AssinaturasPageProps {
  profile: UserProfile;
}

// ─── Client View ─────────────────────────────────────────────────────────────
function ClientView({ profile }: { profile: UserProfile }) {
  const { actor, isFetching } = useActor();

  const clientId = profile.clientId;

  const { data: subscription, isLoading } = useQuery<Subscription | null>({
    queryKey: ["subscription", clientId?.toString()],
    queryFn: async () => {
      if (!actor || clientId === undefined) return null;
      return actor.getSubscriptionByClientId(clientId);
    },
    enabled: !!actor && !isFetching && clientId !== undefined,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <Skeleton className="h-7 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <Card className="bg-card border-border">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/20 border border-border"
                data-ocid="assinaturas.loading_state"
              >
                {SKELETON_CARD_FIELDS.map((key) => (
                  <div key={key}>
                    <Skeleton className="h-3 w-16 mb-2" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {SKELETON_RECURSOS.map((key) => (
                  <Skeleton key={key} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="p-6">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Seu Plano Atual
            </h2>
            <p className="text-sm text-muted-foreground">
              Detalhes da sua assinatura ativa no SatAuditor
            </p>
          </div>
          <div
            data-ocid="assinaturas.empty_state"
            className="text-center py-12 text-muted-foreground"
          >
            Nenhuma assinatura ativa encontrada.
          </div>
        </div>
      </div>
    );
  }

  const planKey = Object.keys(subscription.plan)[0] as string;
  const planNome = planTypeToNome[planKey] ?? planKey;
  const planId = planTypeToPlanoId[planKey] ?? "profissional";
  const clientePlano = planos.find((p) => p.id === planId) ?? planos[1];
  const statusKey = Object.keys(subscription.status)[0] as string;
  const statusLabel = statusToLabel[statusKey] ?? statusKey;
  const statusClass = statusToColors[statusKey] ?? statusToColors.inactive;

  return (
    <div className="p-6 space-y-6">
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
          data-ocid={`assinaturas.${clientePlano.id}.card`}
        >
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
                  {clientePlano.nome}
                </CardTitle>
                {clientePlano.destaque && (
                  <Badge className="bg-primary/20 text-primary border border-primary/30 text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Mais Popular
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {clientePlano.descricao}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/20 border border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={`text-xs mt-1 ${statusClass}`}
                  >
                    {statusLabel}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Renovação</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {addOneYear(subscription.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Início</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {formatDate(subscription.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Plano</p>
                  <Badge
                    variant="outline"
                    className={`text-xs mt-1 ${planColors[planNome]}`}
                  >
                    {planNome}
                  </Badge>
                </div>
              </div>

              <ul className="space-y-2">
                {clientePlano.recursos.map((r) => (
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

// ─── Admin / Accountant View ──────────────────────────────────────────────────
function AdminView() {
  const { actor, isFetching } = useActor();

  const { data: subscriptions = [], isLoading: isLoadingSubs } = useQuery<
    Subscription[]
  >({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSubscriptions();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: clients = [], isLoading: isLoadingClients } = useQuery<
    Client[]
  >({
    queryKey: ["clients"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClients();
    },
    enabled: !!actor && !isFetching,
  });

  const isLoading = isLoadingSubs || isLoadingClients;

  const clientMap = new Map<string, string>();
  for (const c of clients) {
    clientMap.set(c.id.toString(), c.name);
  }

  return (
    <div className="p-6 space-y-8">
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
                      Renovação
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    SKELETON_TABLE_ROWS.map((key) => (
                      <TableRow
                        key={key}
                        data-ocid="assinaturas.loading_state"
                        className="border-border/50"
                      >
                        <TableCell>
                          <Skeleton className="h-4 w-36" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-16" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="assinaturas.empty_state"
                      >
                        Nenhuma assinatura encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscriptions.map((sub, i) => {
                      const planKey = Object.keys(sub.plan)[0] as string;
                      const planNome = planTypeToNome[planKey] ?? planKey;
                      const statusKey = Object.keys(sub.status)[0] as string;
                      const statusLabel = statusToLabel[statusKey] ?? statusKey;
                      const statusClass =
                        statusToColors[statusKey] ?? statusToColors.inactive;
                      const clientName =
                        clientMap.get(sub.clientId.toString()) ??
                        `Cliente ${sub.clientId.toString()}`;

                      return (
                        <TableRow
                          key={sub.id.toString()}
                          data-ocid={`assinaturas.item.${i + 1}`}
                          className="border-border/50 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="font-medium text-foreground">
                            {clientName}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs ${planColors[planNome]}`}
                            >
                              {planNome}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(sub.startDate)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {addOneYear(sub.startDate)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs ${statusClass}`}
                            >
                              {statusLabel}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Page Entry Point ─────────────────────────────────────────────────────────
export default function AssinaturasPage({ profile }: AssinaturasPageProps) {
  const isClient = profile.businessRole === BusinessRole.client;

  if (isClient) {
    return <ClientView profile={profile} />;
  }

  return <AdminView />;
}
