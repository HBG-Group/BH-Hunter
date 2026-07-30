import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "@/config/env";
import { ADMIN_HOST, isAdminHost } from "@/config/admin";
import { safeRedirectPath } from "@/lib/security/redirect";
import { securityHeaders } from "@/lib/security/headers";

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const header of securityHeaders(process.env.NODE_ENV === "production")) {
    response.headers.set(header.key, header.value);
  }
  return response;
}

// Next 16's replacement for middleware. Runs before a route renders: it refreshes the
// Supabase session cookie and bounces signed-out visitors away from the owner area.
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // ── Domain separation ──────────────────────────────────────────────────────
  // When an admin domain is configured, the admin panel lives there and nowhere
  // else. This runs before anything else so /admin can't leak on the main site.
  if (ADMIN_HOST) {
    const onAdminHost = isAdminHost(request.headers.get("host"));

    // Main site: pretend /admin doesn't exist, so users can't reach it.
    if (path.startsWith("/admin") && !onAdminHost) {
      return applySecurityHeaders(new NextResponse(null, { status: 404 }));
    }

    // Admin domain: its root shows the dashboard instead of the public homepage.
    if (onAdminHost && path === "/") {
      return NextResponse.rewrite(new URL("/admin", request.url));
    }
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response = NextResponse.next({ request });
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  let user = null;
  try {
    const {
      data: { user: currentUser },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    user = currentUser;
  } catch {
    // An expired or revoked refresh token must not turn a public page into a failed
    // request. Remove only Supabase session cookies and let the visitor sign in again.
    for (const cookie of request.cookies.getAll()) {
      if (cookie.name.startsWith("sb-")) {
        response.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
      }
    }
  }

  // Owners are sent to the shared sign-in. The /admin area is intentionally NOT here:
  // it renders its own sign-in form in place of the dashboard, and its layout and every
  // page re-check the ADMIN role server-side. Redirecting it would hide that form.
  if (path.startsWith("/owner") && !user) {
    const loginUrl = new URL("/login", request.url);
    // Only ever round-trip a validated in-app path.
    loginUrl.searchParams.set("next", safeRedirectPath(path, "/"));
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return applySecurityHeaders(response);
}

export const config = {
  // Skip Next internals and static assets; run on everything else.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
