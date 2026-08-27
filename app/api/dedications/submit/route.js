export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { createDedication } from "../../../../lib/dedication.js";

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let name;
    let message;
    let image_url;

    if (contentType.includes("multipart/form-data")) {
      const body = await req.formData();
      name = body.get("name");
      message = body.get("message");
      const image = body.get("image");
      if (image && typeof image !== "string" && image.size) {
        if (!image.type.startsWith("image/")) {
          return NextResponse.json({ ok: false, reason: "invalid_image_type" }, { status: 400 });
        }
        if (image.size > 3 * 1024 * 1024) {
          return NextResponse.json({ ok: false, reason: "image_too_large" }, { status: 413 });
        }
        const bytes = Buffer.from(await image.arrayBuffer());
        image_url = `data:${image.type};base64,${bytes.toString("base64")}`;
      }
    } else {
      const body = await req.json();
      ({ name, message, image_url } = body || {});
    }
    if (!message || typeof message !== "string") {
      return NextResponse.json({ ok: false, reason: "missing_message" }, { status: 400 });
    }
    const res = createDedication({
      name: typeof name === "string" ? name.trim() : null,
      message: message.trim(),
      image_url: typeof image_url === "string" ? image_url : null,
    });
    return NextResponse.json({ ok: true, id: res.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ ok: false, reason: "server_error" }, { status: 500 });
  }
}
