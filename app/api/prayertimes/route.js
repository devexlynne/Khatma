export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getPrayerTimes } from "../../../lib/prayertimes.js";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const city = url.searchParams.get("city") || "Beirut";
    const countryParam = url.searchParams.get("country");
    const country = countryParam === null ? "Lebanon" : countryParam.trim();
    const requestedMethod = url.searchParams.get("method");
    const method = requestedMethod ? Number(requestedMethod) : undefined;
    const date = url.searchParams.get("date") || undefined;
    const latitudeParam = url.searchParams.get("latitude");
    const longitudeParam = url.searchParams.get("longitude");
    const timezone = url.searchParams.get("timezone") || undefined;
    const latitude = latitudeParam === null ? undefined : Number(latitudeParam);
    const longitude = longitudeParam === null ? undefined : Number(longitudeParam);
    const data = await getPrayerTimes({ city, country, method, date, latitude, longitude, timezone });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ ok: false, reason: "fetch_error" }, { status: 500 });
  }
}
