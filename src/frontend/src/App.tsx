import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BusinessRole, UserApprovalStatus } from "./backend.d";
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
import PendingApprovalPage from "./pages/PendingApprovalPage";
import RejectedPage from "./pages/RejectedPage";
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

  const isAdmin = profile?.businessRole === BusinessRole.admin;

  const { data: approvalStatus, isLoading: approvalLoading } = useQuery({
    queryKey: ["approvalStatus", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return null;
      try {
        // The actor type may not yet include this method — use any cast
        const result = await (actor as any).getUserApprovalStatus();
        if (result === null || result === undefined)
          return UserApprovalStatus.approved;
        // Map Motoko variant to enum
        if (typeof result === "object") {
          if ("approved" in result) return UserApprovalStatus.approved;
          if ("pending" in result) return UserApprovalStatus.pending;
          if ("rejected" in result) return UserApprovalStatus.rejected;
        }
        if (typeof result === "string") return result as UserApprovalStatus;
        return UserApprovalStatus.approved;
      } catch {
        // If method doesn't exist yet, default to approved (backward compat)
        return UserApprovalStatus.approved;
      }
    },
    enabled: isAuthenticated && !!actor && !isFetching && !!profile && !isAdmin,
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

  const isLoading =
    isInitializing ||
    (isAuthenticated &&
      (isFetching ||
        profileLoading ||
        (!isAdmin && !!profile && approvalLoading)));

  if (isLoading) {
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

  // Skip approval check for admin — always has access
  if (!isAdmin) {
    if (approvalStatus === UserApprovalStatus.pending) {
      return (
        <>
          <PendingApprovalPage />
          <Toaster />
        </>
      );
    }

    if (approvalStatus === UserApprovalStatus.rejected) {
      return (
        <>
          <RejectedPage />
          <Toaster />
        </>
      );
    }
  }

  const pageComponents: Record<PageName, React.ReactNode> = {
    dashboard: <DashboardPage profile={profile} />,
    clientes: <ClientesPage />,
    transacoes: <TransacoesPage profile={profile} />,
    contabilidade: <ContabilidadePage profile={profile} />,
    relatorios: <RelatoriosPage profile={profile} />,
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
