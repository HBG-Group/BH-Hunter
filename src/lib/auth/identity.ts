export function isUnlinkedProviderConflict(args: {
  authenticatedUserId: string;
  profileId: string;
  provider?: string;
}): boolean {
  return args.authenticatedUserId !== args.profileId && args.provider !== "email";
}
