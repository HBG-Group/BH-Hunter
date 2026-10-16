// Canonicalize persisted storage URLs before they reach image optimizers.
export function normalizeStorageUrl(value: string): string {
  return value.replace(/(?:%5C|\\)+(?=([?#]|$))/gi, "");
}
