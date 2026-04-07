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
import { Inbox, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useActor } from "../hooks/useActor";
import type { AuditLog } from "../types/domain";

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortenPrincipal(p: { toString(): string }): string {
  const s = p.toString();
  if (s.length <= 16) return s;
  return `${s.slice(0, 8)}...${s.slice(-5)}`;
}

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

export default function AuditoriaPage() {
  const { actor, isFetching } = useActor();

  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ["auditLogs"],
    queryFn: async () => {
      if (!actor) return [];
      const result = (await (actor as any).getAllAuditLogs()) as AuditLog[];
      return [...result].sort((a, b) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor && !isFetching,
  });

  const loading = isLoading || isFetching;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <ShieldCheck className="h-5 w-5" />
        <span className="text-sm">Auditoria</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-card border-border shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Log de Auditoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {SKELETON_KEYS.map((key) => (
                  <Skeleton key={key} className="h-10 w-full rounded-md" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="rounded-full bg-muted/40 p-4">
                  <Inbox className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-foreground mb-1">
                    Nenhum registro encontrado
                  </p>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Os logs de auditoria aparecerão aqui conforme ações
                    financeiras forem registradas no sistema.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-44">Data</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={String(log.id)}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {shortenPrincipal(
                            log.user ??
                              log.principal ?? { toString: () => "—" },
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                            {log.action}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {log.details}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
