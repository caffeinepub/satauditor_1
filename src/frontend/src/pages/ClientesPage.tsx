import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useActor } from "@/hooks/useActor";
import { PlanType, WalletType } from "@/types/domain";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Copy,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
// ── Types ─────────────────────────────────────────────────────────────────────

interface Cliente {
  id: number;
  empresa: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  plano: "Básico" | "Profissional" | "Enterprise";
  status: "Ativo" | "Inativo";
  bitcoinAddress?: string;
  walletType?: "manual" | "ckbtc";
}

// ── Mapping helpers ──────────────────────────────────────────────────────────

function planTypeToPortuguese(plan: PlanType): Cliente["plano"] {
  switch (plan) {
    case PlanType.basic:
      return "Básico";
    case PlanType.professional:
      return "Profissional";
    case PlanType.enterprise:
      return "Enterprise";
    default:
      return "Básico";
  }
}

function portugueseToPlanType(plano: Cliente["plano"]): PlanType {
  switch (plano) {
    case "Básico":
      return PlanType.basic;
    case "Profissional":
      return PlanType.professional;
    case "Enterprise":
      return PlanType.enterprise;
  }
}

function backendToLocal(c: {
  id: bigint;
  active: boolean;
  cnpj: string;
  name: string;
  createdAt: bigint;
  plan: PlanType;
  walletType?: WalletType;
  email: string;
  updatedAt: bigint;
  address: string;
  bitcoinAddress?: string;
  phone: string;
}): Cliente {
  return {
    id: Number(c.id),
    empresa: c.name,
    cnpj: c.cnpj,
    email: c.email,
    telefone: c.phone,
    endereco: c.address,
    plano: planTypeToPortuguese(c.plan),
    status: c.active ? "Ativo" : "Inativo",
    bitcoinAddress: c.bitcoinAddress,
    walletType:
      c.walletType === WalletType.ckbtc
        ? "ckbtc"
        : c.walletType === WalletType.manual
          ? "manual"
          : undefined,
  };
}

// ── Visual helpers ────────────────────────────────────────────────────────────

const planColors: Record<string, string> = {
  Básico: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  Profissional: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Enterprise: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

function truncateAddress(addr: string): string {
  if (addr.length <= 20) return addr;
  return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
}

function isValidBitcoinAddress(addr: string): boolean {
  return addr.startsWith("1") || addr.startsWith("3") || addr.startsWith("bc1");
}

function formatSats(sats: bigint): string {
  return `${sats.toLocaleString("pt-BR")} sats`;
}

function CopyButton({ text }: { text: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Endereço copiado!");
    });
  };
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="h-6 w-6 text-muted-foreground hover:text-foreground flex-shrink-0"
      onClick={handleCopy}
    >
      <Copy className="h-3.5 w-3.5" />
    </Button>
  );
}

// ── ckBTC balance badge (non-blocking) ────────────────────────────────────────

