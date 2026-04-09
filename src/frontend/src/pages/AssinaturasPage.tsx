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
import { Check, Crown, ExternalLink, Star } from "lucide-react";
import { motion } from "motion/react";
import { useActor } from "../hooks/useActor";
import {
  BusinessRole,
  type Client,
  type Subscription,
  type UserProfile,
} from "../types/domain";

// ─── Plan data ────────────────────────────────────────────────────────────────

const PARA_EMPRESAS_RECURSOS = [
  "Transações ilimitadas",
  "Endereços Bitcoin ilimitados",
  "Recursos avançados de blockchain",
  "Conformidade e auditoria em tempo real",
  "Relatórios personalizados",
  "SLA garantido",
  "Suporte 24/7",
  "Onboarding e treinamento",
  "Importação de extratos bancários (CSV/OFX)",
];

const WHATSAPP_URL =
  "https://wa.me/5516994410284?text=Ol%C3%A1%2C+gostaria+de+saber+mais+sobre+o+plano+Para+Empresas+do+SatAuditor";

const statusToLabel: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  suspended: "Suspenso",
};

const statusToColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  inactive: "bg-muted/20 text-muted-foreground border-border",
  suspended: "bg-red-500/20 text-red-400 border-red-500/30",
};

const planTypeToNome: Record<string, string> = {
  basic: "Básico",
  professional: "Profissional",
  enterprise: "Para Empresas",
};

const planColors: Record<string, string> = {
  Básico: "bg-muted/20 text-muted-foreground border-border",
  Profissional: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Para Empresas": "bg-primary/20 text-primary border-primary/30",
};

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
                {(["s1", "s2", "s3", "s4"] as const).map((k) => (
                  <div key={k}>
                    <Skeleton className="h-3 w-16 mb-2" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {(["r1", "r2", "r3", "r4"] as const).map((k) => (
                  <Skeleton key={k} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Determine display data — use backend subscription if available, else default plan
  const hasSubscription = !!subscription;
  const planKey = hasSubscription
    ? (Object.keys(subscription!.plan ?? {})[0] as string)
    : "enterprise";
  const planNome = planTypeToNome[planKey] ?? "Para Empresas";
  const statusKey = hasSubscription
    ? (Object.keys(subscription!.status ?? {})[0] as string)
    : "active";
  const statusLabel = statusToLabel[statusKey] ?? "Ativo";
  const statusClass = statusToColors[statusKey] ?? statusToColors.active;

  const startDateDisplay = hasSubscription
    ? formatDate(subscription!.startDate)
    : "—";
  const renewalDisplay = hasSubscription
    ? addOneYear(subscription!.startDate)
    : "—";

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
          data-ocid="assinaturas.para_empresas.card"
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
                  Para Empresas
                </CardTitle>
                <Badge className="bg-primary/20 text-primary border border-primary/30 text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  Completo
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Solução completa de contabilidade e auditoria on-chain para PMEs
                brasileiras
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
                    {renewalDisplay}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Início</p>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {startDateDisplay}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Plano</p>
                  <Badge
                    variant="outline"
                    className={`text-xs mt-1 ${planColors[planNome] ?? planColors["Para Empresas"]}`}
                  >
                    {planNome}
                  </Badge>
                </div>
              </div>

              <ul className="space-y-2">
                {PARA_EMPRESAS_RECURSOS.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{r}</span>
                  </li>
                ))}
              </ul>

              <Button
                data-ocid="assinaturas.client.whatsapp_btn"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-2"
                onClick={() => window.open(WHATSAPP_URL, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
                Falar pelo WhatsApp
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
                      const planKey = Object.keys(sub.plan ?? {})[0] as string;
                      const planNome = planTypeToNome[planKey] ?? planKey;
                      const statusKey = Object.keys(
                        sub.status ?? {},
                      )[0] as string;
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
                              className={`text-xs ${planColors[planNome] ?? planColors["Para Empresas"]}`}
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
  if (isClient) return <ClientView profile={profile} />;
  return <AdminView />;
}
