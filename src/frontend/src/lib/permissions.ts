import type { PageName } from "../App";
import { BusinessRole } from "../backend.d";

export const ROLE_PERMISSIONS: Record<BusinessRole, PageName[]> = {
  [BusinessRole.admin]: [
    "dashboard",
    "clientes",
    "transacoes",
    "contabilidade",
    "relatorios",
    "auditoria",
    "assinaturas",
    "configuracoes",
  ],
  [BusinessRole.accountant]: [
    "dashboard",
    "transacoes",
    "contabilidade",
    "relatorios",
    "auditoria",
    "configuracoes",
  ],
  [BusinessRole.client]: [
    "dashboard",
    "transacoes",
    "relatorios",
    "assinaturas",
    "configuracoes",
  ],
};

export function canAccess(role: BusinessRole, page: PageName): boolean {
  return ROLE_PERMISSIONS[role]?.includes(page) ?? false;
}

export const ROLE_LABELS: Record<BusinessRole, string> = {
  [BusinessRole.admin]: "Administrador",
  [BusinessRole.accountant]: "Contador",
  [BusinessRole.client]: "Cliente",
};

export const ROLE_BADGE_CLASSES: Record<BusinessRole, string> = {
  [BusinessRole.admin]: "bg-primary/20 text-primary border border-primary/30",
  [BusinessRole.accountant]:
    "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  [BusinessRole.client]:
    "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
};
