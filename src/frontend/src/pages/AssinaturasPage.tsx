import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { useActor } from "../hooks/useActor";
import type { Client, Subscription, UserProfile } from "../types/domain";

// ─── Plan data ────────────────────────────────────────────────────────────────

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
export default function AssinaturasPage({
  profile: _profile,
}: AssinaturasPageProps) {
  // All users see the full admin subscriptions view
  return <AdminView />;
}
