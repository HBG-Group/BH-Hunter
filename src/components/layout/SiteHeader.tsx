import Link from "next/link";
import { navLinksFor } from "@/components/layout/navLinks";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SignInButton } from "@/components/layout/SignInButton";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { getCurrentProfile } from "@/lib/auth/profile";
import { adminHref } from "@/config/admin";
import { Logo } from "@/components/brand/Logo";

// Public header. Shows a Sign in button for guests and a profile menu once signed in.
export async function SiteHeader() {
  const profile = await getCurrentProfile();
  const navLinks = navLinksFor(profile?.role);

  return (
    <header className="sticky top-0 z-[1100] border-b border-neutral-200/70 bg-white/80 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <MobileMenu links={navLinks} />
          <Logo />
          <nav className="hidden items-center gap-5 text-sm text-neutral-600 sm:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-neutral-900">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {profile ? (
            <ProfileMenu
              name={profile.fullName}
              avatarUrl={profile.avatarUrl}
              isAdmin={profile.role === "ADMIN"}
              adminHref={adminHref()}
            />
          ) : (
            <>
              <Link
                href="/list-your-property"
                className="hidden text-sm text-neutral-600 hover:text-neutral-900 sm:inline"
              >
                List your property
              </Link>
              <SignInButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
