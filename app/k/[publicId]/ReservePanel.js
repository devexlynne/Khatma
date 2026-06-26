"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

const JUZ_LABEL = { available: "متاح", reserved: "محجوز", completed: "تم" };

export default function ReservePanel({ publicId, juz, progress }) {
  const router = useRouter();
  const notify = useToast();
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null); // { number, token }
  const [savedReservations, setSavedReservations] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const key = `khatma_${publicId}_reservations`;
      const prev = JSON.parse(localStorage.getItem(key) || "[]");
      setSavedReservations(Array.isArray(prev) ? prev : []);
    } catch {
      setSavedReservations([]);
    }
  }, [publicId]);

  const milestoneLabel =
    progress.completed === 30
      ? "الحمد لله، ختمة مكتملة"
      : progress.completed >= 20
      ? "نصف الطريق بخير — شارك التذكير"
      : progress.completed >= 10
      ? "تقدّم ممتاز — الأجزاء الأخيرة أقرب"
      : "ابدأ اليوم بحجز أول جزء";

  async function reserve() {
    if (!selected) return notify("اختر جزءًا متاحًا أولًا", "error");
    if (!name.trim()) return notify("أدخل اسمك", "error");
    setBusy(true);
    const res = await fetch(`/api/public/${publicId}/reserve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: selected, name }),
    });
    setBusy(false);
    const d = await res.json();
    if (res.ok) {
      try {
        const key = `khatma_${publicId}_reservations`;
        const prev = JSON.parse(localStorage.getItem(key) || "[]");
        prev.push({ number: selected, name: name.trim(), token: d.token });
        localStorage.setItem(key, JSON.stringify(prev));
        setSavedReservations(prev);
      } catch {}
      notify("تم حجز الجزء بنجاح");
      setDone({ number: selected, token: d.token });
    } else {
      notify(d.error || "تعذّر الحجز", "error");
      router.refresh();
    }
  }

  if (done) {
    const completeUrl =
      typeof window !== "undefined" ? `${window.location.origin}/complete/${done.token}` : "";
    return (
      <div className="card">
        <div className="center">
          <div style={{ fontSize: 30 }}>✅</div>
          <h2 className="section-title" style={{ fontSize: 20 }}>تم حجز الجزء {done.number}</h2>
          <p className="muted">احفظ رابط الإتمام لاستكمال حصتك لاحقًا.</p>
        </div>
        <div className="note" style={{ marginTop: 12 }}>
          هذا الرابط يضمن لك متابعة التقدم دون الحاجة لحساب.
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <input className="input" readOnly value={completeUrl} onFocus={(e) => e.target.select()} />
        </div>
        <div className="row">
          <button
            className="btn btn-gold btn-sm"
            onClick={() => { navigator.clipboard?.writeText(completeUrl); notify("تم نسخ الرابط", "info"); }}
          >نسخ رابط الإتمام</button>
          <Link href={`/complete/${done.token}`} className="btn btn-primary btn-sm">الانتقال لصفحة الإتمام</Link>
          <button className="btn btn-ghost btn-sm" onClick={() => { setDone(null); setSelected(null); router.refresh(); }}>
            حجز جزء آخر
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card highlight-card" style={{ marginBottom: 16 }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <strong>بطاقة التقدّم</strong>
            <p className="muted" style={{ marginTop: 8 }}>{milestoneLabel}</p>
          </div>
          <span className={`badge ${progress.completed === 30 ? "completed" : "active"}`}>
            {progress.completed === 30 ? "ختمة مكتملة" : `${progress.completed} تمّ • ${progress.reserved} محجوز • ${progress.available} متاح`}
          </span>
        </div>
        <div className="summary-grid" style={{ marginTop: 14 }}>
          <div className="status-card available">{progress.available} متاح</div>
          <div className="status-card reserved">{progress.reserved} محجوز</div>
          <div className="status-card completed">{progress.completed} مكتمل</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <strong>تقدّم الختمة</strong>
          <span className="muted">{progress.completed} / 30 ({progress.percent}%)</span>
        </div>
        <div className="progress"><span style={{ width: `${progress.percent}%` }} /></div>
        <div className="legend" style={{ marginTop: 12 }}>
          <span><i className="dot completed" /> تم</span>
          <span><i className="dot reserved" /> محجوز</span>
          <span><i className="dot available" /> متاح</span>
        </div>
      </div>

      {savedReservations.length > 0 ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <strong>حجوزاتك السابقة</strong>
          <p className="muted" style={{ margin: "8px 0 14px", fontSize: 13 }}>
            هذه الحجزات مخزنة في متصفحك فقط. استخدم الرابط لاستكمال الإتمام.
          </p>
          <div className="row" style={{ flexDirection: "column", gap: 10 }}>
            {savedReservations.map((reservation, index) => {
              const link = `${typeof window !== "undefined" ? window.location.origin : ""}/complete/${reservation.token}`;
              return (
                <div key={`${reservation.number}-${index}`} className="reservation-card">
                  <div>
                    <strong>جزء {reservation.number}</strong>
                    <div className="muted" style={{ fontSize: 13 }}>اسم الحجز: {reservation.name}</div>
                  </div>
                  <button
                    className="btn btn-sm btn-gold"
                    onClick={() => { navigator.clipboard?.writeText(link); notify("تم نسخ الرابط", "info"); }}
                  >نسخ رابط الإتمام</button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null }

      <p className="muted" style={{ fontSize: 14 }}>اختر جزءًا متاحًا ثم أدخل اسمك للحجز. الآخرين لن يروا اسمك.</p>
      <div className="juz-grid">
        {juz.map((j) => {
          const isAvail = j.status === "available";
          return (
            <div
              key={j.number}
              className={`juz ${j.status} ${isAvail ? "selectable" : ""} ${selected === j.number ? "selected" : ""}`}
              onClick={() => isAvail && setSelected(j.number)}
            >
              <span className="num">{j.number}</span>
              <span className="lbl">{JUZ_LABEL[j.status]}</span>
              {j.status === "reserved" ? <span className="who">محجوز الآن</span> : null}
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="field">
          <label>اسمك</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="اكتب اسمك" />
        </div>
        <div className="note" style={{ marginBottom: 12 }}>
          لا حاجة لكلمة مرور أو رمز تحقق. يمكنك استخدام نفس الاسم لاحقًا لاسترجاع حجزك.
        </div>
        <button className="btn btn-primary btn-block" onClick={reserve} disabled={busy || !selected}>
          {selected ? `احجز الجزء ${selected}` : "اختر جزءًا أولًا"}
        </button>
      </div>
    </>
  );
}
