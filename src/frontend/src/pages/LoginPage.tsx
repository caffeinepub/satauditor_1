import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Bitcoin,
  Check,
  Loader2,
  MessageCircle,
  Shield,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const empresaRecursos = [
  "Transações ilimitadas",
  "Endereços Bitcoin ilimitados",
  "Recursos profissionais blockchain",
  "Conformidade e compliance avançado",
  "Auditoria em tempo real",
  "Relatórios personalizados",
  "SLA garantido 99.9%",
  "Suporte dedicado 24/7",
  "Treinamento e onboarding",
];

const empresaWhatsappUrl =
  "https://wa.me/5516994410284?text=Ol%C3%A1%2C%20tenho%20interesse%20no%20plano%20Para%20Empresas%20do%20SatAuditor";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const [clicked, setClicked] = useState(false);

  const handleLogin = () => {
    setClicked(true);
    login();
  };

  const handleEmpresaWhatsapp = () => {
    localStorage.setItem(
      "satauditor_interest_requested",
      Date.now().toString(),
    );
    window.open(empresaWhatsappUrl, "_blank");
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

  const featurePills = [
    "Bitcoin Nativo",
    "Auditoria On-Chain",
    "Relatórios Automáticos",
    "100% Descentralizado",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* ── Hero Section ── */}
      <section
        data-ocid="hero.section"
        className="relative bg-sidebar border-b border-border overflow-hidden"
      >
        {/* Dot pattern background */}
        <div className="absolute inset-0 opacity-[0.05]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, oklch(0.72 0.19 55) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-primary/8 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">
          {/* Logo / Brand */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center shadow-btc">
              <span className="text-primary text-2xl font-bold">₿</span>
            </div>
            <span className="font-display text-3xl font-bold text-foreground tracking-tight">
              SatAuditor
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
          >
            Contabilidade e Auditoria{" "}
            <span className="text-primary">Descentralizada</span> para Empresas
            Brasileiras
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-10"
          >
            O primeiro sistema contábil 100% on-chain do Brasil. Transforme
            transações Bitcoin em relatórios contábeis completos, com auditoria
            em tempo real e compliance automatizado — tudo rodando no Internet
            Computer.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-14"
          >
            {featurePills.map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium"
              >
                {pill}
              </span>
            ))}
          </motion.div>

          {/* Feature cards row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="p-5 rounded-2xl bg-card/60 border border-border/60 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-3">
                  <f.icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1 leading-snug">
                  {f.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main login split layout ── */}
      <div className="flex flex-1">
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

      {/* ── Plans Portfolio Section ── */}
      <section
        data-ocid="plans.section"
        className="relative border-t border-border bg-sidebar overflow-hidden"
      >
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, oklch(0.72 0.19 55) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/5 blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
              <span className="text-primary text-base">₿</span>
              Planos SatAuditor
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              O Plano Ideal para{" "}
              <span className="text-primary">sua Empresa</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Negociado diretamente via WhatsApp. Fale comigo e encontremos a
              melhor solução para o seu negócio.
            </p>
          </motion.div>

          {/* Single "Para Empresas" plan card */}
          <motion.div
            data-ocid="plans.empresa.card"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative mx-auto"
          >
            {/* Glow ring behind card */}
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-primary/40 via-primary/20 to-primary/5 blur-sm" />

            <Card
              className="relative flex flex-col bg-card border-primary/50 shadow-btc rounded-3xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.175 0.012 255) 0%, oklch(0.155 0.008 255) 60%, oklch(0.145 0.018 55 / 0.3) 100%)",
              }}
            >
              {/* Top accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

              <CardHeader className="px-10 pt-10 pb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shadow-btc">
                    <span className="text-primary text-xl font-bold">₿</span>
                  </div>
                  <Badge className="bg-primary/20 text-primary border border-primary/40 px-3 py-1 text-xs font-semibold">
                    Plano Completo
                  </Badge>
                </div>
                <CardTitle className="font-display text-3xl font-bold text-primary mb-2">
                  Para Empresas
                </CardTitle>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Solução completa para empresas que operam com Bitcoin
                </p>
                <div className="mt-6 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              </CardHeader>

              <CardContent className="px-10 pb-10 flex flex-col gap-8">
                {/* Features list — 2 columns on wider screens */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {empresaRecursos.map((recurso) => (
                    <li key={recurso} className="flex items-start gap-3">
                      <div className="mt-0.5 h-5 w-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm text-foreground/90 leading-snug font-medium">
                        {recurso}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  data-ocid="plans.empresa.button"
                  onClick={handleEmpresaWhatsapp}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base rounded-2xl shadow-btc transition-all hover:scale-[1.01] hover:shadow-[0_0_30px_oklch(0.72_0.19_55/40%)]"
                  size="lg"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Falar no WhatsApp
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bottom note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center mt-10"
          >
            <p className="text-muted-foreground text-sm">
              Tem dúvidas?{" "}
              <a
                href="https://wa.me/5516994410284?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20o%20SatAuditor"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                data-ocid="plans.contact.link"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Fale diretamente comigo no WhatsApp
              </a>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
