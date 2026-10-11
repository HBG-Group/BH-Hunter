// Normalize user-authored text before length checks and persistence. React escapes
// rendered strings; this additionally removes invisible characters often used to
// bypass duplicate/moderation rules and normalizes pasted Unicode/newlines.
export function normalizeUserText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

export function normalizeTextInput(value: unknown): unknown {
  return typeof value === "string" ? normalizeUserText(value) : value;
}
