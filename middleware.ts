import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith("/CRM/login") || 
                     request.nextUrl.pathname.startsWith("/CRM/signup");
  const isPublicPage = request.nextUrl.pathname === "/" ||
                       request.nextUrl.pathname.startsWith("/privacy") ||
                       request.nextUrl.pathname.startsWith("/terms") ||
                       request.nextUrl.pathname.startsWith("/refund-policy") ||
                       request.nextUrl.pathname.startsWith("/api/webhooks") ||
                       request.nextUrl.pathname.startsWith("/favicon.ico");

  // CRM root redirect
  if (request.nextUrl.pathname === "/CRM") {
    return NextResponse.redirect(new URL("/CRM/dashboard", request.url));
  }

  // 1. Redirect unauthenticated users from protected pages to CRM login
  if (!user && !isAuthPage && !isPublicPage) {
    return NextResponse.redirect(new URL("/CRM/login", request.url));
  }

  // 2. Redirect authenticated users from CRM login/signup to dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/CRM/dashboard", request.url));
  }

  // 3. Enforce onboarding for authenticated users
  const isOnboarding = request.nextUrl.pathname.startsWith("/CRM/onboarding");
  const isInvite = request.nextUrl.pathname.startsWith("/CRM/invite");

  if (user && !isPublicPage && !isOnboarding && !isInvite) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("current_org_id")
      .eq("id", user.id)
      .single();

    if (!profile?.current_org_id) {
      return NextResponse.redirect(new URL("/CRM/onboarding", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
