import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const GEO_COOKIE = "lb_geo_country";

export async function GET() {
  const cookieStore = await cookies();
  const country = cookieStore.get(GEO_COOKIE)?.value ?? null;
  return NextResponse.json({ country });
}
