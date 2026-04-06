import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Loader2, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AccountType, BusinessRole } from "../backend.d";
import type { ChartAccount, JournalEntry, UserProfile } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  [AccountType.asset]: "Ativo",
  [AccountType.liability]: "Passivo",
  [AccountType.revenue]: "Receita",
  [AccountType.expense]: "Despesa",
  [AccountType.equity]: "Patrimônio",
};

const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  [AccountType.asset]: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  [AccountType.liability]:
    "bg-purple-500/15 text-purple-400 border-purple-500/30",
  [AccountType.revenue]:
    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  [AccountType.expense]: "bg-red-500/15 text-red-400 border-red-500/30",
  [AccountType.equity]: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

function formatDate(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  return new Date(ms).toLocaleDateString("pt-BR");
}

function formatBtc(sats: bigint): string {
  return `${(Number(sats) / 100_000_000).toFixed(8)} BTC`;
}

const SKELETON_ROWS = ["sk1", "sk2", "sk3", "sk4", "sk5"] as const;

// ─── Account Form ──────────────────────────────────────────────────────────────

interface AccountFormData {
  code: string;
  name: string;
  accountType: AccountType | "";
  parentCode: string;
  description: string;
  active: boolean;
}

const EMPTY_ACCOUNT_FORM: AccountFormData = {
  code: "",
  name: "",
  accountType: "",
  parentCode: "",
  description: "",
  active: true,
};

interface AccountDialogProps {
  mode: "create" | "edit";
  account?: ChartAccount;
  onClose: () => void;
  open: boolean;
}

function AccountDialog({ mode, account, onClose, open }: AccountDialogProps) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<AccountFormData>(
    account
      ? {
          code: account.code,
          name: account.name,
          accountType: account.accountType,
          parentCode: account.parentCode ?? "",
          description: account.description,
          active: account.active,
        }
      : EMPTY_ACCOUNT_FORM,
  );

  const addMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      if (!actor) throw new Error("Sem conexão com o backend");
      if (!data.accountType) throw new Error("Tipo obrigatório");
      const now = BigInt(Date.now()) * 1_000_000n;
      const newAccount: ChartAccount = {
        id: 0n,
        code: data.code,
        name: data.name,
        accountType: data.accountType as AccountType,
        parentCode: data.parentCode || undefined,
        description: data.description,
        active: data.active,
        createdAt: now,
      };
      return (actor as any).addChartAccount(newAccount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chartAccounts"] });
      toast.success("Conta criada com sucesso");
      onClose();
      setForm(EMPTY_ACCOUNT_FORM);
    },
    onError: (e: Error) => toast.error(e.message || "Erro ao criar conta"),
  });

  const editMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      if (!actor || !account) throw new Error("Sem conexão com o backend");
      if (!data.accountType) throw new Error("Tipo obrigatório");
      const updated: ChartAccount = {
        ...account,
        code: data.code,
        name: data.name,
        accountType: data.accountType as AccountType,
        parentCode: data.parentCode || undefined,
        description: data.description,
        active: data.active,
      };
      return (actor as any).editChartAccount(account.id, updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chartAccounts"] });
      toast.success("Conta atualizada");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message || "Erro ao atualizar conta"),
  });

  const isPending = addMutation.isPending || editMutation.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim() || !form.accountType) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    if (mode === "create") addMutation.mutate(form);
    else editMutation.mutate(form);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        className="bg-card border-border max-w-md"
        data-ocid="contabilidade.contas.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {mode === "create" ? "Nova Conta" : "Editar Conta"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="code">Código *</Label>
              <Input
                id="code"
                data-ocid="contabilidade.contas.input"
                value={form.code}
                onChange={(e) =>
                  setForm((p) => ({ ...p, code: e.target.value }))
                }
                placeholder="Ex: 1.1.01"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="parentCode">Código Pai</Label>
              <Input
                id="parentCode"
                data-ocid="contabilidade.contas.input"
                value={form.parentCode}
                onChange={(e) =>
                  setForm((p) => ({ ...p, parentCode: e.target.value }))
                }
                placeholder="Ex: 1.1"
                className="bg-background border-border"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              data-ocid="contabilidade.contas.input"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Nome da conta"
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-1">
            <Label>Tipo *</Label>
            <Select
              value={form.accountType}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, accountType: v as AccountType }))
              }
            >
              <SelectTrigger
                data-ocid="contabilidade.contas.select"
                className="bg-background border-border"
              >
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AccountType).map((t) => (
                  <SelectItem key={t} value={t}>
                    {ACCOUNT_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              data-ocid="contabilidade.contas.textarea"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Descreva a finalidade desta conta"
              className="bg-background border-border resize-none h-20"
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="active"
              data-ocid="contabilidade.contas.switch"
              checked={form.active}
              onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))}
            />
            <Label htmlFor="active">Conta Ativa</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="contabilidade.contas.cancel_button"
              className="border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              data-ocid="contabilidade.contas.submit_button"
              disabled={isPending}
            >
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === "create" ? "Criar Conta" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Journal Entry Form ────────────────────────────────────────────────────────

