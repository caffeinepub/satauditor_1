import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import AppLayout from "./components/AppLayout";
import { ProfileProvider, useProfile } from "./context/ProfileContext";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AssinaturasPage from "./pages/AssinaturasPage";
import AtivarServicoPage from "./pages/AtivarServicoPage";
import AuditoriaPage from "./pages/AuditoriaPage";
import CarteiraPage from "./pages/CarteiraPage";
import ClientesPage from "./pages/ClientesPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import ContabilidadePage from "./pages/ContabilidadePage";
import DashboardPage from "./pages/DashboardPage";
import ImportarExtratoPage from "./pages/ImportarExtratoPage";
import LoginPage from "./pages/LoginPage";
import MinhaEmpresaPage from "./pages/MinhaEmpresaPage";
import OnboardingPage from "./pages/OnboardingPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import TransacoesPage from "./pages/TransacoesPage";
import { BusinessRole, type UserProfile } from "./types/domain";

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
  | "importar-extrato"
  | "ativar-servico"
  | "minha-empresa";

// Inner component that has access to ProfileContext
function AppInner() {
  const { identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const { profile, setProfile } = useProfile();
  const [currentPage, setCurrentPage] = useState<PageName>("dashboard");

  // profileSettled tracks whether the profile fetch has completed at least once
  const [profileSettled, setProfileSettled] = useState(false);
  // timedOut is the hard fallback — forces exit from loading after 10 seconds
  const [timedOut, setTimedOut] = useState(false);
  // retried tracks whether we already attempted an auto-retry after timeout
  const [retried, setRetried] = useState(false);
  const hardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAuthenticated = !!identity;
  const actorReady = !!actor && !isFetching;

  // Fetch profile ONCE when actor becomes ready after auth.
  const actorRef = useRef(actor);
  actorRef.current = actor;
  const setProfileRef = useRef(setProfile);
  setProfileRef.current = setProfile;
  const queryClientRef = useRef(queryClient);
  queryClientRef.current = queryClient;
  const identityRef = useRef(identity);
  identityRef.current = identity;

  useEffect(() => {
    if (!isAuthenticated || !actorReady) return;
    if (!actorRef.current) return;

    let cancelled = false;

    actorRef.current
      .getCallerUserProfile()
      .then((result: UserProfile | null) => {
        if (cancelled) return;
        setProfileRef.current(result);
        setProfileSettled(true);
        queryClientRef.current.setQueryData(
          ["userProfile", identityRef.current?.getPrincipal().toString()],
          result,
        );
      })
      .catch(() => {
        if (cancelled) return;
        setProfileRef.current(null);
        setProfileSettled(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, actorReady]);

  // Reset state when identity changes (logout / re-login)
  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null);
      setProfileSettled(false);
      setTimedOut(false);
      setRetried(false);
    }
  }, [isAuthenticated, setProfile]);

  // Determine whether we're still in the initial loading phase
  const isLoading =
    !timedOut &&
    (isInitializing || (isAuthenticated && (!actorReady || !profileSettled)));

  // Hard timeout: force-exit loading after 10 seconds in case backend hangs.
  useEffect(() => {
    if (isLoading && !timedOut) {
      hardTimeoutRef.current = setTimeout(() => {
        if (!retried && actorRef.current) {
          setRetried(true);
          actorRef.current
            .getCallerUserProfile()
            .then((result: UserProfile | null) => {
              setProfileRef.current(result);
              setProfileSettled(true);
              queryClientRef.current.setQueryData(
                ["userProfile", identityRef.current?.getPrincipal().toString()],
                result,
              );
            })
            .catch(() => {
              setTimedOut(true);
              setProfileSettled(true);
            });
        } else {
          setTimedOut(true);
          setProfileSettled(true);
        }
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
  }, [isLoading, timedOut, retried]);

  // Suppress unused variable warning for handleAccessGranted (no longer used)
  const handleAccessGranted = useCallback(() => {}, []);
  void handleAccessGranted;

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
  if (timedOut && isAuthenticated && !profile) {
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

  // At this point profile is guaranteed non-null (guarded above)
  const safeProfile = profile!;

  function renderPage() {
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage profile={safeProfile} onNavigate={setCurrentPage} />
        );
      case "clientes":
        return <ClientesPage />;
      case "transacoes":
        return (
          <TransacoesPage profile={safeProfile} onNavigate={setCurrentPage} />
        );
      case "carteira":
        return (
          <CarteiraPage profile={safeProfile} onNavigate={setCurrentPage} />
        );
      case "contabilidade":
        return <ContabilidadePage profile={safeProfile} />;
      case "relatorios":
        return <RelatoriosPage profile={safeProfile} />;
      case "auditoria":
        return <AuditoriaPage />;
      case "assinaturas":
        return <AssinaturasPage profile={safeProfile} />;
      case "configuracoes":
        return <ConfiguracoesPage />;
      case "importar-extrato":
        return <ImportarExtratoPage />;
      case "ativar-servico":
        return <AtivarServicoPage onNavigate={setCurrentPage} />;
      case "minha-empresa":
        return <MinhaEmpresaPage onNavigate={setCurrentPage} />;
      default:
        return (
          <DashboardPage profile={safeProfile} onNavigate={setCurrentPage} />
        );
    }
  }

  return (
    <>
      <AppLayout
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        profile={safeProfile}
      >
        {renderPage()}
      </AppLayout>
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <AppInner />
    </ProfileProvider>
  );
}

// Keep BusinessRole in scope to avoid unused import warning
void BusinessRole;
