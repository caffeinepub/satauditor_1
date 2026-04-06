import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BusinessRole } from "./backend.d";
import AppLayout from "./components/AppLayout";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { ROLE_PERMISSIONS } from "./lib/permissions";
import AssinaturasPage from "./pages/AssinaturasPage";
import AuditoriaPage from "./pages/AuditoriaPage";
import ClientesPage from "./pages/ClientesPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import ContabilidadePage from "./pages/ContabilidadePage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import TransacoesPage from "./pages/TransacoesPage";

export type PageName =
  | "dashboard"
  | "clientes"
  | "transacoes"
  | "contabilidade"
  | "relatorios"
  | "auditoria"
  | "assinaturas"
  | "configuracoes";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [currentPage, setCurrentPage] = useState<PageName>("dashboard");

  const isAuthenticated = !!identity;

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["userProfile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: isAuthenticated && !!actor && !isFetching,
  });

  // Redirect to dashboard if current page is not allowed for this role
  useEffect(() => {
    if (!profile) return;
    const role = profile.businessRole ?? BusinessRole.client;
    const allowed =
      ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS[BusinessRole.client];
    if (!allowed.includes(currentPage)) {
      setCurrentPage("dashboard");
    }
  }, [profile, currentPage]);

  if (isInitializing || (isAuthenticated && (isFetching || profileLoading))) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl font-display font-bold">
            <span className="text-primary">₿</span>
            <span className="text-foreground"> SatAuditor</span>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-2 w-2 rounded-full animate-pulse" />
            <Skeleton className="h-2 w-2 rounded-full animate-pulse [animation-delay:150ms]" />
            <Skeleton className="h-2 w-2 rounded-full animate-pulse [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <OnboardingPage />
        <Toaster />
      </>
    );
  }

  const pageComponents: Record<PageName, React.ReactNode> = {
    dashboard: <DashboardPage profile={profile} />,
    clientes: <ClientesPage />,
    transacoes: <TransacoesPage profile={profile} />,
    contabilidade: <ContabilidadePage />,
    relatorios: <RelatoriosPage />,
    auditoria: <AuditoriaPage />,
    assinaturas: <AssinaturasPage profile={profile} />,
    configuracoes: <ConfiguracoesPage />,
  };

  return (
    <>
      <AppLayout
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        profile={profile}
      >
        {pageComponents[currentPage]}
      </AppLayout>
      <Toaster />
    </>
  );
}
