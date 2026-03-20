import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ─── Backward-compat: redirect all old /CRM/ links to /ERP/ ───────────────
  if (pathname.startsWith("/CRM")) {
    const newPath = pathname.replace(/^\/CRM/, "/ERP");
    return NextResponse.redirect(new URL(newPath + request.nextUrl.search, request.url));
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAuthPage = pathname.startsWith("/ERP/login") ||
                     pathname.startsWith("/ERP/signup");
  const isPublicPage = pathname === "/" ||
                       pathname.startsWith("/privacy") ||
                       pathname.startsWith("/terms") ||
                       pathname.startsWith("/refund-policy") ||
                       pathname.startsWith("/api/webhooks") ||
                       pathname.startsWith("/favicon.ico");

  // ERP root redirect
  if (pathname === "/ERP") {
    return NextResponse.redirect(new URL("/ERP/dashboard", request.url));
  }

  // 1. Redirect unauthenticated users from protected pages to login
  if (!user && !isAuthPage && !isPublicPage) {
    return NextResponse.redirect(new URL("/ERP/login", request.url));
  }

  // 2. Redirect authenticated users from login/signup to dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/ERP/dashboard", request.url));
  }

  // 3. Enforce onboarding for authenticated users
  const isOnboarding = pathname.startsWith("/ERP/onboarding");
  const isInvite = pathname.startsWith("/ERP/invite");

  if (user && !isPublicPage && !isOnboarding && !isInvite) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("current_org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.current_org_id) {
      return NextResponse.redirect(new URL("/ERP/onboarding", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
