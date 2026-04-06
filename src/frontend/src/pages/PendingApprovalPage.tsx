import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, LogOut, MessageCircle, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export default function PendingApprovalPage() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["approvalStatus"] });
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  const whatsappMessage = encodeURIComponent(
    "Olá! Realizei meu cadastro no SatAuditor e gostaria de confirmar meu acesso.",
  );
  const whatsappUrl = `https://wa.me/5516994410284?text=${whatsappMessage}`;

  return (
    <div
      data-ocid="pending_approval.page"
      className="min-h-screen bg-background flex items-center justify-center p-6"
    >
      {/* Subtle background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.72 0.19 55) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.19 55) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-4xl font-bold">
            <span className="text-primary">₿</span>
            <span className="text-foreground"> SatAuditor</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-xl space-y-6">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Clock className="h-9 w-9 text-amber-400" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 2.5,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full border border-amber-500/20"
              />
            </div>
          </motion.div>

          {/* Texts */}
          <div className="text-center space-y-2">
            <h1 className="text-xl font-semibold text-foreground">
              Aguardando aprovação
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Seu cadastro foi recebido e está sendo analisado pelo
              administrador. Você receberá acesso assim que sua conta for
              aprovada.
            </p>
          </div>

          {/* Status badge */}
          <div className="flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-medium text-amber-400">
              Análise em andamento
            </span>
          </div>

          {/* WhatsApp contact */}
          <div className="rounded-lg bg-muted/30 border border-border px-4 py-3 space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              Dúvidas? Entre em contato pelo WhatsApp:
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="pending_approval.link"
              className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              +55 16 99441-0284
            </a>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              data-ocid="pending_approval.secondary_button"
              variant="outline"
              className="w-full border-border hover:bg-muted/40"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Verificando..." : "Atualizar status"}
            </Button>
            <Button
              data-ocid="pending_approval.button"
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={clear}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()}. Construído com ❤ usando{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
