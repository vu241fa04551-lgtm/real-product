import { NextResponse } from "next/server";

import { auth } from "@repo/auth";

const ROLE_PREFIXES = {
  "/student": ["STUDENT", "FACULTY", "ADMIN"],
  "/faculty": ["FACULTY", "ADMIN"],
  "/admin": ["ADMIN"],
} as const;

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const matchedPrefix = Object.keys(ROLE_PREFIXES).find((prefix) =>
    pathname.startsWith(prefix),
  ) as keyof typeof ROLE_PREFIXES | undefined;

  if (!matchedPrefix) {
    return NextResponse.next();
  }

  const role = req.auth?.user?.role;

  if (!role) {
    const signInUrl = new URL("/sign-in", req.nextUrl);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const allowedRoles: readonly string[] = ROLE_PREFIXES[matchedPrefix];
  if (!allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/student/:path*", "/faculty/:path*", "/admin/:path*"],
};
