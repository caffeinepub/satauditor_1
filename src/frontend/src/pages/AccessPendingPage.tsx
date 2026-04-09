import { Button } from "@/components/ui/button";
import { LogOut, MessageCircle, RefreshCw, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const WA_LINK = "https://wa.me/5516994410284";

interface AccessPendingPageProps {
  email: string;
  onAccessGranted: () => void;
}

export default function AccessPendingPage({
  email,
  onAccessGranted,
}: AccessPendingPageProps) {
  const { actor } = useActor();
  const { clear } = useInternetIdentity();
  const [checking, setChecking] = useState(false);

  const handleRecheck = async () => {
    if (!actor || !email) return;
    setChecking(true);
    try {
      // isEmailAuthorized may not exist yet — default to false if unavailable
      const authorized =
        (await (
          actor as unknown as Record<string, (e: string) => Promise<boolean>>
        ).isEmailAuthorized?.(email)) ?? false;
      if (authorized) {
        onAccessGranted();
      }
    } catch {
      // Backend method not yet deployed — silently ignore
    } finally {
      setChecking(false);
    }
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Olá! Gostaria de solicitar acesso ao SatAuditor. Meu e-mail cadastrado é: ${email}`,
    );
    window.open(`${WA_LINK}?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        {/* Branding */}
        <div className="mb-8">
          <div className="text-4xl font-display font-bold mb-6">
            <span className="text-primary">₿</span>
            <span className="text-foreground"> SatAuditor</span>
          </div>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-4">
            <ShieldAlert className="h-8 w-8 text-amber-400" />
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Acesso Pendente
          </h1>
          <p className="text-xs text-muted-foreground/60 mb-1">
            E-mail cadastrado:
          </p>
          <p className="text-sm font-medium text-primary mb-6 break-all">
            {email}
          </p>
        </div>

        {/* Message card */}
        <div
          className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4 text-left mb-6"
          data-ocid="access-pending.card"
        >
          <div className="flex gap-3">
            <div className="w-1.5 rounded-full bg-amber-400/60 flex-shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">
              Se você já entrou em contato, aguarde a liberação de seu acesso em
              até <span className="font-semibold text-amber-400">2 horas</span>.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="w-1.5 rounded-full bg-primary/60 flex-shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">
              Se você ainda não é cliente, entre em contato usando o link do
              WhatsApp.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            data-ocid="access-pending.whatsapp_btn"
            onClick={handleWhatsApp}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base rounded-xl shadow-md"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Falar no WhatsApp
          </Button>

          <Button
            data-ocid="access-pending.recheck_btn"
            variant="outline"
            onClick={handleRecheck}
            disabled={checking}
            className="w-full h-11 border-border text-foreground hover:bg-muted/30"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${checking ? "animate-spin" : ""}`}
            />
            {checking ? "Verificando..." : "Verificar novamente"}
          </Button>

          <Button
            data-ocid="access-pending.logout_btn"
            variant="ghost"
            onClick={() => clear()}
            className="w-full h-10 text-muted-foreground hover:text-foreground text-sm"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground/40 mt-6">
          Seus dados são armazenados exclusivamente on-chain no Internet
          Computer.
        </p>
      </motion.div>
    </div>
  );
}
