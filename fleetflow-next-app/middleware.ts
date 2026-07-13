import { auth, canAccessPath, roleHome } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;

  // Public paths that never require auth.
  const publicPaths = ["/", "/vehicles", "/login", "/register"];
  const isPublic =
    publicPaths.some((p) => path === p || path.startsWith(`${p}/`)) ||
    path.startsWith("/api/auth") ||
    path.startsWith("/_next") ||
    path.includes(".");

  const protectedPrefixes = ["/dashboard", "/staff", "/admin"];
  const isProtected = protectedPrefixes.some(
    (p) => path === p || path.startsWith(`${p}/`)
  );

  // 1. Protected route + not logged in -> /login (PRD 15).
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", path);
    return Response.redirect(loginUrl);
  }

  // 2. Logged in but lacks role for this path -> 403 (PRD 15).
  if (isProtected && isLoggedIn) {
    const role = (req.auth?.user?.role as string) ?? "CUSTOMER";
    if (!canAccessPath(role, path)) {
      const forbidden = new URL("/forbidden", req.nextUrl.origin);
      forbidden.searchParams.set("from", path);
      return Response.redirect(forbidden);
    }
  }

  // 3. Logged in users on auth pages -> their home.
  if (isLoggedIn && (path === "/login" || path === "/register")) {
    const role = (req.auth?.user?.role as string) ?? "CUSTOMER";
    return Response.redirect(new URL(roleHome(role), req.nextUrl.origin));
  }

  // 4. Public route, allow.
  if (isPublic) {
    return;
  }

  // 5. Unknown route that isn't public and isn't protected — let Next handle it.
  return;
});

export const config = {
  // Run middleware on everything except static assets and Next internals.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