function CkBtcBalanceBadge({
  clientId,
  actor,
}: { clientId: number; actor: any }) {
  const { data: balance } = useQuery({
    queryKey: ["ckbtc-balance", clientId],
    queryFn: async () => {
      const result = await actor.getCkBtcBalance(BigInt(clientId));
      return result as bigint;
    },
    enabled: !!actor,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (balance === undefined || balance === null) return null;

  return (
    <span className="text-[10px] text-purple-300/70 ml-1">
      {formatSats(balance)}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ClientesPage() {
  const { actor, isFetching: actorLoading } = useActor();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  const [form, setForm] = useState({
    empresa: "",
    cnpj: "",
    email: "",
    telefone: "",
    endereco: "",
    plano: "Básico" as Cliente["plano"],
    status: "Ativo" as Cliente["status"],
  });

  const [walletMode, setWalletMode] = useState<"manual" | "ckbtc" | "">("");
  const [manualAddress, setManualAddress] = useState("");
  const [generatedAddress, setGeneratedAddress] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // ── Query: list all clients ──────────────────────────────────────────────
  const {
    data: clientes = [],
    isLoading: clientesLoading,
    isError: clientesError,
  } = useQuery<Cliente[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllClients();
      return result.map(backendToLocal);
    },
    enabled: !!actor && !actorLoading,
    staleTime: 30000,
    refetchInterval: false,
  });

  // ── Mutation: create client ──────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async ({
      formData,
      walletModeVal,
      manualAddressVal,
    }: {
      formData: typeof form;
      walletModeVal: "manual" | "ckbtc" | "";
      manualAddressVal: string;
    }) => {
      if (!actor) throw new Error("Actor não disponível");

      const newClient = {
        id: 0n,
        name: formData.empresa,
        cnpj: formData.cnpj,
        email: formData.email,
        phone: formData.telefone,
        address: formData.endereco,
        plan: portugueseToPlanType(formData.plano),
        active: formData.status === "Ativo",
        createdAt: BigInt(Date.now()) * 1_000_000n,
        updatedAt: BigInt(Date.now()) * 1_000_000n,
        bitcoinAddress:
          walletModeVal === "manual" && manualAddressVal
            ? manualAddressVal
            : undefined,
        walletType:
          walletModeVal === "ckbtc"
            ? WalletType.ckbtc
            : walletModeVal === "manual"
              ? WalletType.manual
              : undefined,
      };

      const newId = await actor.registerClient(newClient);

      if (walletModeVal === "manual" && manualAddressVal) {
        await actor.setClientBitcoinAddress(
          newId,
          manualAddressVal,
          WalletType.manual,
        );
      }

      return newId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente criado com sucesso!");
      setDialogOpen(false);
      resetForm();
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : "Erro ao criar cliente";
      toast.error(msg);
    },
  });

  // ── Mutation: edit client ────────────────────────────────────────────────
  const editMutation = useMutation({
    mutationFn: async ({
      clienteId,
      formData,
      walletModeVal,
      manualAddressVal,
      generatedAddressVal,
      originalCliente,
    }: {
      clienteId: number;
      formData: typeof form;
      walletModeVal: "manual" | "ckbtc" | "";
      manualAddressVal: string;
      generatedAddressVal: string;
      originalCliente: Cliente;
    }) => {
      if (!actor) throw new Error("Actor não disponível");

      const resolvedAddress =
        walletModeVal === "manual"
          ? manualAddressVal
          : walletModeVal === "ckbtc"
            ? generatedAddressVal
            : undefined;

      const updatedClient = {
        id: BigInt(clienteId),
        name: formData.empresa,
        cnpj: formData.cnpj,
        email: formData.email,
        phone: formData.telefone,
        address: formData.endereco,
        plan: portugueseToPlanType(formData.plano),
        active: formData.status === "Ativo",
        createdAt: 0n,
        updatedAt: BigInt(Date.now()) * 1_000_000n,
        bitcoinAddress: resolvedAddress ?? originalCliente.bitcoinAddress,
        walletType:
          walletModeVal !== ""
            ? walletModeVal === "ckbtc"
              ? WalletType.ckbtc
              : WalletType.manual
            : originalCliente.walletType === "ckbtc"
              ? WalletType.ckbtc
              : originalCliente.walletType === "manual"
                ? WalletType.manual
                : undefined,
      };

      await actor.editClient(BigInt(clienteId), updatedClient);

      if (walletModeVal !== "" && resolvedAddress) {
        await actor.setClientBitcoinAddress(
          BigInt(clienteId),
          resolvedAddress,
          walletModeVal === "ckbtc" ? WalletType.ckbtc : WalletType.manual,
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Cliente atualizado com sucesso!");
      setDialogOpen(false);
      resetForm();
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : "Erro ao editar cliente";
      toast.error(msg);
    },
  });

  // ── Mutation: delete client ──────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: async ({ clienteId }: { clienteId: number }) => {
      if (!actor) throw new Error("Actor não disponível");
      await actor.deleteClient(BigInt(clienteId));
    },
    onSuccess: (_, { clienteId }) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      const nome =
        clientes.find((c) => c.id === clienteId)?.empresa ?? "Cliente";
      toast.success(`Cliente "${nome}" removido.`);
    },
    onError: (err) => {
      const msg =
        err instanceof Error ? err.message : "Erro ao remover cliente";
      toast.error(msg);
    },
  });

  const isMutating =
    createMutation.isPending ||
    editMutation.isPending ||
    deleteMutation.isPending;

  // ── Filtered list ────────────────────────────────────────────────────────
  const filtered = clientes.filter(
    (c) =>
      c.empresa.toLowerCase().includes(search.toLowerCase()) ||
      c.cnpj.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Form helpers ─────────────────────────────────────────────────────────
  const resetForm = () => {
    setForm({
      empresa: "",
      cnpj: "",
      email: "",
      telefone: "",
      endereco: "",
      plano: "Básico",
      status: "Ativo",
    });
    setWalletMode("");
    setManualAddress("");
    setGeneratedAddress("");
    setIsGenerating(false);
    setEditingCliente(null);
  };

  const handleOpenEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setForm({
      empresa: cliente.empresa,
      cnpj: cliente.cnpj,
      email: cliente.email,
      telefone: cliente.telefone,
      endereco: cliente.endereco,
      plano: cliente.plano,
      status: cliente.status,
    });
    setWalletMode(cliente.walletType ?? "");
    setManualAddress(
      cliente.walletType === "manual" ? (cliente.bitcoinAddress ?? "") : "",
    );
    setGeneratedAddress(
      cliente.walletType === "ckbtc" ? (cliente.bitcoinAddress ?? "") : "",
    );
    setIsGenerating(false);
    setDialogOpen(true);
  };

  const handleGenerateCkBtcAddress = async () => {
    if (!editingCliente) return;
    if (!actor) {
      toast.error("Canister não disponível. Tente novamente.");
      return;
    }
    setIsGenerating(true);
    try {
      const address = await actor.generateCkBtcAddress(
        BigInt(editingCliente.id),
      );
      setGeneratedAddress(address);
      toast.success("Endereço ckBTC gerado com sucesso!");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao gerar endereço ckBTC";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCliente) {
      editMutation.mutate({
        clienteId: editingCliente.id,
        formData: form,
        walletModeVal: walletMode,
        manualAddressVal: manualAddress,
        generatedAddressVal: generatedAddress,
        originalCliente: editingCliente,
      });
    } else {
      createMutation.mutate({
        formData: form,
        walletModeVal: walletMode,
        manualAddressVal: manualAddress,
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ clienteId: id });
  };

  const manualAddressValid =
    manualAddress === "" || isValidBitcoinAddress(manualAddress);

  const isSubmitting = createMutation.isPending || editMutation.isPending;

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        {/* Header actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              data-ocid="clientes.search_input"
              placeholder="Buscar clientes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button
                data-ocid="clientes.open_modal_button"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-btc"
                onClick={resetForm}
                disabled={actorLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent
              data-ocid="clientes.dialog"
              className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto"
            >
              <DialogHeader>
                <DialogTitle className="font-display text-lg">
                  {editingCliente ? "Editar Cliente" : "Novo Cliente"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="c-empresa">Nome da Empresa *</Label>
                    <Input
                      id="c-empresa"
                      data-ocid="clientes.input"
                      value={form.empresa}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, empresa: e.target.value }))
                      }
                      placeholder="Empresa S.A."
                      required
                      className="bg-muted/30 border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-cnpj">CNPJ *</Label>
                    <Input
                      id="c-cnpj"
                      data-ocid="clientes.input"
                      value={form.cnpj}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, cnpj: e.target.value }))
                      }
                      placeholder="00.000.000/0001-00"
                      required
                      className="bg-muted/30 border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-tel">Telefone</Label>
                    <Input
                      id="c-tel"
                      data-ocid="clientes.input"
                      value={form.telefone}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, telefone: e.target.value }))
                      }
                      placeholder="(11) 1234-5678"
                      className="bg-muted/30 border-border"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="c-email">E-mail *</Label>
                    <Input
                      id="c-email"
                      data-ocid="clientes.input"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="contato@empresa.com.br"
                      required
                      className="bg-muted/30 border-border"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="c-end">Endereço</Label>
                    <Input
                      id="c-end"
                      data-ocid="clientes.input"
                      value={form.endereco}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, endereco: e.target.value }))
                      }
                      placeholder="Av. Paulista, 1000 — São Paulo, SP"
                      className="bg-muted/30 border-border"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Plano</Label>
                    <Select
                      value={form.plano}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, plano: v as Cliente["plano"] }))
                      }
                    >
                      <SelectTrigger
                        data-ocid="clientes.select"
                        className="bg-muted/30 border-border"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Básico">Básico</SelectItem>
                        <SelectItem value="Profissional">
                          Profissional
                        </SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(v) =>
                        setForm((p) => ({
                          ...p,
                          status: v as Cliente["status"],
                        }))
                      }
                    >
                      <SelectTrigger
                        data-ocid="clientes.select"
                        className="bg-muted/30 border-border"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bitcoin Wallet Section */}
                <Separator className="my-2" />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-amber-400" />
                    <Label className="text-sm font-semibold text-foreground">
                      Carteira Bitcoin
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      (opcional)
                    </span>
                  </div>

                  <RadioGroup
                    value={walletMode}
                    onValueChange={(v) => {
                      setWalletMode(v as "manual" | "ckbtc");
                      setGeneratedAddress("");
                    }}
                    className="space-y-2"
                  >
                    <div className="flex items-start gap-2.5 rounded-md border border-border bg-muted/20 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors">
                      <RadioGroupItem
                        value="manual"
                        id="wallet-manual"
                        data-ocid="clientes.radio"
                        className="mt-0.5"
                      />
                      <div>
                        <Label
                          htmlFor="wallet-manual"
                          className="cursor-pointer font-medium text-sm"
                        >
                          Endereço manual
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Digitar/colar endereço de carteira externa (ex: Blue
                          Wallet)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 rounded-md border border-border bg-muted/20 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors">
                      <RadioGroupItem
                        value="ckbtc"
                        id="wallet-ckbtc"
                        data-ocid="clientes.radio"
                        className="mt-0.5"
                      />
                      <div>
                        <Label
                          htmlFor="wallet-ckbtc"
                          className="cursor-pointer font-medium text-sm"
                        >
                          Gerar via ICP (ckBTC)
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Gera endereço exclusivo usando integração nativa do
                          ICP
                        </p>
                      </div>
                    </div>
                  </RadioGroup>

                  {/* Manual address input */}
                  {walletMode === "manual" && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1.5"
                    >
                      <Label htmlFor="c-btc">Endereço Bitcoin</Label>
                      <div className="relative">
                        <Input
                          id="c-btc"
                          data-ocid="clientes.input"
                          value={manualAddress}
                          onChange={(e) => setManualAddress(e.target.value)}
                          placeholder="bc1q... ou 3... ou 1..."
                          className={`bg-muted/30 border-border pr-10 font-mono text-sm ${
                            manualAddress && !manualAddressValid
                              ? "border-red-500/60 focus-visible:ring-red-500/30"
                              : manualAddress && manualAddressValid
                                ? "border-emerald-500/60 focus-visible:ring-emerald-500/30"
                                : ""
                          }`}
                        />
                        {manualAddress && (
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                            {manualAddressValid ? (
                              <span className="text-emerald-400 text-xs font-bold">
                                ✓
                              </span>
                            ) : (
                              <span className="text-red-400 text-xs font-bold">
                                ✗
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {manualAddress && !manualAddressValid && (
                        <p
                          data-ocid="clientes.error_state"
                          className="text-xs text-red-400"
                        >
                          Endereço Bitcoin inválido. Deve começar com "1", "3"
                          ou "bc1".
                        </p>
                      )}
                      {manualAddress && manualAddressValid && (
                        <div className="flex items-center gap-2 rounded-md bg-muted/30 border border-border px-3 py-2">
                          <span className="font-mono text-xs text-muted-foreground flex-1 truncate">
                            {truncateAddress(manualAddress)}
                          </span>
                          <CopyButton text={manualAddress} />
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ckBTC generation */}
                  {walletMode === "ckbtc" && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      {!editingCliente ? (
                        <div className="rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2.5">
                          <p className="text-xs text-amber-400">
                            💡 Salve o cliente primeiro para gerar o endereço
                            ckBTC.
                          </p>
                        </div>
                      ) : (
                        <>
                          {generatedAddress ? (
                            <div className="space-y-1.5">
                              <Label className="text-xs text-muted-foreground">
                                Endereço gerado
                              </Label>
                              <div className="flex items-center gap-2 rounded-md bg-muted/30 border border-emerald-500/30 px-3 py-2">
                                <span className="font-mono text-xs text-emerald-400 flex-1 truncate">
                                  {truncateAddress(generatedAddress)}
                                </span>
                                <CopyButton text={generatedAddress} />
                              </div>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              data-ocid="clientes.secondary_button"
                              variant="outline"
                              className="w-full border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                              onClick={handleGenerateCkBtcAddress}
                              disabled={isGenerating}
                            >
                              {isGenerating ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Gerando...
                                </>
                              ) : (
                                <>
                                  <span className="mr-2 text-base leading-none">
                                    ₿
                                  </span>
                                  Gerar Endereço Bitcoin
                                </>
                              )}
                            </Button>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    data-ocid="clientes.cancel_button"
                    className="flex-1"
                    onClick={() => setDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    data-ocid="clientes.submit_button"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingCliente ? "Salvando..." : "Criando..."}
                      </>
                    ) : editingCliente ? (
                      "Salvar alterações"
                    ) : (
                      "Criar cliente"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Error state */}
        {clientesError && (
          <div
            data-ocid="clientes.error_state"
            className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
          >
            Erro ao carregar clientes. Verifique a conexão e tente novamente.
          </div>
        )}

        {/* Table */}
        <Card className="bg-card border-border shadow-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Empresa
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      CNPJ
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      E-mail
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Plano
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Carteira
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground text-right">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Loading skeleton */}
                  {clientesLoading &&
                    [1, 2, 3, 4].map((i) => (
                      <TableRow
                        key={i}
                        data-ocid="clientes.loading_state"
                        className="border-b border-border/50"
                      >
                        <TableCell>
                          <Skeleton className="h-4 w-36" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-28" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-14 rounded-full" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-7 w-16 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))}

                  {/* Empty state */}
                  {!clientesLoading && filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        data-ocid="clientes.empty_state"
                        colSpan={7}
                        className="text-center text-muted-foreground py-12"
                      >
                        {search
                          ? "Nenhum cliente encontrado para esta busca."
                          : "Nenhum cliente cadastrado ainda."}
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Client rows */}
                  {!clientesLoading &&
                    filtered.map((c, i) => (
                      <motion.tr
                        key={c.id}
                        data-ocid={`clientes.item.${i + 1}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="font-medium text-foreground">
                          {c.empresa}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {c.cnpj}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {c.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${planColors[c.plano]}`}
                          >
                            {c.plano}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {c.bitcoinAddress ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 cursor-default">
                                  <span className="text-amber-400 font-bold text-sm leading-none">
                                    ₿
                                  </span>
                                  <span className="font-mono text-xs text-amber-400/80">
                                    {truncateAddress(c.bitcoinAddress)}
                                  </span>
                                  {c.walletType === "ckbtc" && (
                                    <>
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] py-0 px-1 h-4 bg-purple-500/20 text-purple-400 border-purple-500/30 leading-none"
                                      >
                                        ckBTC
                                      </Badge>
                                      <CkBtcBalanceBadge
                                        clientId={c.id}
                                        actor={actor}
                                      />
                                    </>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                data-ocid="clientes.tooltip"
                                side="top"
                                className="max-w-xs"
                              >
                                <p className="font-mono text-xs break-all">
                                  {c.bitcoinAddress}
                                </p>
                                {c.walletType && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Tipo:{" "}
                                    {c.walletType === "ckbtc"
                                      ? "ckBTC (ICP)"
                                      : "Manual"}
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              c.status === "Ativo"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-red-500/20 text-red-400 border-red-500/30"
                            }`}
                          >
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              data-ocid={`clientes.edit_button.${i + 1}`}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => handleOpenEdit(c)}
                              disabled={isMutating}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              data-ocid={`clientes.delete_button.${i + 1}`}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(c.id)}
                              disabled={isMutating || deleteMutation.isPending}
                            >
                              {deleteMutation.isPending &&
                              deleteMutation.variables?.clienteId === c.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
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
    </TooltipProvider>
  );
}
