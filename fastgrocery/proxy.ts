import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Public routes bypass
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/check-for-admin") ||
    pathname === "/api/chat/save" ||
    pathname === "/api/socket/connect" ||
    pathname === "/api/socket/update-location" ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  // 2. Fetch session using NextAuth auth helper
  const session = await auth();

  // 3. No session -> redirect to /login
  if (!session || !session.user) {
    // If it's an API request, return a 401 Unauthorized JSON
    if (pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    const callbackUrl = encodeURIComponent(req.nextUrl.href);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, req.nextUrl)
    );
  }

  const role = session.user.role;

  // 4. Role-based protection (Web page views)
  if (pathname.startsWith("/user") && role !== "user") {
    return NextResponse.redirect(new URL("/unauthorized", req.nextUrl));
  }

  if (pathname.startsWith("/delivery") && role !== "deliveryBoy") {
    return NextResponse.redirect(new URL("/unauthorized", req.nextUrl));
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.nextUrl));
  }

  // 5. Role-based protection (API routes)
  if (pathname.startsWith("/api/user") && role !== "user") {
    // Exception: Stripe Webhook doesn't require session auth in standard way,
    // but the route is /api/user/stripe/webhook, let's bypass it in middleware if signature verification is used.
    if (pathname === "/api/user/stripe/webhook") {
      return NextResponse.next();
    }
    return new NextResponse(
      JSON.stringify({ error: "Access Denied: Customer role required" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  if (pathname.startsWith("/api/delivery") && role !== "deliveryBoy") {
    return new NextResponse(
      JSON.stringify({ error: "Access Denied: Delivery role required" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  if (pathname.startsWith("/api/admin") && role !== "admin") {
    // Exception: Allow any authenticated user to view the grocery catalog
    if (pathname === "/api/admin/get-groceries") {
      return NextResponse.next();
    }
    return new NextResponse(
      JSON.stringify({ error: "Access Denied: Admin role required" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
