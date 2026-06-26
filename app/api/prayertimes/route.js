import { NextResponse } from "next/server";
import { getPrayerTimes } from "../../../lib/prayertimes.js";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const city = url.searchParams.get("city") || "Beirut";
    const country = url.searchParams.get("country") || "Lebanon";
    const method = Number(url.searchParams.get("method") || 2);
    const data = await getPrayerTimes({ city, country, method });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ ok: false, reason: "fetch_error" }, { status: 500 });
  }
}
