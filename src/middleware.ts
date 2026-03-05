import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const GEO_COOKIE = "lb_geo_country";

export function middleware(request: NextRequest) {
  const res = NextResponse.next();

  // Vercel injects this header; other hosts may use CF-IPCountry (Cloudflare) or similar
  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    null;

  if (country) {
    res.cookies.set(GEO_COOKIE, country.toUpperCase(), {
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: "lax",
    });
  }

  return res;
}
