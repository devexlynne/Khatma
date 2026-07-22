"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

const JUZ_LABEL = { available: "متاح", reserved: "محجوز", completed: "تم" };

export default function ReservePanel({ publicId, juz, progress }) {
  const router = useRouter();
  const notify = useToast();
  const [selected, setSelected] = useState([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState([]); // [{ number, token }]
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
    if (selected.length === 0) return notify("اختر جزءًا متاحًا واحدًا أو أكثر", "error");
    if (!name.trim()) return notify("أدخل اسمك", "error");
    setBusy(true);
    const results = await Promise.all(selected.map(async (number) => {
      const res = await fetch(`/api/public/${publicId}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number, name }),
      });
      const data = await res.json();
      return { number, ok: res.ok, ...data };
    }));
    setBusy(false);
    const successful = results.filter((result) => result.ok);
    const failed = results.filter((result) => !result.ok);
    if (successful.length > 0) {
      try {
        const key = `khatma_${publicId}_reservations`;
        const prev = JSON.parse(localStorage.getItem(key) || "[]");
        const additions = successful.map((result) => ({ number: result.number, name: name.trim(), token: result.token }));
        const next = [...prev, ...additions];
        localStorage.setItem(key, JSON.stringify(next));
        setSavedReservations(next);
      } catch {}
      notify(successful.length === 1 ? "تم حجز الجزء بنجاح" : `تم حجز ${successful.length} أجزاء بنجاح`);
      setDone(successful.map(({ number, token }) => ({ number, token })));
    }
    if (failed.length > 0) notify(`تعذّر حجز ${failed.length} من الأجزاء لأنها حُجزت للتو`, "error");
    if (successful.length === 0 && failed[0]) notify(failed[0].error || "تعذّر الحجز", "error");
    router.refresh();
  }

  if (done.length > 0) {
    return (
      <div className="card">
        <div className="center">
          <div style={{ fontSize: 30 }}>✅</div>
          <h2 className="section-title" style={{ fontSize: 20 }}>{done.length === 1 ? `تم حجز الجزء ${done[0].number}` : `تم حجز ${done.length} أجزاء`}</h2>
          <p className="muted">لكل جزء رابط إتمام مستقل. الروابط محفوظة أيضًا في هذا المتصفح.</p>
        </div>
        <div className="note" style={{ marginTop: 12 }}>
          احتفظ بروابط الإتمام لتحديث كل جزء بعد الانتهاء من قراءته، دون الحاجة لحساب.
        </div>
        <div className="row" style={{ flexDirection: "column", gap: 10, marginTop: 12 }}>
          {done.map((reservation) => {
            const completeUrl = typeof window !== "undefined" ? `${window.location.origin}/complete/${reservation.token}` : "";
            return <div className="reservation-card" key={reservation.token}>
              <strong>الجزء {reservation.number}</strong>
              <div className="row">
                <button className="btn btn-gold btn-sm" onClick={() => { navigator.clipboard?.writeText(completeUrl); notify("تم نسخ الرابط", "info"); }}>نسخ رابط الإتمام</button>
                <Link href={`/complete/${reservation.token}`} className="btn btn-primary btn-sm">صفحة الإتمام</Link>
              </div>
            </div>;
          })}
          <button className="btn btn-ghost btn-sm" onClick={() => { setDone([]); setSelected([]); router.refresh(); }}>
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
                  <div className="row">
                    <Link href={`/complete/${reservation.token}`} className="btn btn-sm btn-primary">تممت القراءة</Link>
                    <button
                      className="btn btn-sm btn-gold"
                      onClick={() => { navigator.clipboard?.writeText(link); notify("تم نسخ الرابط", "info"); }}
                    >نسخ رابط الإتمام</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null }

      <p className="muted" style={{ fontSize: 14 }}>اختر جزءًا واحدًا أو عدة أجزاء متاحة، ثم أدخل اسمك للحجز. اضغط على الجزء مرة أخرى لإلغاء اختياره.</p>
      <div className="juz-grid">
        {juz.map((j) => {
          const isAvail = j.status === "available";
          const ownReservation = savedReservations.find((reservation) => reservation.number === j.number);
          return (
            <div
              key={j.number}
              className={`juz ${j.status} ${isAvail ? "selectable" : ""} ${ownReservation ? "reserved-by-me" : ""} ${selected.includes(j.number) ? "selected" : ""}`}
              onClick={() => isAvail && setSelected((current) => current.includes(j.number) ? current.filter((number) => number !== j.number) : [...current, j.number])}
            >
              <span className="num">{j.number}</span>
              <span className="lbl">{ownReservation && j.status === "reserved" ? "محجوز لك" : JUZ_LABEL[j.status]}</span>
              {ownReservation && j.status === "reserved" ? (
                <button type="button" className="complete-my-juz" onClick={(event)=>{event.stopPropagation();router.push(`/complete/${ownReservation.token}`);}}>تممت القراءة</button>
              ) : j.status === "reserved" ? <span className="who">محجوز الآن</span> : null}
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
        <button className="btn btn-primary btn-block" onClick={reserve} disabled={busy || selected.length === 0}>
          {busy ? "جارٍ الحجز..." : selected.length === 0 ? "اختر جزءًا واحدًا أو أكثر" : selected.length === 1 ? `احجز الجزء ${selected[0]}` : `احجز ${selected.length} أجزاء: ${selected.join("، ")}`}
        </button>
      </div>
    </>
  );
}
