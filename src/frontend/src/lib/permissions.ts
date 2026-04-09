import type { PageName } from "../App";
import { BusinessRole } from "../types/domain";

// All pages are accessible to all roles — no restrictions
const ALL_PAGES: PageName[] = [
  "dashboard",
  "clientes",
  "transacoes",
  "carteira",
  "contabilidade",
  "relatorios",
  "auditoria",
  "assinaturas",
  "configuracoes",
  "importar-extrato",
  "ativar-servico",
  "minha-empresa",
];

export const ROLE_PERMISSIONS: Record<BusinessRole, PageName[]> = {
  [BusinessRole.admin]: ALL_PAGES,
  [BusinessRole.accountant]: ALL_PAGES,
  [BusinessRole.client]: ALL_PAGES,
};

export function canAccess(_role: BusinessRole, _page: PageName): boolean {
  return true;
}

export const ROLE_LABELS: Record<BusinessRole, string> = {
  [BusinessRole.admin]: "Usuário",
  [BusinessRole.accountant]: "Usuário",
  [BusinessRole.client]: "Usuário",
};

export const ROLE_BADGE_CLASSES: Record<BusinessRole, string> = {
  [BusinessRole.admin]: "bg-primary/20 text-primary border border-primary/30",
  [BusinessRole.accountant]:
    "bg-primary/20 text-primary border border-primary/30",
  [BusinessRole.client]: "bg-primary/20 text-primary border border-primary/30",
};
