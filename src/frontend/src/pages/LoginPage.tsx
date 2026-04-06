import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Bitcoin,
  Check,
  Crown,
  Loader2,
  MessageCircle,
  Shield,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface PlanInfo {
  id: string;
  nome: string;
  descricao: string;
  destaque: boolean;
  recursos: string[];
  whatsappUrl: string;
}

const planosLanding: PlanInfo[] = [
  {
    id: "basico",
    nome: "Básico",
    descricao: "Para pequenas empresas começando com Bitcoin",
    destaque: false,
    recursos: [
      "Até 50 transações/mês",
      "1 endereço Bitcoin",
      "Relatórios Básicos (DRE, Balanço)",
      "Dashboard simples",
      "Suporte por e-mail",
      "Exportação PDF",
    ],
    whatsappUrl:
      "https://wa.me/5516994410284?text=Ol%C3%A1%2C%20tenho%20interesse%20no%20plano%20B%C3%A1sico%20do%20SatAuditor",
  },
  {
    id: "profissional",
    nome: "Profissional",
    descricao: "Para empresas em crescimento com múltiplas contas",
    destaque: true,
    recursos: [
      "Até 500 transações/mês",
      "5 endereços Bitcoin",
      "Todos os relatórios financeiros",
      "Auditoria automática",
      "Dashboard avançado com gráficos",
      "Plano de Contas personalizável",
      "API de integração",
      "Suporte prioritário",
    ],
    whatsappUrl:
      "https://wa.me/5516994410284?text=Ol%C3%A1%2C%20tenho%20interesse%20no%20plano%20Profissional%20do%20SatAuditor",
  },
  {
    id: "enterprise",
    nome: "Enterprise",
    descricao: "Para grandes empresas com volume alto de transações",
    destaque: false,
    recursos: [
      "Transações ilimitadas",
      "Endereços Bitcoin ilimitados",
      "Todos os recursos do Profissional",
      "Conformidade e compliance avançado",
      "Auditoria em tempo real",
      "Relatórios personalizados",
      "SLA garantido 99.9%",
      "Suporte dedicado 24/7",
      "Treinamento e onboarding",
    ],
    whatsappUrl:
      "https://wa.me/5516994410284?text=Ol%C3%A1%2C%20tenho%20interesse%20no%20plano%20Enterprise%20do%20SatAuditor",
  },
];

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
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
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

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
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
              Escolha o Plano Ideal{" "}
              <span className="text-primary">para sua Empresa</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Todos os planos são negociados diretamente via WhatsApp. Fale
              comigo e encontremos a melhor solução para o seu negócio.
            </p>
          </motion.div>

          {/* Plan cards */}
          <div
            data-ocid="plans.list"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
          >
            {planosLanding.map((plano, i) => (
              <motion.div
                key={plano.id}
                data-ocid={`plans.${plano.id}.card`}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative flex flex-col"
              >
                {/* Popular badge above card */}
                {plano.destaque && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1.5 text-xs font-bold shadow-btc">
                      <Crown className="h-3 w-3 mr-1.5" />
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <Card
                  className={`flex flex-col h-full transition-all duration-300 hover:-translate-y-1 ${
                    plano.destaque
                      ? "bg-card border-primary/60 shadow-btc hover:shadow-btc"
                      : "bg-card/70 border-border hover:border-primary/30"
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="mb-1">
                      <CardTitle
                        className={`font-display text-2xl font-bold ${
                          plano.destaque ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {plano.nome}
                      </CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plano.descricao}
                    </p>
                    {/* Divider */}
                    <div
                      className={`mt-4 h-px ${
                        plano.destaque ? "bg-primary/30" : "bg-border"
                      }`}
                    />
                  </CardHeader>

                  <CardContent className="flex flex-col flex-1 gap-6">
                    {/* Features list */}
                    <ul className="space-y-2.5 flex-1">
                      {plano.recursos.map((r) => (
                        <li key={r} className="flex items-start gap-2.5">
                          <div
                            className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                              plano.destaque
                                ? "bg-primary/20"
                                : "bg-emerald-500/15"
                            }`}
                          >
                            <Check
                              className={`h-2.5 w-2.5 ${
                                plano.destaque
                                  ? "text-primary"
                                  : "text-emerald-400"
                              }`}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground leading-snug">
                            {r}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <a
                      href={plano.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-ocid={`plans.${plano.id}.button`}
                    >
                      <Button
                        className={`w-full h-11 font-semibold rounded-xl transition-all ${
                          plano.destaque
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-btc"
                            : "bg-transparent border border-border hover:border-primary/50 text-foreground hover:text-primary"
                        }`}
                        variant={plano.destaque ? "default" : "outline"}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Falar no WhatsApp
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Bottom note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center mt-12"
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
