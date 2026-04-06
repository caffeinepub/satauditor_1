import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { LogOut, MessageCircle, ShieldX } from "lucide-react";
import { motion } from "motion/react";

export default function RejectedPage() {
  const { clear } = useInternetIdentity();

  const whatsappMessage = encodeURIComponent(
    "Olá! Minha solicitação de acesso ao SatAuditor foi negada. Gostaria de mais informações.",
  );
  const whatsappUrl = `https://wa.me/5516994410284?text=${whatsappMessage}`;

  return (
    <div
      data-ocid="rejected.page"
      className="min-h-screen bg-background flex items-center justify-center p-6"
    >
      {/* Subtle background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.6 0.22 25) 1px, transparent 1px), linear-gradient(90deg, oklch(0.6 0.22 25) 1px, transparent 1px)",
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
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <ShieldX className="h-9 w-9 text-red-400" />
            </div>
          </motion.div>

          {/* Texts */}
          <div className="text-center space-y-2">
            <h1 className="text-xl font-semibold text-foreground">
              Acesso não autorizado
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sua solicitação de acesso foi negada. Entre em contato com o
              administrador para mais informações.
            </p>
          </div>

          {/* Status badge */}
          <div className="flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <div className="h-2 w-2 rounded-full bg-red-400" />
            <span className="text-sm font-medium text-red-400">
              Solicitação negada
            </span>
          </div>

          {/* WhatsApp contact */}
          <div className="rounded-lg bg-muted/30 border border-border px-4 py-3 space-y-2">
            <p className="text-xs text-muted-foreground text-center">
              Entre em contato com o administrador:
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="rejected.link"
              className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              +55 16 99441-0284
            </a>
          </div>

          {/* Actions */}
          <Button
            data-ocid="rejected.button"
            variant="outline"
            className="w-full border-border hover:bg-muted/40"
            onClick={clear}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
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
