// A simple "or" separator between Google and email sign-in.
export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-neutral-200" />
      <span className="text-xs text-neutral-400">or</span>
      <span className="h-px flex-1 bg-neutral-200" />
    </div>
  );
}
