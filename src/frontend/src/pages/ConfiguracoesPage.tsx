import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  KeyRound,
  Loader2,
  Palette,
  Save,
  Shield,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BusinessRole } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { checkAdminPassword } from "../lib/adminPassword";

const roleLabels: Record<BusinessRole, string> = {
  [BusinessRole.client]: "Cliente — Empresa usando o serviço",
  [BusinessRole.accountant]: "Contador — Profissional contábil",
  [BusinessRole.admin]: "Administrador — Gestor da plataforma",
};

export default function ConfiguracoesPage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const principal = identity?.getPrincipal().toString();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<BusinessRole>(BusinessRole.client);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Admin password modal
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [adminSaving, setAdminSaving] = useState(false);

  useEffect(() => {
    if (!actor) return;
    let cancelled = false;
    actor
      .getCallerUserProfile()
      .then((profile) => {
        if (cancelled || !profile) return;
        setName(profile.name);
        setEmail(profile.email);
        setRole(profile.businessRole);
        // Se o perfil já é admin, marca como desbloqueado visualmente
        if (profile.businessRole === BusinessRole.admin) {
          setAdminUnlocked(true);
        }
      })
      .catch((err: unknown) => {
        console.error(err);
        toast.error("Erro ao carregar perfil.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [actor]);

  const handleAdminPasswordSubmit = async () => {
    if (!checkAdminPassword(adminPasswordInput)) {
      setPasswordError(true);
      setAdminPasswordInput("");
      return;
    }

    if (!actor) {
      toast.error("Ator não disponível. Tente novamente.");
      return;
    }

    setAdminSaving(true);
    try {
      await actor.saveCallerUserProfile({
        name: name.trim() || "Administrador",
        email: email.trim(),
        businessRole: BusinessRole.admin,
      });

      await queryClient.invalidateQueries({
        queryKey: ["userProfile", identity?.getPrincipal().toString()],
      });

      setAdminUnlocked(true);
      setRole(BusinessRole.admin);
      setShowAdminModal(false);
      setPasswordError(false);
      setAdminPasswordInput("");

      toast.success("Acesso administrativo ativado! Recarregando...");

      // Reload so the sidebar re-reads the profile from the backend
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao ativar acesso administrativo. Tente novamente.");
    } finally {
      setAdminSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;

    // Somente quem desbloqueou via senha pode salvar como admin
    const finalRole = adminUnlocked
      ? BusinessRole.admin
      : role === BusinessRole.admin
        ? BusinessRole.client
        : role;

    setSaving(true);
    try {
      await actor.saveCallerUserProfile({
        name: name.trim(),
        email: email.trim(),
        businessRole: finalRole,
      });
      toast.success("Perfil atualizado com sucesso!");
      queryClient.invalidateQueries({
        queryKey: ["userProfile", identity?.getPrincipal().toString()],
      });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Profile form */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informações do Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div
                data-ocid="configuracoes.loading_state"
                className="flex items-center gap-3 py-6"
              >
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-muted-foreground">
                  Carregando perfil...
                </span>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="cfg-name"
                      className="text-foreground font-medium"
                    >
                      Nome Completo *
                    </Label>
                    <Input
                      id="cfg-name"
                      data-ocid="configuracoes.input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                      className="bg-muted/30 border-border h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="cfg-email"
                      className="text-foreground font-medium"
                    >
                      E-mail *
                    </Label>
                    <Input
                      id="cfg-email"
                      data-ocid="configuracoes.input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com.br"
                      required
                      className="bg-muted/30 border-border h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Perfil</Label>
                  {adminUnlocked ? (
                    <div className="h-10 bg-amber-500/10 border border-amber-500/40 rounded-md px-3 flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-amber-400" />
                      <span className="text-sm text-amber-300 font-medium">
                        {roleLabels[BusinessRole.admin]}
                      </span>
                    </div>
                  ) : (
                    <>
                      <Select
                        value={role}
                        onValueChange={(v) => setRole(v as BusinessRole)}
                      >
                        <SelectTrigger
                          data-ocid="configuracoes.select"
                          className="bg-muted/30 border-border h-10"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={BusinessRole.client}>
                            {roleLabels[BusinessRole.client]}
                          </SelectItem>
                          <SelectItem value={BusinessRole.accountant}>
                            {roleLabels[BusinessRole.accountant]}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordError(false);
                          setAdminPasswordInput("");
                          setShowAdminModal(true);
                        }}
                        className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors underline underline-offset-2 mt-1"
                      >
                        Administração
                      </button>
                    </>
                  )}
                </div>

                <Button
                  data-ocid="configuracoes.submit_button"
                  type="submit"
                  disabled={saving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-btc"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Security info */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Segurança e Identidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Principal ICP
              </Label>
              <div className="mt-1.5 px-3 py-2 bg-muted/30 border border-border rounded-lg">
                <code className="text-xs font-mono text-foreground break-all">
                  {principal || "N/A"}
                </code>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sua identidade única e imutável no Internet Computer.
              </p>
            </div>
            <Separator className="bg-border/50" />
            <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <Shield className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-400">
                  Autenticado via Internet Identity
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sua conta está protegida por autenticação descentralizada sem
                  senhas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification preferences */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Preferências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  label: "Notificações de novas transações",
                  desc: "Alerta quando uma transação Bitcoin é detectada",
                },
                {
                  label: "Relatórios mensais automáticos",
                  desc: "Gera e envia DRE e Balanço no fechamento do mês",
                },
                {
                  label: "Alertas de vencimento",
                  desc: "Aviso 30 dias antes do vencimento da assinatura",
                },
              ].map((pref) => (
                <div
                  key={pref.label}
                  className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {pref.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{pref.desc}</p>
                  </div>
                  <div className="w-10 h-5 rounded-full bg-primary/30 border border-primary/50 flex items-center justify-end pr-0.5 cursor-pointer">
                    <div className="w-4 h-4 rounded-full bg-primary" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Theme */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Tema e Aparência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Escolha o tema da interface.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                data-ocid="configuracoes.toggle"
                className="flex-1 py-2.5 rounded-lg border border-primary/60 bg-primary/10 text-sm font-medium text-primary"
              >
                Escuro (padrão)
              </button>
              <button
                type="button"
                data-ocid="configuracoes.toggle"
                className="flex-1 py-2.5 rounded-lg border border-border bg-muted/20 text-sm font-medium text-muted-foreground hover:border-border/80 transition-colors"
              >
                Claro (em breve)
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Admin Password Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !adminSaving)
                setShowAdminModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <KeyRound className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-foreground">
                    Acesso Administrativo
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Digite a senha de 4 dígitos
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  type="password"
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="••••"
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setPasswordError(false);
                    setAdminPasswordInput(
                      e.target.value.replace(/\D/g, "").slice(0, 4),
                    );
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !adminSaving)
                      handleAdminPasswordSubmit();
                  }}
                  autoFocus
                  disabled={adminSaving}
                  className={`h-12 text-center text-2xl tracking-[0.5em] bg-input/50 border-border ${
                    passwordError ? "border-red-500/60 bg-red-500/5" : ""
                  }`}
                />
                {passwordError && (
                  <p className="text-xs text-red-400 text-center">
                    Senha incorreta. Tente novamente.
                  </p>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAdminModal(false)}
                    disabled={adminSaving}
                    className="flex-1 border-border text-muted-foreground hover:text-foreground"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAdminPasswordSubmit}
                    disabled={adminPasswordInput.length !== 4 || adminSaving}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold"
                  >
                    {adminSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Ativando...
                      </>
                    ) : (
                      "Confirmar"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
