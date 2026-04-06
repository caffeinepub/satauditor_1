// O único Principal ICP com acesso de Administrador
export const ADMIN_PRINCIPAL =
  "ltcnc-xbaww-jullu-ivf52-3kkoy-tdmlp-ifofh-u5nag-pz4pn-yyxkx-tqe";

export function isAdminPrincipal(principal: string | undefined): boolean {
  return principal === ADMIN_PRINCIPAL;
}
