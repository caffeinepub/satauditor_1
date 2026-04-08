import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, Loader2, UserCircle2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { checkAdminPassword } from "../lib/adminPassword";
import { BusinessRole } from "../types/domain";

export default function OnboardingPage() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<BusinessRole>(BusinessRole.client);
  const [saving, setSaving] = useState(false);

  // Admin password modal state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // Se já desbloqueou admin, mantém o role como admin
  useEffect(() => {
    if (adminUnlocked) {
      setRole(BusinessRole.admin);
    }
  }, [adminUnlocked]);

  const handleAdminPasswordSubmit = () => {
    if (checkAdminPassword(adminPasswordInput)) {
      setAdminUnlocked(true);
      setShowAdminModal(false);
      setPasswordError(false);
      setAdminPasswordInput("");
      toast.success("Acesso administrativo liberado!");
    } else {
      setPasswordError(true);
      setAdminPasswordInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !name.trim() || !email.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    // Garante que somente quem desbloqueou via senha recebe o papel de admin
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
        clientId: undefined,
      });
      toast.success("Perfil criado com sucesso!");

      // Se o usuário demonstrou interesse pelo plano na landing page,
      // envia mensagem automática no WhatsApp com os dados cadastrais
      const interestFlag = localStorage.getItem(
        "satauditor_interest_requested",
      );
      if (interestFlag) {
        localStorage.removeItem("satauditor_interest_requested");
        const finalRoleName = adminUnlocked
          ? "Administrador"
          : role === BusinessRole.accountant
            ? "Contador"
            : "Cliente";
        const msg = encodeURIComponent(
          `Olá! Acabei de me cadastrar no SatAuditor.\n\nNome: ${name.trim()}\nE-mail: ${email.trim()}\nPerfil: ${finalRoleName}\n\nEstou aguardando a aprovação para acessar a plataforma.`,
        );
        window.open(`https://wa.me/5516994410284?text=${msg}`, "_blank");
      }

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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 mb-4">
            <UserCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Configure seu perfil
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo ao SatAuditor! Antes de continuar, precisamos de algumas
            informações.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="onboarding-name"
                className="text-foreground font-medium"
              >
                Nome completo *
              </Label>
              <Input
                id="onboarding-name"
                data-ocid="onboarding.input"
                placeholder="Ex: João da Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 bg-input/50 border-border focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="onboarding-email"
                className="text-foreground font-medium"
              >
                E-mail *
              </Label>
              <Input
                id="onboarding-email"
                data-ocid="onboarding.input"
                type="email"
                placeholder="Ex: joao@empresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-input/50 border-border focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground font-medium">Perfil *</Label>
              {adminUnlocked ? (
                <div className="h-11 bg-amber-500/10 border border-amber-500/40 rounded-md px-3 flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-amber-400" />
                  <span className="text-sm text-amber-300 font-medium">
                    Administrador &mdash; Gestor da plataforma
                  </span>
                </div>
              ) : (
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as BusinessRole)}
                >
                  <SelectTrigger
                    data-ocid="onboarding.select"
                    className="h-11 bg-input/50 border-border"
                  >
                    <SelectValue placeholder="Selecione seu perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BusinessRole.client}>
                      Cliente &mdash; Empresa usando o serviço
                    </SelectItem>
                    <SelectItem value={BusinessRole.accountant}>
                      Contador &mdash; Profissional contábil
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
              {/* Link discreto para acesso administrativo */}
              {!adminUnlocked && (
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
              )}
            </div>

            <Button
              data-ocid="onboarding.submit_button"
              type="submit"
              disabled={saving}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base rounded-xl shadow-btc"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Começar a usar o SatAuditor"
              )}
            </Button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground/40 mt-4">
          Seus dados são armazenados exclusivamente on-chain no Internet
          Computer.
        </p>
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
              if (e.target === e.currentTarget) setShowAdminModal(false);
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
                    if (e.key === "Enter") handleAdminPasswordSubmit();
                  }}
                  autoFocus
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
                    className="flex-1 border-border text-muted-foreground hover:text-foreground"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAdminPasswordSubmit}
                    disabled={adminPasswordInput.length !== 4}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold"
                  >
                    Confirmar
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
