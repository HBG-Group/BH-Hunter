export type ApplicationRole = "STUDENT" | "OWNER" | "ADMIN";

export const ACTION_ROLE_MATRIX = {
  student: ["STUDENT"],
  owner: ["OWNER"],
  admin: ["ADMIN"],
} as const satisfies Record<string, readonly ApplicationRole[]>;

export function hasRole(role: ApplicationRole, required: ApplicationRole): boolean {
  return role === required;
}

export function canInvokeAction(
  role: ApplicationRole | null | undefined,
  action: keyof typeof ACTION_ROLE_MATRIX,
): boolean {
  const allowedRoles: readonly ApplicationRole[] = ACTION_ROLE_MATRIX[action];
  return role != null && allowedRoles.includes(role);
}

export function ownerScope(ownerId: string, id: string) {
  return { id, ownerId };
}
