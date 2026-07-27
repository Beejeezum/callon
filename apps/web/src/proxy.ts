import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-call-on-request-id", crypto.randomUUID());
  response.headers.set(
    "Cache-Control",
    request.nextUrl.pathname.startsWith("/share/")
      ? "private, max-age=30"
      : "no-store",
  );
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/).*)"],
};
