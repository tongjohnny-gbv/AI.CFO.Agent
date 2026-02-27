export type TenantScope = { userId?: string; orgId?: string; role?: "owner" | "admin" | "cpa" };

export function assertTenantAccess(scope: TenantScope, targetOrgId: string): boolean {
  return Boolean(scope.orgId && scope.orgId === targetOrgId && scope.userId);
}
