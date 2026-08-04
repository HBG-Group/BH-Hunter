import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/community-guidelines", label: "Community Guidelines" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/cookies#manage", label: "Privacy & cookie settings" },
  { href: "/copyright", label: "Copyright Policy" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

// Global footer with every legal/policy link the roadmap calls for. Rendered once in
// the root layout so every page gets it without each page wiring it in separately.
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 sm:gap-8">
          <div className="col-span-2 sm:col-span-1">
            <Logo />
            <p className="mt-2 max-w-xs text-xs leading-5 text-muted sm:mt-3 sm:text-sm">
              Helping VSU students find a boarding house that feels like home.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-ink sm:text-sm">Legal</p>
            <ul className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs leading-5 text-muted hover:text-ink sm:text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-ink sm:text-sm">Company</p>
            <ul className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs leading-5 text-muted hover:text-ink sm:text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 text-xs text-neutral-400 sm:mt-10">
          © {new Date().getFullYear()} Meino by HBG Production. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
