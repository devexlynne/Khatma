export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getPrayerTimes } from "../../../lib/prayertimes.js";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const city = url.searchParams.get("city") || "Beirut";
    const country = url.searchParams.get("country") || "Lebanon";
    const requestedMethod = url.searchParams.get("method");
    const method = requestedMethod ? Number(requestedMethod) : undefined;
    const date = url.searchParams.get("date") || undefined;
    const latitudeParam = url.searchParams.get("latitude");
    const longitudeParam = url.searchParams.get("longitude");
    const latitude = latitudeParam === null ? undefined : Number(latitudeParam);
    const longitude = longitudeParam === null ? undefined : Number(longitudeParam);
    const data = await getPrayerTimes({ city, country, method, date, latitude, longitude });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ ok: false, reason: "fetch_error" }, { status: 500 });
  }
}
