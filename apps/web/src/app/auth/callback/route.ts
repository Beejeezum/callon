import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isSupabaseConfigured } from "@/lib/public-env";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  if (!isSupabaseConfigured) {
    return NextResponse.redirect(new URL(next, request.url));
  }

  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "missing_callback_code");
    return NextResponse.redirect(url);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "expired_callback");
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
