import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import AppLayout from "./components/AppLayout";
import { ProfileProvider, useProfile } from "./context/ProfileContext";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { ROLE_PERMISSIONS } from "./lib/permissions";
import AccessPendingPage from "./pages/AccessPendingPage";
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
  | "ativar-servico";

// Actor extended type for email authorization methods (optional — may not be deployed yet)
type ActorWithEmailCheck = {
  isEmailAuthorized?: (email: string) => Promise<boolean>;
};

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

  // Email authorization: null = pending check, true = authorized, false = blocked
  const [emailAuthorized, setEmailAuthorized] = useState<boolean | null>(null);

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

  // Check email authorization after profile is settled
  // Admin users bypass this check entirely.
  // If the backend method doesn't exist yet, default to authorized (open access).
  useEffect(() => {
    if (!profile || !actor) return;

    // Admin always has access
    if (profile.businessRole === BusinessRole.admin) {
      setEmailAuthorized(true);
      return;
    }

    // No email set yet → user is still in onboarding flow, skip check
    if (!profile.email || profile.email.trim() === "") {
      setEmailAuthorized(true);
      return;
    }

    const ext = actor as unknown as ActorWithEmailCheck;
    if (!ext.isEmailAuthorized) {
      // Backend method not deployed yet — grant access by default
      setEmailAuthorized(true);
      return;
    }

    ext
      .isEmailAuthorized(profile.email.trim())
      .then((authorized) => setEmailAuthorized(authorized))
      .catch(() => {
        // On error, grant access to avoid blocking legitimate users
        setEmailAuthorized(true);
      });
  }, [profile, actor]);

  // Reset state when identity changes (logout / re-login)
  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null);
      setProfileSettled(false);
      setTimedOut(false);
      setRetried(false);
      setEmailAuthorized(null);
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

  // Redirect to dashboard if current page is not allowed for this role
  useEffect(() => {
    if (!profile) return;
    const role = profile?.businessRole ?? BusinessRole.client;
    const allowed =
      ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS[BusinessRole.client];
    if (!allowed.includes(currentPage)) {
      setCurrentPage("dashboard");
    }
  }, [profile, currentPage]);

  // Re-check email authorization (called from AccessPendingPage "Verificar novamente")
  const handleAccessGranted = useCallback(() => {
    setEmailAuthorized(true);
  }, []);

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

  // Access pending: profile exists but email not yet authorized
  // emailAuthorized === null means the check is still in-flight — let it through
  // so we don't flash the AccessPendingPage during the async check
  if (emailAuthorized === false) {
    return (
      <>
        <AccessPendingPage
          email={profile.email}
          onAccessGranted={handleAccessGranted}
        />
        <Toaster />
      </>
    );
  }

  // At this point profile is guaranteed non-null (guarded above)
  const safeProfile = profile!;

  function renderPage() {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage profile={safeProfile} />;
      case "clientes":
        return <ClientesPage />;
      case "transacoes":
        return <TransacoesPage profile={safeProfile} />;
      case "carteira":
        return <CarteiraPage profile={safeProfile} />;
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
      default:
        return <DashboardPage profile={safeProfile} />;
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
