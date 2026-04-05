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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface Cliente {
  id: number;
  empresa: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  plano: "Básico" | "Profissional" | "Enterprise";
  status: "Ativo" | "Inativo";
}

const initialClientes: Cliente[] = [
  {
    id: 1,
    empresa: "TechFin Brasil Ltda",
    cnpj: "12.345.678/0001-90",
    email: "contato@techfinbrasil.com.br",
    telefone: "(11) 3456-7890",
    endereco: "Av. Paulista, 1000 — São Paulo, SP",
    plano: "Enterprise",
    status: "Ativo",
  },
  {
    id: 2,
    empresa: "Mercado Digital S.A.",
    cnpj: "23.456.789/0001-01",
    email: "financeiro@mercadodigital.com",
    telefone: "(21) 2345-6789",
    endereco: "Rua do Comércio, 500 — Rio de Janeiro, RJ",
    plano: "Profissional",
    status: "Ativo",
  },
  {
    id: 3,
    empresa: "CriptoVault Investimentos",
    cnpj: "34.567.890/0001-12",
    email: "ops@criptovault.com.br",
    telefone: "(51) 3456-1234",
    endereco: "Av. Ipiranga, 200 — Porto Alegre, RS",
    plano: "Enterprise",
    status: "Ativo",
  },
  {
    id: 4,
    empresa: "StartupPay Tecnologia",
    cnpj: "45.678.901/0001-23",
    email: "tech@startuppay.io",
    telefone: "(31) 4567-8901",
    endereco: "R. da Bahia, 1234 — Belo Horizonte, MG",
    plano: "Básico",
    status: "Ativo",
  },
  {
    id: 5,
    empresa: "Holding Nacional Ltda",
    cnpj: "56.789.012/0001-34",
    email: "diretoria@holdingnacional.com.br",
    telefone: "(11) 5678-9012",
    endereco: "Faria Lima, 4321 — São Paulo, SP",
    plano: "Enterprise",
    status: "Inativo",
  },
  {
    id: 6,
    empresa: "FintechRedes Brasil",
    cnpj: "67.890.123/0001-45",
    email: "suporte@fintechredes.com.br",
    telefone: "(41) 6789-0123",
    endereco: "R. XV de Novembro, 321 — Curitiba, PR",
    plano: "Profissional",
    status: "Ativo",
  },
];

const planColors: Record<string, string> = {
  Básico: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  Profissional: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Enterprise: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);
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

  const filtered = clientes.filter(
    (c) =>
      c.empresa.toLowerCase().includes(search.toLowerCase()) ||
      c.cnpj.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

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
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCliente) {
      setClientes((prev) =>
        prev.map((c) => (c.id === editingCliente.id ? { ...c, ...form } : c)),
      );
      toast.success("Cliente atualizado com sucesso!");
    } else {
      const newCliente: Cliente = {
        id: Date.now(),
        ...form,
      };
      setClientes((prev) => [newCliente, ...prev]);
      toast.success("Cliente criado com sucesso!");
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: number, nome: string) => {
    setClientes((prev) => prev.filter((c) => c.id !== id));
    toast.success(`Cliente "${nome}" removido.`);
  };

  return (
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
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent
            data-ocid="clientes.dialog"
            className="sm:max-w-lg bg-card border-border"
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
                      <SelectItem value="Profissional">Profissional</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, status: v as Cliente["status"] }))
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
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="clientes.cancel_button"
                  className="flex-1"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  data-ocid="clientes.submit_button"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {editingCliente ? "Salvar alterações" : "Criar cliente"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                  <TableHead className="text-muted-foreground">CNPJ</TableHead>
                  <TableHead className="text-muted-foreground">
                    E-mail
                  </TableHead>
                  <TableHead className="text-muted-foreground">Plano</TableHead>
                  <TableHead className="text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground text-right">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      data-ocid="clientes.empty_state"
                      colSpan={6}
                      className="text-center text-muted-foreground py-12"
                    >
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((c, i) => (
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
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          data-ocid={`clientes.delete_button.${i + 1}`}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(c.id, c.empresa)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
