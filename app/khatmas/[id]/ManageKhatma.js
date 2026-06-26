"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";
import ShareCompletionCard from "@/components/ShareCompletionCard";
import GroupTasbihWidget from "@/components/GroupTasbihWidget";
import QiblaCompass from "@/components/QiblaCompass";
import { useToast } from "@/components/Toast";

const STATUS_AR = { active: "نشطة", completed: "مكتملة", disabled: "موقوفة" };
const JUZ_LABEL = { available: "متاح", reserved: "محجوز", completed: "تم" };

export default function ManageKhatma({ khatma, juz, progress, groupDhikrs, timeline = [], participants = [], insights = [] }) {
  const router = useRouter();
  const notify = useToast();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(khatma.title);
  const [description, setDescription] = useState(khatma.description || "");
  const [honorName, setHonorName] = useState(khatma.honor_name || "");
  const [active, setActive] = useState(null); // selected juz for status panel
  const [busy, setBusy] = useState(false);

  const refresh = () => router.refresh();

  async function saveEdit() {
    setBusy(true);
    const res = await fetch(`/api/khatmas/${khatma.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, honorName }),
    });
    setBusy(false);
    if (res.ok) { notify("تم حفظ التعديلات"); setEditing(false); refresh(); }
    else notify("تعذّر الحفظ", "error");
  }

  async function setStatus(newStatus) {
    setBusy(true);
    const res = await fetch(`/api/khatmas/${khatma.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setBusy(false);
    if (res.ok) { notify(newStatus === "disabled" ? "تم إيقاف الختمة" : "تم تفعيل الختمة"); refresh(); }
    else notify("تعذّر التحديث", "error");
  }

  async function remove() {
    if (!confirm("هل أنت متأكد من حذف هذه الختمة نهائيًا؟")) return;
    setBusy(true);
    const res = await fetch(`/api/khatmas/${khatma.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) { notify("تم حذف الختمة"); router.push("/khatmas"); router.refresh(); }
    else notify("تعذّر الحذف", "error");
  }

  async function setJuz(number, status, name) {
    setBusy(true);
    const res = await fetch(`/api/khatmas/${khatma.id}/juz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number, status, name }),
    });
    setBusy(false);
    setActive(null);
    if (res.ok) { notify("تم تحديث حالة الجزء"); refresh(); }
    else notify("تعذّر التحديث", "error");
  }

  const completedAll = progress.completed === 30;

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          {editing ? (
            <div className="card" style={{ marginBottom: 12 }}>
              <div className="field">
                <label>اسم الختمة</label>
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="field">
                <label>الوصف</label>
                <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="field">
                <label>مهدى إلى</label>
                <input className="input" value={honorName} onChange={(e) => setHonorName(e.target.value)} placeholder="اسم الحبيب/الفقيد أو الدعاء الخاص" />
              </div>
              <div className="row">
                <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={busy}>حفظ</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>إلغاء</button>
              </div>
            </div>
          ) : (
            <>
              <div className="row" style={{ alignItems: "center" }}>
                <h1 className="section-title" style={{ margin: 0 }}>{khatma.title}</h1>
                <span className={`badge ${khatma.status}`}>{STATUS_AR[khatma.status]}</span>
              </div>
              {khatma.description ? <p className="muted" style={{ marginTop: 6 }}>{khatma.description}</p> : null}
              {khatma.honor_name ? (
                <div className="card" style={{ marginTop: 10, background: "rgba(235, 235, 255, 0.6)", padding: 12 }}>
                  <strong style={{ display: "block", marginBottom: 6 }}>مهدى إلى</strong>
                  <p style={{ margin: 0, lineHeight: 1.7 }}>{khatma.honor_name}</p>
                </div>
              ) : null}
              <p className="meta muted">أُنشئت في {khatma.created_at?.slice(0, 10)}</p>
            </>
          )}
        </div>
      </div>

      {completedAll && (
        <div className="celebrate" style={{ margin: "8px 0 18px" }}>
          <div style={{ fontSize: 34 }}>🤲</div>
          <h2>الحمد لله، اكتملت الختمة</h2>
          <p>تقبّل الله من الجميع وجعل ثوابها في ميزان حسنات من أُهديت له.</p>
          <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
            <Link href="/duas?category=quran_completion" className="btn btn-gold btn-sm" style={{ flex: "1 0 auto" }}>
              📖 دعاء ختم القرآن
            </Link>
            <Link href="/duas?category=deceased" className="btn btn-gold btn-sm" style={{ flex: "1 0 auto" }}>
              🌹 دعاء للمتوفّى
            </Link>
            <ShareCompletionCard publicId={khatma.public_id} title={khatma.title} honorName={khatma.honor_name} />
          </div>
        </div>
      )}

      <div className="card" style={{ margin: "14px 0" }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <strong>التقدّم العام</strong>
          <span className="muted">{progress.completed} / 30 ({progress.percent}%)</span>
        </div>
        <div className="progress"><span style={{ width: `${progress.percent}%` }} /></div>
        <div className="legend" style={{ marginTop: 12 }}>
          <span><i className="dot completed" /> تم ({progress.completed})</span>
          <span><i className="dot reserved" /> محجوز ({progress.reserved})</span>
          <span><i className="dot available" /> متاح ({progress.available})</span>
        </div>
      </div>

      <div className="row" style={{ gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", minWidth: 280 }}>
          <QiblaCompass />
        </div>
        <div style={{ flex: "1 1 320px", minWidth: 280 }}>
          <div className="card" style={{ background: "#f8f4e8" }}>
            <strong style={{ display: "block", marginBottom: 10 }}>لمحات ذكية</strong>
            {insights.map((msg, idx) => (
              <p key={idx} className="muted" style={{ margin: idx === 0 ? 0 : "8px 0 0", lineHeight: 1.7 }}>
                • {msg}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 18 }}>
        <ShareButton publicId={khatma.public_id} title={khatma.title} className="btn btn-gold btn-sm" />
        {!editing && <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>تعديل</button>}
        {khatma.status !== "disabled" ? (
          <button className="btn btn-ghost btn-sm" onClick={() => setStatus("disabled")} disabled={busy}>إيقاف الختمة</button>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={() => setStatus("active")} disabled={busy}>إعادة تفعيل</button>
        )}
        <button className="btn btn-danger btn-sm" onClick={remove} disabled={busy}>حذف</button>
        <Link href="/khatmas" className="btn btn-ghost btn-sm">رجوع للقائمة</Link>
      </div>

      <h2 className="section-title" style={{ fontSize: 18 }}>أجزاء الختمة</h2>
      <p className="muted" style={{ marginTop: 0, fontSize: 14 }}>اضغط على أي جزء لتغيير حالته يدويًا.</p>

      <GroupTasbihWidget khatmaId={khatma.id} groupDhikrs={groupDhikrs} />

      <div className="juz-grid">
        {juz.map((j) => (
          <div
            key={j.number}
            className={`juz ${j.status} selectable`}
            onClick={() => setActive(active === j.number ? null : j.number)}
          >
            <span className="num">{j.number}</span>
            <span className="lbl">{JUZ_LABEL[j.status]}</span>
            {j.participant_name ? <span className="who">{j.participant_name}</span> : null}
          </div>
        ))}
      </div>

      <div className="row" style={{ gap: 12, marginTop: 18, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px", minWidth: 280 }}>
          <div className="card">
            <strong style={{ display: "block", marginBottom: 10 }}>سجل النشاط</strong>
            {timeline.length === 0 ? (
              <p className="muted">لا توجد سجلات حتى الآن. اكمل أو احجز جزءًا لتبدأ السجل.</p>
            ) : (
              timeline.map((event, idx) => (
                <div key={`${event.number}-${idx}`} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{event.type === "completed" ? "تم إكمال الجزء" : "حجز الجزء"} {event.number}</span>
                    <span className="muted" style={{ fontSize: 12 }}>{event.time.slice(0, 16).replace("T", " ")}</span>
                  </div>
                  <p className="muted" style={{ margin: 4, fontSize: 13 }}>بواسطة {event.name}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <div style={{ flex: "1 1 280px", minWidth: 280 }}>
          <div className="card" style={{ background: "#eef7f4" }}>
            <strong style={{ display: "block", marginBottom: 10 }}>المشاركون النشطون</strong>
            {participants.length === 0 ? (
              <p className="muted">لم يتم تسجيل أي مساهمة باسم مشارك حتى الآن.</p>
            ) : (
              participants.map((p) => (
                <div key={p.name} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>عدد الأجزاء: {p.count} · {p.completed ? "أكمل" : "محجوز"}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {active && (
        <JuzPanel
          number={active}
          juz={juz.find((x) => x.number === active)}
          onClose={() => setActive(null)}
          onSet={setJuz}
          busy={busy}
        />
      )}
    </>
  );
}

function JuzPanel({ number, juz, onClose, onSet, busy }) {
  const [name, setName] = useState(juz?.participant_name || "");
  return (
    <div className="card" style={{ marginTop: 16, borderColor: "var(--green)" }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <strong>الجزء {number} — تغيير الحالة</strong>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>إغلاق</button>
      </div>
      <div className="field" style={{ marginTop: 12 }}>
        <label>اسم المشارك (للحجز أو الإتمام)</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم المشارك" />
      </div>
      <div className="row">
        <button className="btn btn-ghost btn-sm" onClick={() => onSet(number, "available")} disabled={busy}>تعيين كـ متاح</button>
        <button className="btn btn-gold btn-sm" onClick={() => onSet(number, "reserved", name)} disabled={busy}>تعيين كـ محجوز</button>
        <button className="btn btn-primary btn-sm" onClick={() => onSet(number, "completed", name)} disabled={busy}>تعيين كـ مُتمّ</button>
      </div>
    </div>
  );
}