interface EntryFormData {
  date: string;
  description: string;
  debitAccountCode: string;
  creditAccountCode: string;
  value: string;
  reference: string;
  clientId: string;
}

const EMPTY_ENTRY_FORM: EntryFormData = {
  date: new Date().toISOString().split("T")[0],
  description: "",
  debitAccountCode: "",
  creditAccountCode: "",
  value: "",
  reference: "",
  clientId: "1",
};

interface EntryDialogProps {
  accounts: ChartAccount[];
  defaultClientId: bigint;
  onClose: () => void;
  open: boolean;
  identity: import("@dfinity/agent").Identity | null | undefined;
}

function EntryDialog({
  accounts,
  defaultClientId,
  onClose,
  open,
  identity,
}: EntryDialogProps) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<EntryFormData>({
    ...EMPTY_ENTRY_FORM,
    clientId: defaultClientId.toString(),
  });

  const addMutation = useMutation({
    mutationFn: async (data: EntryFormData) => {
      if (!actor) throw new Error("Sem conexão com o backend");
      if (!data.debitAccountCode || !data.creditAccountCode)
        throw new Error("Contas de débito e crédito obrigatórias");
      const dateMs = new Date(data.date).getTime();
      const dateNs = BigInt(dateMs) * 1_000_000n;
      const now = BigInt(Date.now()) * 1_000_000n;
      const entry: JournalEntry = {
        id: 0n,
        date: dateNs,
        description: data.description,
        clientId: BigInt(data.clientId || "1"),
        debitAccountCode: data.debitAccountCode,
        creditAccountCode: data.creditAccountCode,
        value: BigInt(Math.round(Number(data.value) || 0)),
        reference: data.reference || undefined,
        createdBy: identity?.getPrincipal() as any,
        createdAt: now,
      };
      return (actor as any).addJournalEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      toast.success("Lançamento criado com sucesso");
      onClose();
      setForm({ ...EMPTY_ENTRY_FORM, clientId: defaultClientId.toString() });
    },
    onError: (e: Error) => toast.error(e.message || "Erro ao criar lançamento"),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.description.trim() ||
      !form.debitAccountCode ||
      !form.creditAccountCode
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    addMutation.mutate(form);
  }

  const activeAccounts = accounts.filter((a) => a.active);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        className="bg-card border-border max-w-lg"
        data-ocid="contabilidade.lancamentos.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Novo Lançamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="entry-date">Data *</Label>
              <Input
                id="entry-date"
                type="date"
                data-ocid="contabilidade.lancamentos.input"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="clientId">ID do Cliente *</Label>
              <Input
                id="clientId"
                type="number"
                data-ocid="contabilidade.lancamentos.input"
                value={form.clientId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, clientId: e.target.value }))
                }
                min="1"
                className="bg-background border-border"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="entry-description">Descrição *</Label>
            <Input
              id="entry-description"
              data-ocid="contabilidade.lancamentos.input"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Descrição do lançamento"
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-1">
            <Label>Conta Débito *</Label>
            <Select
              value={form.debitAccountCode}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, debitAccountCode: v }))
              }
            >
              <SelectTrigger
                data-ocid="contabilidade.lancamentos.select"
                className="bg-background border-border"
              >
                <SelectValue placeholder="Selecione conta débito" />
              </SelectTrigger>
              <SelectContent>
                {activeAccounts.map((a) => (
                  <SelectItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Conta Crédito *</Label>
            <Select
              value={form.creditAccountCode}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, creditAccountCode: v }))
              }
            >
              <SelectTrigger
                data-ocid="contabilidade.lancamentos.select"
                className="bg-background border-border"
              >
                <SelectValue placeholder="Selecione conta crédito" />
              </SelectTrigger>
              <SelectContent>
                {activeAccounts.map((a) => (
                  <SelectItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="entry-value">Valor (satoshis) *</Label>
              <Input
                id="entry-value"
                type="number"
                data-ocid="contabilidade.lancamentos.input"
                value={form.value}
                onChange={(e) =>
                  setForm((p) => ({ ...p, value: e.target.value }))
                }
                placeholder="Ex: 100000"
                min="0"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="reference">Referência</Label>
              <Input
                id="reference"
                data-ocid="contabilidade.lancamentos.input"
                value={form.reference}
                onChange={(e) =>
                  setForm((p) => ({ ...p, reference: e.target.value }))
                }
                placeholder="Ex: NF-1234"
                className="bg-background border-border"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="contabilidade.lancamentos.cancel_button"
              className="border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              data-ocid="contabilidade.lancamentos.submit_button"
              disabled={addMutation.isPending}
            >
              {addMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Criar Lançamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tab: Plano de Contas ──────────────────────────────────────────────────────

function PlanoDeContasTab({ canEdit }: { canEdit: boolean }) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ChartAccount | undefined>(
    undefined,
  );

  const { data: accounts = [], isLoading } = useQuery<ChartAccount[]>({
    queryKey: ["chartAccounts"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllChartAccounts();
    },
    enabled: !!actor && !isFetching,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Sem conexão com o backend");
      return (actor as any).deleteChartAccount(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chartAccounts"] });
      toast.success("Conta removida");
    },
    onError: () => toast.error("Erro ao remover conta"),
  });

  function openEdit(account: ChartAccount) {
    setEditTarget(account);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditTarget(undefined);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {canEdit && (
        <div className="flex justify-end">
          <Button
            data-ocid="contabilidade.contas.open_modal_button"
            onClick={() => {
              setEditTarget(undefined);
              setDialogOpen(true);
            }}
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Nova Conta
          </Button>
        </div>
      )}

      <AccountDialog
        mode={editTarget ? "edit" : "create"}
        account={editTarget}
        open={dialogOpen}
        onClose={closeDialog}
      />

      <Card className="bg-card border-border shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">
                    Código
                  </TableHead>
                  <TableHead className="text-muted-foreground">Nome</TableHead>
                  <TableHead className="text-muted-foreground">Tipo</TableHead>
                  <TableHead className="text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Criado em
                  </TableHead>
                  {canEdit && (
                    <TableHead className="text-muted-foreground text-right">
                      Ações
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  SKELETON_ROWS.map((key) => (
                    <TableRow
                      key={key}
                      data-ocid="contabilidade.contas.loading_state"
                      className="border-border/50"
                    >
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      {canEdit && (
                        <TableCell>
                          <Skeleton className="h-8 w-20 ml-auto" />
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : accounts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canEdit ? 6 : 5}
                      className="text-center py-12 text-muted-foreground"
                      data-ocid="contabilidade.contas.empty_state"
                    >
                      Nenhuma conta no plano de contas. Crie a primeira conta
                      para começar.
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((acc, i) => {
                    const typeLabel =
                      ACCOUNT_TYPE_LABELS[acc.accountType] ?? acc.accountType;
                    const typeColor =
                      ACCOUNT_TYPE_COLORS[acc.accountType] ??
                      "bg-muted/30 text-muted-foreground border-border";
                    return (
                      <TableRow
                        key={acc.id.toString()}
                        data-ocid={`contabilidade.contas.item.${i + 1}`}
                        className="border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="font-mono text-sm text-foreground">
                          {acc.code}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          <div>
                            {acc.name}
                            {acc.parentCode && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                ↳ {acc.parentCode}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${typeColor}`}
                          >
                            {typeLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              acc.active
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : "bg-muted/30 text-muted-foreground border-border"
                            }`}
                          >
                            {acc.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(acc.createdAt)}
                        </TableCell>
                        {canEdit && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                data-ocid={`contabilidade.contas.edit_button.${i + 1}`}
                                onClick={() => openEdit(acc)}
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                data-ocid={`contabilidade.contas.delete_button.${i + 1}`}
                                onClick={() => deleteMutation.mutate(acc.id)}
                                disabled={deleteMutation.isPending}
                                className="h-7 w-7 text-muted-foreground hover:text-red-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Tab: Lançamentos ─────────────────────────────────────────────────────────

interface LancamentosTabProps {
  canEdit: boolean;
  isAdmin: boolean;
  clientId: bigint;
  identity: import("@dfinity/agent").Identity | null | undefined;
}

function LancamentosTab({
  canEdit,
  isAdmin,
  clientId,
  identity,
}: LancamentosTabProps) {
  const { actor, isFetching } = useActor();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: accounts = [] } = useQuery<ChartAccount[]>({
    queryKey: ["chartAccounts"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllChartAccounts();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: entries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: isAdmin
      ? ["journalEntries"]
      : ["journalEntries", clientId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      if (isAdmin) return (actor as any).getAllJournalEntries();
      return (actor as any).getJournalEntriesByClientId(clientId);
    },
    enabled: !!actor && !isFetching,
  });

  const accountMap = new Map(accounts.map((a) => [a.code, a.name]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {canEdit && (
        <div className="flex justify-end">
          <Button
            data-ocid="contabilidade.lancamentos.open_modal_button"
            onClick={() => setDialogOpen(true)}
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Novo Lançamento
          </Button>
        </div>
      )}

      <EntryDialog
        accounts={accounts}
        defaultClientId={clientId}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        identity={identity}
      />

      <Card className="bg-card border-border shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Data</TableHead>
                  <TableHead className="text-muted-foreground">
                    Descrição
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
                    Referência
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  SKELETON_ROWS.map((key) => (
                    <TableRow
                      key={key}
                      data-ocid="contabilidade.lancamentos.loading_state"
                      className="border-border/50"
                    >
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24 ml-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : entries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-muted-foreground"
                      data-ocid="contabilidade.lancamentos.empty_state"
                    >
                      Nenhum lançamento contábil encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry, i) => (
                    <TableRow
                      key={entry.id.toString()}
                      data-ocid={`contabilidade.lancamentos.item.${i + 1}`}
                      className="border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(entry.date)}
                      </TableCell>
                      <TableCell className="font-medium text-foreground max-w-[160px] truncate">
                        {entry.description}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <span className="font-mono text-xs">
                          {entry.debitAccountCode}
                        </span>
                        {accountMap.has(entry.debitAccountCode) && (
                          <span className="ml-1 text-xs">
                            — {accountMap.get(entry.debitAccountCode)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <span className="font-mono text-xs">
                          {entry.creditAccountCode}
                        </span>
                        {accountMap.has(entry.creditAccountCode) && (
                          <span className="ml-1 text-xs">
                            — {accountMap.get(entry.creditAccountCode)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-foreground">
                        {formatBtc(entry.value)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.reference ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Page Entry ───────────────────────────────────────────────────────────────

interface ContabilidadePageProps {
  profile: UserProfile;
}

export default function ContabilidadePage({ profile }: ContabilidadePageProps) {
  const { identity } = useInternetIdentity();
  const canEdit =
    profile.businessRole === BusinessRole.admin ||
    profile.businessRole === BusinessRole.accountant;
  const isAdmin = profile.businessRole === BusinessRole.admin;
  const clientId =
    profile.businessRole === BusinessRole.admin ? 1n : (profile.clientId ?? 1n);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <BookOpen className="h-5 w-5" />
        <span className="text-sm">Contabilidade</span>
      </div>

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
          <PlanoDeContasTab canEdit={canEdit} />
        </TabsContent>

        <TabsContent value="lancamentos" className="mt-4">
          <LancamentosTab
            canEdit={canEdit}
            isAdmin={isAdmin}
            clientId={clientId}
            identity={identity}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
