// Senha de 4 dígitos para acesso administrativo
export const ADMIN_PASSWORD = "2891";

export function checkAdminPassword(input: string): boolean {
  return input === ADMIN_PASSWORD;
}
