import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeftRight,
  Bitcoin,
  BookOpen,
  ChevronRight,
  CreditCard,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { PageName } from "../App";
import { BusinessRole } from "../backend.d";
import type { UserProfile } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  ROLE_BADGE_CLASSES,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
} from "../lib/permissions";

interface NavItem {
  id: PageName;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "transacoes", label: "Transações", icon: ArrowLeftRight },
  { id: "contabilidade", label: "Contabilidade", icon: BookOpen },
  { id: "relatorios", label: "Relatórios", icon: FileBarChart },
  { id: "auditoria", label: "Auditoria", icon: Shield },
  { id: "assinaturas", label: "Assinaturas", icon: CreditCard },
  { id: "configuracoes", label: "Configurações", icon: Settings },
];

const PAGE_TITLES: Record<PageName, string> = {
  dashboard: "Dashboard",
  clientes: "Clientes",
  transacoes: "Transações Bitcoin",
  contabilidade: "Contabilidade",
  relatorios: "Relatórios Financeiros",
  auditoria: "Auditoria",
  assinaturas: "Assinaturas",
  configuracoes: "Configurações",
};

interface AppLayoutProps {
  children: ReactNode;
  currentPage: PageName;
  onNavigate: (page: PageName) => void;
  profile: UserProfile;
}

export default function AppLayout({
  children,
  currentPage,
  onNavigate,
  profile,
}: AppLayoutProps) {
  const { clear } = useInternetIdentity();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = profile.businessRole ?? BusinessRole.client;
  const allowedPages =
    ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS[BusinessRole.client];
  const visibleNavItems = NAV_ITEMS.filter((item) =>
    allowedPages.includes(item.id),
  );

  const initials = profile.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
            <Bitcoin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-display text-lg font-bold text-sidebar-foreground leading-none">
              <span className="text-primary">₿</span> SatAuditor
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              v1.0 • Beta
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {visibleNavItems.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={`nav.${item.id}.link`}
                onClick={() => {
                  onNavigate(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  active
                    ? "bg-primary/15 text-primary border border-primary/25"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon
                  className={`h-4 w-4 flex-shrink-0 transition-colors ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-sidebar-foreground"
                  }`}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {active && (
                  <ChevronRight className="h-3.5 w-3.5 text-primary" />
                )}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User profile at bottom */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-ocid="nav.user.dropdown_menu"
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile.email}
                </p>
                {/* Role badge */}
                <span
                  data-ocid="nav.user.role_badge"
                  className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${
                    ROLE_BADGE_CLASSES[role]
                  }`}
                >
                  {ROLE_LABELS[role]}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem
              data-ocid="nav.configuracoes.link"
              onClick={() => onNavigate("configuracoes")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem
              data-ocid="nav.logout.button"
              className="text-destructive focus:text-destructive"
              onClick={clear}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar border-r border-sidebar-border flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-sidebar border-r border-sidebar-border lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              data-ocid="nav.menu.button"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <h1 className="font-display text-xl font-bold text-foreground">
              {PAGE_TITLES[currentPage]}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-muted-foreground">
              Olá, {profile.name.split(" ")[0]}
            </span>
            <Button
              data-ocid="nav.logout.button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={clear}
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-border/50 flex-shrink-0">
          <p className="text-xs text-muted-foreground text-center">
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
        </footer>
      </div>
    </div>
  );
}
