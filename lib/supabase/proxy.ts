import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // เช็คว่า User กำลังจะเข้าหน้าเมนูของลูกค้าหรือไม่?
  const isCustomerPage = request.nextUrl.pathname.startsWith("/menu");

  // ดึง Cookie ของ Session โต๊ะออกมา
  const tableSession = request.cookies.get("table_session_id");

  // Check if staying at Landing page but already has a session
  if (request.nextUrl.pathname === "/" && tableSession) {
    const { data: sessionData, error } = await supabase
      .from("table_sessions")
      .select("status")
      .eq("id", tableSession.value)
      .single();

    if (!error && sessionData?.status === "active") {
      const url = request.nextUrl.clone();
      url.pathname = "/main";
      return NextResponse.redirect(url);
    }
  }

  if (isCustomerPage) {
    if (!tableSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/"; // หรือหน้า Landing ที่บอกให้สแกน QR
      return NextResponse.redirect(url);
    }

    // Validate session existence and status
    const { data: sessionData, error } = await supabase
      .from("table_sessions")
      .select("status")
      .eq("id", tableSession.value)
      .single();

    if (error || sessionData?.status !== "active") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      // Optional: Clear invalid cookie
      const response = NextResponse.redirect(url);
      response.cookies.delete("table_session_id");
      return response;
    }
  }

  if (
    request.nextUrl.pathname !== "/" &&
    !user &&
    !isCustomerPage &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/contact") &&
    !request.nextUrl.pathname.startsWith("/orders_tracking") &&
    !request.nextUrl.pathname.startsWith("/main") &&
    !request.nextUrl.pathname.startsWith("/scan_qrcode")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
