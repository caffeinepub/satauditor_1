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
import { Loader2, UserCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BusinessRole } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { isAdminPrincipal } from "../lib/admin";

export default function OnboardingPage() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const principal = identity?.getPrincipal().toString();
  const isAdmin = isAdminPrincipal(principal);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // Se for o principal admin, já inicia com role admin
  const [role, setRole] = useState<BusinessRole>(
    isAdmin ? BusinessRole.admin : BusinessRole.client,
  );
  const [saving, setSaving] = useState(false);

  // Garante que o admin sempre tenha o papel correto mesmo se o estado mudar
  useEffect(() => {
    if (isAdmin) {
      setRole(BusinessRole.admin);
    }
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !name.trim() || !email.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    // Segurança: garante que o papel salvo seja admin só para o principal correto
    const finalRole = isAdmin
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
      toast.success("Perfil criado com sucesso!");
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
              {isAdmin ? (
                // Para o admin, exibe campo somente leitura
                <div className="h-11 bg-input/50 border border-border rounded-md px-3 flex items-center">
                  <span className="text-sm text-foreground">
                    Administrador — Gestor da plataforma
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
                      Cliente — Empresa usando o serviço
                    </SelectItem>
                    <SelectItem value={BusinessRole.accountant}>
                      Contador — Profissional contábil
                    </SelectItem>
                    {/* Opção Admin removida para usuários não-administradores */}
                  </SelectContent>
                </Select>
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
      </motion.div>
    </div>
  );
}
