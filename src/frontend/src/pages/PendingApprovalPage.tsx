import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, LogOut, MessageCircle, RefreshCw, Send } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export default function PendingApprovalPage() {
  const { clear, identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);

  const principal = identity?.getPrincipal().toString() ?? "";

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["pendingProfile", principal],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await (actor as any).getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!principal,
    staleTime: 10000,
    refetchInterval: false,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["approvalStatus"] });
    await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  const handleRequestAccess = async () => {
    const name = profile?.name || "Não informado";
    const email = profile?.email || "Não informado";
    const shortPrincipal = principal
      ? `${principal.slice(0, 12)}...${principal.slice(-6)}`
      : "Não disponível";

    setIsRequestingAccess(true);

    // Register access request in the backend before opening WhatsApp
    try {
      if (actor) {
        await (actor as any).registerAccessRequest(
          profile?.name || "",
          profile?.email || "",
        );
        toast.success("Solicitação enviada ao administrador!");
        // Invalidate access requests cache so admin sees it immediately
        await queryClient.invalidateQueries({ queryKey: ["accessRequests"] });
        await queryClient.invalidateQueries({ queryKey: ["pendingUsers"] });
      }
    } catch {
      // Graceful degradation — still open WhatsApp even if backend call fails
      toast.error(
        "Não foi possível registrar a solicitação, mas o WhatsApp será aberto.",
      );
    } finally {
      setIsRequestingAccess(false);
    }

    // Open WhatsApp regardless of backend success/failure
    const message = encodeURIComponent(
      `Olá! Estou solicitando acesso ao SatAuditor.\n\n📋 *Dados cadastrais:*\n• Nome: ${name}\n• E-mail: ${email}\n• ID: ${shortPrincipal}\n\nPor favor, aprove meu acesso à plataforma. Obrigado!`,
    );
    window.open(`https://wa.me/5516994410284?text=${message}`, "_blank");
  };

  const whatsappContactUrl = `https://wa.me/5516994410284?text=${encodeURIComponent(
    "Olá! Realizei meu cadastro no SatAuditor e gostaria de confirmar meu acesso.",
  )}`;

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
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 w-full justify-center">
              <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-sm font-medium text-amber-400">
                Análise em andamento
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              A análise é realizada em até 24 horas úteis. Caso não receba
              retorno, utilize o botão abaixo para enviar sua solicitação.
            </p>
          </div>

          {/* Request Access CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-4 space-y-3"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground text-center">
                Envie sua solicitação de acesso
              </p>
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                Clique abaixo para enviar sua solicitação ao administrador. Ela
                será registrada no painel de aprovações e você será notificado
                quando aprovada.
              </p>
            </div>

            {profileLoading ? (
              <Skeleton className="h-12 w-full rounded-lg" />
            ) : (
              <button
                type="button"
                data-ocid="pending_approval.request_access_button"
                onClick={handleRequestAccess}
                disabled={isRequestingAccess}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-emerald-900/30"
              >
                {isRequestingAccess ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Enviando solicitação...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Solicitar Acesso pelo WhatsApp
                  </>
                )}
              </button>
            )}
          </motion.div>

          {/* Profile info (if loaded) */}
          {profile && (
            <div className="rounded-lg bg-muted/20 border border-border/50 px-4 py-3 space-y-1">
              <p className="text-xs text-muted-foreground font-medium">
                Dados da solicitação:
              </p>
              <p className="text-xs text-foreground truncate">
                <span className="text-muted-foreground">Nome: </span>
                {profile.name ?? "—"}
              </p>
              <p className="text-xs text-foreground truncate">
                <span className="text-muted-foreground">E-mail: </span>
                {profile.email ?? "—"}
              </p>
            </div>
          )}

          {/* WhatsApp contact (dúvidas) */}
          <div className="rounded-lg bg-muted/30 border border-border px-4 py-3 space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              Dúvidas? Entre em contato pelo WhatsApp:
            </p>
            <a
              href={whatsappContactUrl}
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
