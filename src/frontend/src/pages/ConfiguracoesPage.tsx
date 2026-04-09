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
import {
  Bell,
  KeyRound,
  Loader2,
  Palette,
  Plus,
  Save,
  Shield,
  Trash2,
  User,
  UserCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useProfile } from "../context/ProfileContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { checkAdminPassword } from "../lib/adminPassword";
import { BusinessRole } from "../types/domain";

const roleLabels: Record<BusinessRole, string> = {
  [BusinessRole.client]: "Cliente — Empresa usando o serviço",
  [BusinessRole.accountant]: "Contador — Profissional contábil",
  [BusinessRole.admin]: "Administrador — Gestor da plataforma",
};

// Helper to call optional actor methods (not yet in backend.d.ts)
type ActorWithEmailMethods = {
  addAuthorizedEmail?: (email: string) => Promise<void>;
  removeAuthorizedEmail?: (email: string) => Promise<void>;
  getAuthorizedEmails?: () => Promise<string[]>;
};

export default function ConfiguracoesPage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { profile, setProfile } = useProfile();

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

  // Authorized emails management
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [addingEmail, setAddingEmail] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  const isAdmin = adminUnlocked || profile?.businessRole === BusinessRole.admin;

  // Populate form from ProfileContext (no extra backend call needed)
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setRole(profile.businessRole);
      if (profile.businessRole === BusinessRole.admin) {
        setAdminUnlocked(true);
      }
      setLoading(false);
    } else if (actor) {
      actor
        .getCallerUserProfile()
        .then((p) => {
          if (!p) return;
          setName(p.name);
          setEmail(p.email);
          setRole(p.businessRole);
          if (p.businessRole === BusinessRole.admin) {
            setAdminUnlocked(true);
          }
        })
        .catch((err: unknown) => {
          console.error(err);
          toast.error("Erro ao carregar perfil.");
        })
        .finally(() => setLoading(false));
    }
  }, [profile, actor]);

  // Load authorized emails when admin is unlocked
  useEffect(() => {
    if (!isAdmin || !actor) return;
    const ext = actor as unknown as ActorWithEmailMethods;

    setEmailsLoading(true);
    (ext.getAuthorizedEmails
      ? ext.getAuthorizedEmails()
      : Promise.resolve([] as string[])
    )
      .then((emails) => setAuthorizedEmails(emails ?? []))
      .catch((err: unknown) => {
        console.error(err);
        toast.error("Erro ao carregar e-mails autorizados.");
      })
      .finally(() => setEmailsLoading(false));
  }, [isAdmin, actor]);

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
      const adminProfile = {
        name: name.trim() || "Administrador",
        email: email.trim(),
        businessRole: BusinessRole.admin,
      };

      await actor.saveCallerUserProfile(adminProfile);

      setProfile({ ...adminProfile, demoMode: profile?.demoMode });
      setAdminUnlocked(true);
      setRole(BusinessRole.admin);
      setShowAdminModal(false);
      setPasswordError(false);
      setAdminPasswordInput("");

      toast.success("Acesso administrativo ativado!");
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

    const finalRole = adminUnlocked
      ? BusinessRole.admin
      : role === BusinessRole.admin
        ? BusinessRole.client
        : role;

    setSaving(true);
    try {
      const updatedProfile = {
        name: name.trim(),
        email: email.trim(),
        businessRole: finalRole,
      };

      await actor.saveCallerUserProfile(updatedProfile);

      setProfile({
        ...(profile ?? { name: "", email: "", businessRole: finalRole }),
        ...updatedProfile,
      });
      toast.success("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar perfil. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddEmail = async () => {
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      toast.error("Digite um e-mail válido.");
      return;
    }
    if (authorizedEmails.includes(trimmed)) {
      toast.info("Este e-mail já está na lista.");
      return;
    }

    if (!isAdmin) {
      toast.error("Apenas administradores podem adicionar e-mails.");
      return;
    }

    const ext = actor as unknown as ActorWithEmailMethods;

    setAddingEmail(true);
    try {
      if (ext.addAuthorizedEmail) {
        await ext.addAuthorizedEmail(trimmed);
      }
      setAuthorizedEmails((prev) => [...prev, trimmed]);
      setNewEmail("");
      toast.success("E-mail autorizado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao adicionar e-mail. Tente novamente.");
    } finally {
      setAddingEmail(false);
    }
  };

  const handleRemoveEmail = async (emailToRemove: string) => {
    const ext = actor as unknown as ActorWithEmailMethods;

    setRemovingEmail(emailToRemove);
    try {
      if (ext.removeAuthorizedEmail) {
        await ext.removeAuthorizedEmail(emailToRemove);
      }
      setAuthorizedEmails((prev) => prev.filter((e) => e !== emailToRemove));
      toast.success("E-mail removido com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao remover e-mail. Tente novamente.");
    } finally {
      setRemovingEmail(null);
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

      {/* Authorized Emails — admin only */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Card className="bg-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-base flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Usuários Autorizados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Adicione os e-mails dos clientes que terão acesso à plataforma.
              </p>

              {/* Add email row */}
              <div className="flex gap-2">
                <Input
                  data-ocid="configuracoes.authorized_email_input"
                  type="email"
                  placeholder="cliente@empresa.com.br"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleAddEmail();
                    }
                  }}
                  disabled={addingEmail}
                  className="bg-muted/30 border-border h-10 flex-1"
                />
                <Button
                  data-ocid="configuracoes.add_email_btn"
                  type="button"
                  onClick={() => void handleAddEmail()}
                  disabled={addingEmail || !newEmail.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4"
                >
                  {addingEmail ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="mr-1.5 h-4 w-4" />
                      Adicionar
                    </>
                  )}
                </Button>
              </div>

              {/* Email list */}
              {emailsLoading ? (
                <div className="flex items-center gap-2 py-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando lista...
                </div>
              ) : authorizedEmails.length === 0 ? (
                <div
                  data-ocid="configuracoes.authorized_emails_empty"
                  className="py-6 text-center border border-dashed border-border/60 rounded-lg"
                >
                  <UserCheck className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum e-mail autorizado ainda.
                  </p>
                </div>
              ) : (
                <div
                  data-ocid="configuracoes.authorized_emails_list"
                  className="space-y-1.5"
                >
                  {authorizedEmails.map((authorizedEmail) => (
                    <div
                      key={authorizedEmail}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/20 border border-border/40 group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                        <span className="text-sm text-foreground truncate">
                          {authorizedEmail}
                        </span>
                      </div>
                      <Button
                        data-ocid="configuracoes.remove_email_btn"
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleRemoveEmail(authorizedEmail)}
                        disabled={removingEmail === authorizedEmail}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        aria-label={`Remover ${authorizedEmail}`}
                      >
                        {removingEmail === authorizedEmail ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

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
                      void handleAdminPasswordSubmit();
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
                    onClick={() => void handleAdminPasswordSubmit()}
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
