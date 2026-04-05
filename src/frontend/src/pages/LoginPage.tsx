import { Button } from "@/components/ui/button";
import { BarChart3, Bitcoin, Loader2, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const [clicked, setClicked] = useState(false);

  const handleLogin = () => {
    setClicked(true);
    login();
  };

  const features = [
    {
      icon: Bitcoin,
      title: "Integração Bitcoin Nativa",
      desc: "Leitura direta de transações Bitcoin via ICP, sem intermediários.",
    },
    {
      icon: BarChart3,
      title: "Contabilidade Automatizada",
      desc: "Balanço, DRE e Fluxo de Caixa gerados automaticamente.",
    },
    {
      icon: Shield,
      title: "Auditoria On-Chain",
      desc: "Rastreabilidade total com dados imutáveis registrados no ICP.",
    },
    {
      icon: Zap,
      title: "Tempo Real",
      desc: "Relatórios financeiros instantâneos e compliance automatizado.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Left panel - Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-sidebar border-r border-border">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, oklch(0.72 0.19 55) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Glow effect */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
              <span className="text-primary text-xl font-bold">₿</span>
            </div>
            <span className="font-display text-2xl font-bold text-foreground">
              SatAuditor
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Contabilidade e Auditoria Descentralizada
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 space-y-8"
        >
          <div>
            <h1 className="font-display text-4xl font-bold text-foreground leading-tight mb-4">
              O primeiro sistema contábil{" "}
              <span className="text-primary">descentralizado</span> do Brasil
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Transforme transações Bitcoin em relatórios contábeis completos,
              automaticamente, em segundos.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="p-4 rounded-xl bg-card/50 border border-border/60 hover:border-primary/40 transition-colors"
              >
                <f.icon className="h-5 w-5 text-primary mb-2" />
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  {f.title}
                </h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 flex items-center gap-4"
        >
          <div className="flex -space-x-2">
            {["M", "A", "R", "C"].map((l) => (
              <div
                key={l}
                className="w-8 h-8 rounded-full bg-card border-2 border-sidebar flex items-center justify-center text-xs font-bold text-primary"
              >
                {l}
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm text-foreground font-medium">
              +200 empresas já utilizam
            </p>
            <p className="text-xs text-muted-foreground">
              Em fase beta fechada
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right panel - Login */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
              <span className="text-primary text-xl font-bold">₿</span>
            </div>
            <span className="font-display text-2xl font-bold text-foreground">
              SatAuditor
            </span>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-muted-foreground mb-8">
              Acesse sua conta com Internet Identity para continuar.
            </p>

            <Button
              data-ocid="login.primary_button"
              onClick={handleLogin}
              disabled={isLoggingIn || clicked}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base rounded-xl shadow-btc transition-all"
              size="lg"
            >
              {isLoggingIn || clicked ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Autenticando...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Entrar com Internet Identity
                </>
              )}
            </Button>

            <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/60">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                A Internet Identity garante autenticação segura e
                descentralizada, sem senhas. Seus dados financeiros são
                protegidos pela arquitetura do Internet Computer.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} SatAuditor. Construído com{" "}
            <span className="text-primary">♥</span> usando{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
