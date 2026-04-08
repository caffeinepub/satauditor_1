import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import AppLayout from "./components/AppLayout";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { ROLE_PERMISSIONS } from "./lib/permissions";
import AprovacoesPage from "./pages/AprovacoesPage";
import AssinaturasPage from "./pages/AssinaturasPage";
import AuditoriaPage from "./pages/AuditoriaPage";
import CarteiraPage from "./pages/CarteiraPage";
import ClientesPage from "./pages/ClientesPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import ContabilidadePage from "./pages/ContabilidadePage";
import DashboardPage from "./pages/DashboardPage";
import ImportarExtratoPage from "./pages/ImportarExtratoPage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import RejectedPage from "./pages/RejectedPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import TransacoesPage from "./pages/TransacoesPage";
import { BusinessRole, UserApprovalStatus } from "./types/domain";

export type PageName =
  | "dashboard"
  | "clientes"
  | "transacoes"
  | "carteira"
  | "contabilidade"
  | "relatorios"
  | "auditoria"
  | "assinaturas"
  | "configuracoes"
  | "aprovacoes"
  | "importar-extrato";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [currentPage, setCurrentPage] = useState<PageName>("dashboard");

  // profileSettled tracks whether the profile query has completed at least once
  const [profileSettled, setProfileSettled] = useState(false);
  // timedOut is the hard fallback — forces exit from loading after 10 seconds
  const [timedOut, setTimedOut] = useState(false);
  const hardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAuthenticated = !!identity;

  const {
    data: profile,
    isLoading: profileLoading,
    isSuccess: profileSuccess,
    isError: profileError,
  } = useQuery({
    queryKey: ["userProfile", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: isAuthenticated && !!actor && !isFetching,
    staleTime: 30000,
    refetchInterval: 30000,
  });

  // Mark profile as settled once the query completes (success or error)
  useEffect(() => {
    if (profileSuccess || profileError) {
      setProfileSettled(true);
    }
  }, [profileSuccess, profileError]);

  // Also settle when profileLoading transitions false while query was enabled
  useEffect(() => {
    if (!profileLoading && isAuthenticated && !!actor && !isFetching) {
      setProfileSettled(true);
    }
  }, [profileLoading, isAuthenticated, actor, isFetching]);

  // Derive isAdmin ONLY after profile has settled — prevents premature evaluation
  const isAdmin = profileSettled
    ? profile?.businessRole === BusinessRole.admin
    : false;

  // Approval query: only after profile settled, profile exists, and user is NOT admin
  const { data: approvalStatus, isLoading: approvalLoading } = useQuery({
    queryKey: ["approvalStatus", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const result = await (
          actor as {
            getUserApprovalStatus: () => Promise<unknown>;
          }
        ).getUserApprovalStatus();
        if (result === null || result === undefined)
          return UserApprovalStatus.approved;
        if (typeof result === "object") {
          if ("approved" in (result as object))
            return UserApprovalStatus.approved;
          if ("pending" in (result as object))
            return UserApprovalStatus.pending;
          if ("rejected" in (result as object))
            return UserApprovalStatus.rejected;
        }
        if (typeof result === "string") return result as UserApprovalStatus;
        return UserApprovalStatus.approved;
      } catch {
        return UserApprovalStatus.approved;
      }
    },
    enabled:
      isAuthenticated &&
      !!actor &&
      !isFetching &&
      profileSettled &&
      !!profile &&
      !isAdmin,
    staleTime: 30000,
    refetchInterval: 30000,
  });

  // Determine whether we're still in the initial loading phase
  // isFetching from useActor is a background refresh indicator — does NOT block loading
  const needsApprovalCheck = profileSettled && !!profile && !isAdmin;
  const isLoading =
    !timedOut &&
    (isInitializing ||
      (isAuthenticated &&
        (profileLoading ||
          !profileSettled ||
          (needsApprovalCheck && approvalLoading))));

  // Hard timeout: force-exit loading after 10 seconds in case backend hangs
  useEffect(() => {
    if (isLoading && !timedOut) {
      hardTimeoutRef.current = setTimeout(() => {
        setTimedOut(true);
      }, 10000);
    } else if (!isLoading && hardTimeoutRef.current) {
      clearTimeout(hardTimeoutRef.current);
      hardTimeoutRef.current = null;
    }
    return () => {
      if (hardTimeoutRef.current) {
        clearTimeout(hardTimeoutRef.current);
        hardTimeoutRef.current = null;
      }
    };
  }, [isLoading, timedOut]);

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

  // Loading screen
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

  // Timeout fallback — backend did not respond in time, show reload option
  if (timedOut && isAuthenticated && !profileSettled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center px-4">
          <div className="text-4xl font-display font-bold">
            <span className="text-primary">₿</span>
            <span className="text-foreground"> SatAuditor</span>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs">
            O servidor está demorando mais do que o esperado.
          </p>
          <Button
            variant="default"
            onClick={() => window.location.reload()}
            data-ocid="timeout-reload-btn"
          >
            Recarregar
          </Button>
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

  function renderPage() {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage profile={profile} />;
      case "clientes":
        return <ClientesPage />;
      case "transacoes":
        return <TransacoesPage profile={profile} />;
      case "carteira":
        return <CarteiraPage profile={profile} />;
      case "contabilidade":
        return <ContabilidadePage profile={profile} />;
      case "relatorios":
        return <RelatoriosPage profile={profile} />;
      case "auditoria":
        return <AuditoriaPage />;
      case "assinaturas":
        return <AssinaturasPage profile={profile} />;
      case "configuracoes":
        return <ConfiguracoesPage />;
      case "aprovacoes":
        return <AprovacoesPage actor={actor} />;
      case "importar-extrato":
        return <ImportarExtratoPage />;
      default:
        return <DashboardPage profile={profile} />;
    }
  }

  return (
    <>
      <AppLayout
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        profile={profile}
      >
        {renderPage()}
      </AppLayout>
      <Toaster />
    </>
  );
}
