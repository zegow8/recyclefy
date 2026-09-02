import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirect ke login kalo ga ada token
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Role-based routing
    const role = token.role;

    // Kalo user coba akses admin/superadmin pake role USER
    if (path.startsWith("/admin") && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/user/home", req.url));
    }

    if (path.startsWith("/superadmin") && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/user/home", req.url));
    }

    // Kalo admin coba akses superadmin
    if (path.startsWith("/superadmin") && role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // Kalo superadmin coba akses admin
    if (path.startsWith("/admin") && role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/superadmin/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Matcher: halaman yang perlu proteksi
export const config = {
  matcher: [
    "/user/:path*",
    "/admin/:path*",
    "/superadmin/:path*",
  ],
};