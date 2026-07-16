import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TRACKS = {
  quran_completion: {
    url: "https://www.ashefaa.com/ruqia/do3aa/21.mp3",
    referer: "https://www.ashefaa.com/play-14435.html",
  },
  names_of_allah: {
    url: "https://www.sunnaonline.org/lessons/s-others/du3a2-3.mp3",
    referer: "https://www.sunnaonline.org/",
  },
};

export async function GET(request, { params }) {
  const track = TRACKS[params.track];
  if (!track) return NextResponse.json({ error: "audio_not_found" }, { status: 404 });

  try {
    const range = request.headers.get("range");
    const headers = {
      "User-Agent": "Mozilla/5.0 (compatible; NoorAlWalidayn/1.0)",
      Accept: "audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
      Referer: track.referer,
    };
    if (range) headers.Range = range;

    const upstream = await fetch(track.url, { headers, redirect: "follow", cache: "no-store" });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "audio_unavailable" }, { status: 502 });
    }

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", upstream.headers.get("content-type") || "audio/mpeg");
    responseHeaders.set("Accept-Ranges", upstream.headers.get("accept-ranges") || "bytes");
    responseHeaders.set("Cache-Control", "public, max-age=86400");
    for (const name of ["content-length", "content-range"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return NextResponse.json({ error: "audio_fetch_failed" }, { status: 502 });
  }
}
