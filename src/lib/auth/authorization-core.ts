export type ApplicationRole = "STUDENT" | "OWNER" | "ADMIN";

export function hasRole(role: ApplicationRole, required: ApplicationRole): boolean {
  return role === required;
}

export function ownerScope(ownerId: string, id: string) {
  return { id, ownerId };
}
