import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Bitcoin,
  Building2,
  CheckCircle2,
  Edit2,
  Loader2,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useProfile } from "../context/ProfileContext";
import { useActor } from "../hooks/useActor";

import type { PageName } from "../App";

interface MinhaEmpresaPageProps {
  onNavigate: (page: PageName) => void;
}

const SEGMENTOS = [
  "Tecnologia",
  "Comércio",
  "Serviços",
  "Indústria",
  "Saúde",
  "Educação",
  "Construção",
  "Agropecuária",
  "Outro",
];

function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function displayCnpj(raw: string | undefined): string {
  if (!raw) return "";
  return formatCnpj(raw);
}

function validateCnpj(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 14;
}

function validateBitcoinAddress(address: string): boolean {
  if (!address) return true; // optional
  return (
    address.startsWith("bc1") ||
    address.startsWith("1") ||
    address.startsWith("3")
  );
}

export default function MinhaEmpresaPage({
  onNavigate,
}: MinhaEmpresaPageProps) {
  const { profile, setProfile } = useProfile();
  const { actor } = useActor();

  const hasCompanyData = !!(profile?.companyName && profile?.cnpj);
  const [editing, setEditing] = useState(!hasCompanyData);

  const [form, setForm] = useState({
    companyName: profile?.companyName ?? "",
    cnpj: displayCnpj(profile?.cnpj),
    segment: profile?.segment ?? "",
    responsibleName: profile?.responsibleName ?? "",
    email: profile?.companyEmail ?? "",
    phone: profile?.companyPhone ?? "",
    bitcoinAddress: profile?.companyWallet ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync form when profile changes externally
  useEffect(() => {
    if (profile && !editing) {
      setForm({
        companyName: profile.companyName ?? "",
        cnpj: displayCnpj(profile.cnpj),
        segment: profile.segment ?? "",
        responsibleName: profile.responsibleName ?? "",
        email: profile.companyEmail ?? "",
        phone: profile.companyPhone ?? "",
        bitcoinAddress: profile.companyWallet ?? "",
      });
    }
  }, [profile, editing]);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!form.companyName.trim())
      newErrors.companyName = "Nome da empresa é obrigatório.";
    if (!form.cnpj.trim()) {
      newErrors.cnpj = "CNPJ é obrigatório.";
    } else if (!validateCnpj(form.cnpj)) {
      newErrors.cnpj = "CNPJ inválido. Use o formato XX.XXX.XXX/XXXX-XX.";
    }
    if (!form.segment) newErrors.segment = "Selecione o segmento de negócio.";
    if (!form.responsibleName.trim())
      newErrors.responsibleName = "Nome do responsável é obrigatório.";
    if (!form.email.trim()) {
      newErrors.email = "E-mail é obrigatório.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "E-mail inválido.";
    }
    if (!form.phone.trim()) newErrors.phone = "Telefone é obrigatório.";
    if (form.bitcoinAddress && !validateBitcoinAddress(form.bitcoinAddress)) {
      newErrors.bitcoinAddress =
        "Endereço Bitcoin inválido. Deve começar com bc1, 1 ou 3.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !actor || !profile) return;

    setSubmitting(true);
    try {
      await actor.saveCompanyProfile(
        form.companyName.trim(),
        form.cnpj.replace(/\D/g, ""),
        form.segment,
        form.responsibleName.trim(),
        form.email.trim(),
        form.phone.trim(),
        form.bitcoinAddress.trim(),
      );

      setProfile({
        ...profile,
        companyName: form.companyName.trim(),
        cnpj: form.cnpj.replace(/\D/g, ""),
        segment: form.segment,
        responsibleName: form.responsibleName.trim(),
        companyEmail: form.email.trim(),
        companyPhone: form.phone.trim(),
        companyWallet: form.bitcoinAddress.trim() || undefined,
        demoMode: false,
      });

      setSuccess(true);
      setEditing(false);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch {
      setErrors({ submit: "Erro ao salvar os dados. Tente novamente." });
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <div
          className="flex flex-col items-center gap-5 text-center max-w-sm"
          data-ocid="minha-empresa.success.state"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">
              Dados salvos com sucesso!
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Os dados da sua empresa foram atualizados.
            </p>
          </div>
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse [animation-delay:150ms]" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Minha Empresa
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {hasCompanyData && !editing
                  ? "Dados da sua empresa cadastrada no SatAuditor."
                  : "Cadastre os dados da sua empresa para usar o SatAuditor com dados reais."}
              </p>
            </div>
          </div>
          {hasCompanyData && !editing && (
            <Button
              variant="outline"
              size="sm"
              data-ocid="minha-empresa.edit_btn"
              onClick={() => setEditing(true)}
              className="border-border gap-2 shrink-0"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Editar
            </Button>
          )}
        </div>

        {/* View mode — company data already saved */}
        {hasCompanyData && !editing && profile && (
          <div className="space-y-4" data-ocid="minha-empresa.view.panel">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Dados da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-muted-foreground mb-1">
                      Nome da Empresa
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {profile.companyName || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground mb-1">CNPJ</dt>
                    <dd className="text-sm font-medium text-foreground font-mono">
                      {displayCnpj(profile.cnpj) || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground mb-1">
                      Segmento
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {profile.segment || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground mb-1">
                      Responsável
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {profile.responsibleName || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground mb-1">
                      E-mail
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {profile.companyEmail || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground mb-1">
                      Telefone
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {profile.companyPhone || "—"}
                    </dd>
                  </div>
                  {profile.companyWallet && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-muted-foreground mb-1">
                        Endereço Bitcoin
                      </dt>
                      <dd className="text-sm font-mono text-foreground break-all">
                        {profile.companyWallet}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                data-ocid="minha-empresa.goto_wallet_btn"
                onClick={() => onNavigate("carteira")}
                className="border-primary/30 text-primary hover:bg-primary/10 gap-2"
              >
                <Bitcoin className="h-4 w-4" />
                Gerenciar Carteira
              </Button>
            </div>
          </div>
        )}

        {/* Edit / Setup mode — form */}
        {editing && (
          <>
            {/* Info banner */}
            <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <Bitcoin className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-300">
                Após cadastrar sua empresa, todos os módulos passarão a usar
                dados reais. O endereço Bitcoin/ckBTC é opcional e pode ser
                adicionado depois em Carteira.
              </p>
            </div>

            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Dados da Empresa
                </CardTitle>
                <CardDescription>
                  Todas as informações marcadas com * são obrigatórias.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  data-ocid="minha-empresa.form"
                >
                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="companyName">
                      Nome da Empresa{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="companyName"
                      data-ocid="minha-empresa.companyName.input"
                      placeholder="Ex: Empresa Ltda"
                      value={form.companyName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, companyName: e.target.value }))
                      }
                      className={errors.companyName ? "border-destructive" : ""}
                    />
                    {errors.companyName && (
                      <p className="text-xs text-destructive">
                        {errors.companyName}
                      </p>
                    )}
                  </div>

                  {/* CNPJ + Segment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="cnpj">
                        CNPJ <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="cnpj"
                        data-ocid="minha-empresa.cnpj.input"
                        placeholder="XX.XXX.XXX/XXXX-XX"
                        value={form.cnpj}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            cnpj: formatCnpj(e.target.value),
                          }))
                        }
                        className={errors.cnpj ? "border-destructive" : ""}
                      />
                      {errors.cnpj && (
                        <p className="text-xs text-destructive">
                          {errors.cnpj}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="segment">
                        Segmento de Negócio{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={form.segment}
                        onValueChange={(v) =>
                          setForm((f) => ({ ...f, segment: v }))
                        }
                      >
                        <SelectTrigger
                          id="segment"
                          data-ocid="minha-empresa.segment.select"
                          className={errors.segment ? "border-destructive" : ""}
                        >
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SEGMENTOS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.segment && (
                        <p className="text-xs text-destructive">
                          {errors.segment}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Responsible */}
                  <div className="space-y-1.5">
                    <Label htmlFor="responsibleName">
                      Nome do Responsável{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="responsibleName"
                      data-ocid="minha-empresa.responsibleName.input"
                      placeholder="Nome completo do responsável legal"
                      value={form.responsibleName}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          responsibleName: e.target.value,
                        }))
                      }
                      className={
                        errors.responsibleName ? "border-destructive" : ""
                      }
                    />
                    {errors.responsibleName && (
                      <p className="text-xs text-destructive">
                        {errors.responsibleName}
                      </p>
                    )}
                  </div>

                  {/* Email + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email">
                        E-mail <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        data-ocid="minha-empresa.email.input"
                        placeholder="contato@empresa.com.br"
                        value={form.email}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, email: e.target.value }))
                        }
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">
                        Telefone <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        data-ocid="minha-empresa.phone.input"
                        placeholder="(XX) XXXXX-XXXX"
                        value={form.phone}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, phone: e.target.value }))
                        }
                        className={errors.phone ? "border-destructive" : ""}
                      />
                      {errors.phone && (
                        <p className="text-xs text-destructive">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bitcoin address (optional) */}
                  <div className="space-y-1.5">
                    <Label htmlFor="bitcoinAddress">
                      Endereço Bitcoin / ckBTC{" "}
                      <span className="text-muted-foreground text-xs font-normal">
                        (opcional)
                      </span>
                    </Label>
                    <Input
                      id="bitcoinAddress"
                      data-ocid="minha-empresa.bitcoinAddress.input"
                      placeholder="bc1q... ou 1... ou 3..."
                      value={form.bitcoinAddress}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          bitcoinAddress: e.target.value,
                        }))
                      }
                      className={
                        errors.bitcoinAddress ? "border-destructive" : ""
                      }
                    />
                    {errors.bitcoinAddress ? (
                      <p className="text-xs text-destructive">
                        {errors.bitcoinAddress}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Você pode adicionar ou gerar um endereço depois em
                        Carteira Bitcoin.
                      </p>
                    )}
                  </div>

                  {errors.submit && (
                    <p className="text-sm text-destructive text-center">
                      {errors.submit}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <Button
                      type="submit"
                      data-ocid="minha-empresa.submit.button"
                      disabled={submitting}
                      className="sm:flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Salvando…
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Salvar Dados
                        </>
                      )}
                    </Button>
                    {hasCompanyData && (
                      <Button
                        type="button"
                        variant="outline"
                        data-ocid="minha-empresa.cancel.button"
                        onClick={() => {
                          setEditing(false);
                          setErrors({});
                        }}
                        disabled={submitting}
                      >
                        Cancelar
                      </Button>
                    )}
                    {!hasCompanyData && (
                      <Button
                        type="button"
                        variant="outline"
                        data-ocid="minha-empresa.skip.button"
                        onClick={() => onNavigate("dashboard")}
                        disabled={submitting}
                      >
                        Fazer depois
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
