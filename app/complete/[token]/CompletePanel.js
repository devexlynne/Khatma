"use client";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import ShareCompletionCard from "@/components/ShareCompletionCard";

export default function CompletePanel({ token, juz, khatma }) {
  const notify = useToast();
  const [status, setStatus] = useState(juz.status);
  const [busy, setBusy] = useState(false);

  async function complete() {
    setBusy(true);
    const res = await fetch(`/api/public/complete/${token}`, { method: "POST" });
    setBusy(false);
    if (res.ok) {
      setStatus("completed");
      notify("تم تأكيد الإتمام، تقبّل الله منك");
    } else {
      notify("تعذّر تأكيد الإتمام", "error");
    }
  }

  return (
    <div className="card center">
      <h1 className="section-title" style={{ fontSize: 21 }}>تأكيد إتمام الجزء {juz.number}</h1>
      {khatma.title ? <p className="muted" style={{ marginTop: 0 }}>ختمة: {khatma.title}</p> : null}
      {juz.name ? <p className="muted">باسم: {juz.name}</p> : null}

      <div className="note" style={{ textAlign: "start", margin: "14px 0" }}>
        رمز الحجز الخاص بك: <strong style={{ wordBreak: "break-all" }}>{token}</strong>
      </div>

      {status === "completed" ? (
        <>
          <div className="celebrate" style={{ marginTop: 14 }}>
            <div style={{ fontSize: 34 }}>🤲</div>
            <h2 className="section-title" style={{ fontSize: 19, color: "var(--green-dark)" }}>تم تأكيد الإتمام</h2>
            <p className="muted">جزاك الله خيرًا، وتقبّل منك.</p>
          </div>
          {khatma.publicId ? (
            <ShareCompletionCard publicId={khatma.publicId} title={khatma.title} />
          ) : null}
        </>
      ) : (
        <button className="btn btn-primary btn-block" onClick={complete} disabled={busy}>
          {busy ? "جارٍ التأكيد…" : "تأكيد إتمام الجزء"}
        </button>
      )}

      {khatma.publicId && (
        <Link href={`/k/${khatma.publicId}`} className="btn btn-ghost btn-sm" style={{ marginTop: 14 }}>
          العودة لصفحة الختمة
        </Link>
      )}
    </div>
  );
}
