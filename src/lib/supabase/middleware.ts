import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const isAdminPath = url.pathname.startsWith("/admin");
  const isAuthPath =
    url.pathname.startsWith("/login") || url.pathname.startsWith("/register");

  if (!user && isAdminPath) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // A role (admin) ellenőrzés a szerver komponens admin/layout.tsx-ben történik,
  // nem itt – az Edge runtime RLS-en keresztül nem megbízható.

  if (user && isAuthPath) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
