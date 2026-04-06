import { BusinessRole, type UserProfile } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, UserCheck, X } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

interface PendingUser {
  principal: any;
  profile: UserProfile;
}

function ApprovalPanel({ actor }: { actor: any }) {
  const queryClient = useQueryClient();

  const { data: pendingUsers = [], isLoading } = useQuery<PendingUser[]>({
    queryKey: ["pendingUsers"],
    queryFn: async () => {
      try {
        const result = await actor.getPendingUsers();
        return (result as Array<[any, any]>).map(([principal, profile]) => ({
          principal,
          profile: {
            name: profile.name,
            email: profile.email,
            businessRole: profile.businessRole,
            clientId: profile.clientId,
          } as UserProfile,
        }));
      } catch {
        return [];
      }
    },
    enabled: !!actor,
  });

  const approveMutation = useMutation({
    mutationFn: async (principal: any) => {
      await actor.approveUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingUsers"] });
      toast.success("Usuário aprovado!");
    },
    onError: () => toast.error("Erro ao aprovar usuário."),
  });

  const rejectMutation = useMutation({
    mutationFn: async (principal: any) => {
      await actor.rejectUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingUsers"] });
      toast.success("Usuário rejeitado.");
    },
    onError: () => toast.error("Erro ao rejeitar usuário."),
  });

  const roleLabel = (role: any): string => {
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
                <TableHead className="text-muted-foreground">E-mail</TableHead>
                <TableHead className="text-muted-foreground">Perfil</TableHead>
                <TableHead className="text-muted-foreground">
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
                    <TableCell>
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
                        {roleLabel(u.profile.businessRole)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground max-w-[120px] truncate">
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
                          disabled={
                            approveMutation.isPending ||
                            rejectMutation.isPending
                          }
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
                          disabled={
                            approveMutation.isPending ||
                            rejectMutation.isPending
                          }
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
  );
}

interface AprovacoesPageProps {
  actor: any;
}

export default function AprovacoesPage({ actor }: AprovacoesPageProps) {
  return (
    <div className="p-6 space-y-6">
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
            Aprove ou rejeite solicitações de acesso de novos usuários.
          </p>
        </div>
      </div>

      {/* Panel */}
      <ApprovalPanel actor={actor} />
    </div>
  );
}
