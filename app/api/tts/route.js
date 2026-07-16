import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const text = new URL(request.url).searchParams.get("text")?.trim();
  if (!text || text.length > 220) {
    return NextResponse.json({ error: "invalid_text" }, { status: 400 });
  }
  try {
    const url = new URL("https://translate.google.com/translate_tts");
    url.searchParams.set("ie", "UTF-8");
    url.searchParams.set("client", "tw-ob");
    url.searchParams.set("tl", "ar");
    url.searchParams.set("q", text);
    const upstream = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NoorAlWalidayn/1.0)", Accept: "audio/mpeg,audio/*" },
      cache: "no-store",
    });
    if (!upstream.ok || !upstream.body) return NextResponse.json({ error: "tts_unavailable" }, { status: 502 });
    return new Response(upstream.body, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=604800" },
    });
  } catch {
    return NextResponse.json({ error: "tts_failed" }, { status: 502 });
  }
}
