import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    // 1. Dapatkan URL asal request
    const pathname = request.nextUrl.pathname;

    // 2. Daftar route yang memerlukan autentikasi
    const protectedRoutes = ["/my-watchlist", "/dashboard", "/preferences"];

    // Jika user mengakses route protected
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
        // Cek Sesi BetterAuth via API call ke route auth backend
        const { data: session } = await betterFetch<Session>(
            "/api/auth/get-session",
            {
                baseURL: request.nextUrl.origin,
                headers: {
                    cookie: request.headers.get("cookie") || "", // Teruskan cookie sesi
                },
            },
        );

        // Jika tidak ada sesi, redirect ke halaman login
        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    // Konfigurasi matcher untuk menghemat pemanggilan middleware di aset statis
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
