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
import { BusinessRole, type UserProfile } from "@/types/domain";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Clock, Loader2, UserCheck, X } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface PendingUser {
  principal: { toString(): string };
  profile: UserProfile;
}

interface AccessRequest {
  clientPrincipal: { toString(): string };
  clientName: string;
  clientEmail: string;
  requestedAt: bigint;
  expiresAt: bigint;
}

function formatDate(ns: bigint): string {
  // ICP timestamps are in nanoseconds
  const ms = Number(ns / 1_000_000n);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

function isExpired(expiresAt: bigint): boolean {
  const nowMs = Date.now();
  const expiresMs = Number(expiresAt / 1_000_000n);
  return nowMs > expiresMs;
}

// ─── Access Requests Section ──────────────────────────────────────────────────

function AccessRequestsSection({ actor }: { actor: unknown }) {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery<AccessRequest[]>({
    queryKey: ["accessRequests"],
    queryFn: async () => {
      try {
        const result = await (actor as any).getAccessRequests();
        return result as AccessRequest[];
      } catch {
        return [];
      }
    },
    enabled: !!actor,
    staleTime: 15000,
    refetchInterval: 30000,
  });

  const approveMutation = useMutation({
    mutationFn: async (principal: { toString(): string }) => {
      await (actor as any).approveUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accessRequests"] });
      queryClient.invalidateQueries({ queryKey: ["pendingUsers"] });
      toast.success("Acesso aprovado com sucesso!");
    },
    onError: () => toast.error("Erro ao aprovar acesso."),
  });

  const rejectMutation = useMutation({
    mutationFn: async (principal: { toString(): string }) => {
      await (actor as any).rejectUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accessRequests"] });
      queryClient.invalidateQueries({ queryKey: ["pendingUsers"] });
      toast.success("Solicitação rejeitada.");
    },
    onError: () => toast.error("Erro ao rejeitar solicitação."),
  });

  const isBusy = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Solicitações de Acesso
        </h3>
        {requests.length > 0 && (
          <Badge className="h-5 min-w-5 px-1.5 text-xs bg-primary/20 text-primary border-primary/30">
            {requests.length}
          </Badge>
        )}
      </div>

      <Card
        data-ocid="aprovacoes.requests_panel"
        className="bg-card border-border shadow-card"
      >
        <CardContent className="p-0">
          {isLoading && (
            <div className="p-4 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-28 ml-auto" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && requests.length === 0 && (
            <div
              data-ocid="aprovacoes.requests_empty_state"
              className="flex flex-col items-center justify-center gap-2 py-10 text-center"
            >
              <Bell className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Nenhuma solicitação de acesso pendente.
              </p>
            </div>
          )}

          {!isLoading && requests.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Nome
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      E-mail
                    </TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">
                      Principal
                    </TableHead>
                    <TableHead className="text-muted-foreground hidden lg:table-cell">
                      Solicitado em
                    </TableHead>
                    <TableHead className="text-muted-foreground hidden lg:table-cell">
                      Expira em
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req, i) => {
                    const expired = isExpired(req.expiresAt);
                    return (
                      <motion.tr
                        key={req.clientPrincipal.toString()}
                        data-ocid={`aprovacoes.request_item.${i + 1}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="font-medium text-foreground text-sm">
                          <div className="flex items-center gap-2">
                            {req.clientName || "—"}
                            {expired && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-red-500/10 text-red-400 border-red-500/30 ml-1"
                              >
                                Expirada
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {req.clientEmail || "—"}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground max-w-[120px] truncate hidden md:table-cell">
                          {req.clientPrincipal.toString().slice(0, 14)}…
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            {formatDate(req.requestedAt)}
                          </div>
                        </TableCell>
                        <TableCell
                          className={`text-xs hidden lg:table-cell whitespace-nowrap ${expired ? "text-red-400" : "text-muted-foreground"}`}
                        >
                          {formatDate(req.expiresAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              data-ocid={`aprovacoes.request_approve_button.${i + 1}`}
                              className="h-7 px-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs"
                              variant="outline"
                              onClick={() =>
                                approveMutation.mutate(req.clientPrincipal)
                              }
                              disabled={isBusy}
                            >
                              {approveMutation.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3 mr-1" />
                              )}
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              data-ocid={`aprovacoes.request_reject_button.${i + 1}`}
                              className="h-7 px-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs"
                              variant="outline"
                              onClick={() =>
                                rejectMutation.mutate(req.clientPrincipal)
                              }
                              disabled={isBusy}
                            >
                              {rejectMutation.isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <X className="h-3 w-3 mr-1" />
                              )}
                              Rejeitar
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Pending Users Section ────────────────────────────────────────────────────

function PendingUsersSection({ actor }: { actor: unknown }) {
  const queryClient = useQueryClient();

  const { data: pendingUsers = [], isLoading } = useQuery<PendingUser[]>({
    queryKey: ["pendingUsers"],
    queryFn: async () => {
      try {
        const result = await (actor as any).getPendingUsers();
        return (result as Array<[{ toString(): string }, UserProfile]>).map(
          ([principal, profile]) => ({
            principal,
            profile: {
              name: profile.name,
              email: profile.email,
              businessRole: profile.businessRole,
              clientId: profile.clientId,
            } as UserProfile,
          }),
        );
      } catch {
        return [];
      }
    },
    enabled: !!actor,
    staleTime: 15000,
    refetchInterval: 30000,
  });

  const approveMutation = useMutation({
    mutationFn: async (principal: { toString(): string }) => {
      await (actor as any).approveUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingUsers"] });
      queryClient.invalidateQueries({ queryKey: ["accessRequests"] });
      toast.success("Usuário aprovado!");
    },
    onError: () => toast.error("Erro ao aprovar usuário."),
  });

  const rejectMutation = useMutation({
    mutationFn: async (principal: { toString(): string }) => {
      await (actor as any).rejectUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingUsers"] });
      queryClient.invalidateQueries({ queryKey: ["accessRequests"] });
      toast.success("Usuário rejeitado.");
    },
    onError: () => toast.error("Erro ao rejeitar usuário."),
  });

  const isBusy = approveMutation.isPending || rejectMutation.isPending;

  const roleLabel = (role: BusinessRole | Record<string, unknown>): string => {
    if (typeof role === "object") {
      if ("accountant" in role) return "Contador";
      if ("client" in role) return "Cliente";
      if ("admin" in role) return "Administrador";
    }
    if (role === BusinessRole.accountant) return "Contador";
    if (role === BusinessRole.admin) return "Administrador";
    return "Cliente";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <UserCheck className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-foreground">
          Usuários Aguardando Aprovação
        </h3>
        {pendingUsers.length > 0 && (
          <Badge className="h-5 min-w-5 px-1.5 text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
            {pendingUsers.length}
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground -mt-1">
        Usuários registrados que ainda não enviaram solicitação formal de
        acesso.
      </p>

      <Card
        data-ocid="aprovacoes.panel"
        className="bg-card border-border shadow-card"
      >
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Nome</TableHead>
                  <TableHead className="text-muted-foreground">
                    E-mail
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Perfil
                  </TableHead>
                  <TableHead className="text-muted-foreground hidden md:table-cell">
                    Principal
                  </TableHead>
                  <TableHead className="text-muted-foreground text-right">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading &&
                  [1, 2].map((i) => (
                    <TableRow
                      key={i}
                      data-ocid="aprovacoes.loading_state"
                      className="border-b border-border/50"
                    >
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-7 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}

                {!isLoading && pendingUsers.length === 0 && (
                  <TableRow>
                    <TableCell
                      data-ocid="aprovacoes.empty_state"
                      colSpan={5}
                      className="text-center text-muted-foreground py-8 text-sm"
                    >
                      Nenhuma aprovação pendente.
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  pendingUsers.map((u, i) => (
                    <motion.tr
                      key={u.principal.toString()}
                      data-ocid={`aprovacoes.item.${i + 1}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground text-sm">
                        {u.profile.name || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.profile.email || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30"
                        >
                          {roleLabel(
                            u.profile.businessRole as
                              | BusinessRole
                              | Record<string, unknown>,
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground max-w-[120px] truncate hidden md:table-cell">
                        {u.principal.toString().slice(0, 16)}…
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            data-ocid={`aprovacoes.confirm_button.${i + 1}`}
                            className="h-7 px-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs"
                            variant="outline"
                            onClick={() => approveMutation.mutate(u.principal)}
                            disabled={isBusy}
                          >
                            {approveMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3 mr-1" />
                            )}
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            data-ocid={`aprovacoes.delete_button.${i + 1}`}
                            className="h-7 px-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs"
                            variant="outline"
                            onClick={() => rejectMutation.mutate(u.principal)}
                            disabled={isBusy}
                          >
                            {rejectMutation.isPending ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <X className="h-3 w-3 mr-1" />
                            )}
                            Rejeitar
                          </Button>
                        </div>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

interface AprovacoesPageProps {
  actor: unknown;
}

export default function AprovacoesPage({ actor }: AprovacoesPageProps) {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
          <UserCheck className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground leading-tight">
            Gerenciamento de Aprovações
          </h2>
          <p className="text-sm text-muted-foreground">
            Gerencie as solicitações de acesso e aprove novos usuários.
          </p>
        </div>
      </div>

      {/* Access Requests (top — explicit requests via button) */}
      <AccessRequestsSection actor={actor} />

      {/* Divider */}
      <div className="border-t border-border/50" />

      {/* Pending Users (bottom — registered but not yet explicitly requested) */}
      <PendingUsersSection actor={actor} />
    </div>
  );
}
