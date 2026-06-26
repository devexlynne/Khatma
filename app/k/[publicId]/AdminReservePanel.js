"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

const JUZ_LABEL = { available: "متاح", reserved: "محجوز", completed: "تم" };
const STATUS_COLORS = { available: "#10b981", reserved: "#f59e0b", completed: "#3b82f6" };

export default function AdminReservePanel({ khatmaId, juz, progress }) {
  const router = useRouter();
  const notify = useToast();
  const [editingJuz, setEditingJuz] = useState(null);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function updateJuz(number, newStatus, newName) {
    setBusy(true);
    const res = await fetch(`/api/khatmas/${khatmaId}/juz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number, status: newStatus, name: newName }),
    });
    setBusy(false);
    if (res.ok) {
      notify("تم التحديث بنجاح");
      setEditingJuz(null);
      router.refresh();
    } else {
      notify("تعذّر التحديث", "error");
    }
  }

  const handleEditStart = (j) => {
    setEditingJuz(j.number);
    setEditName(j.participant_name || "");
    setEditStatus(j.status);
  };

  const handleEditSave = () => {
    updateJuz(editingJuz, editStatus, editName);
  };

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <strong>📊 تقدّم الختمة</strong>
          <span className="muted">{progress.completed} / 30 ({progress.percent}%)</span>
        </div>
        <div className="progress"><span style={{ width: `${progress.percent}%` }} /></div>
        <div className="legend" style={{ marginTop: 12 }}>
          <span><i className="dot completed" /> مُتمّ</span>
          <span><i className="dot reserved" /> محجوز</span>
          <span><i className="dot available" /> متاح</span>
        </div>
      </div>

      <p className="muted" style={{ fontSize: 14, marginBottom: 12 }}>
        👨‍💼 صلاحيات الإدارة: أنت تستطيع إدارة جميع الأجزاء وتعيين المشاركين والاطلاع على جميع الأسماء.
      </p>

      <div className="juz-grid">
        {juz.map((j) => {
          const isEditing = editingJuz === j.number;
          return (
            <div key={j.number}>
              {isEditing ? (
                <div className="card" style={{ padding: 12, marginBottom: 12 }}>
                  <div style={{ marginBottom: 8, fontSize: 14, fontWeight: "bold" }}>تعديل الجزء {j.number}</div>
                  <div className="field" style={{ marginBottom: 8 }}>
                    <label>الحالة</label>
                    <select
                      className="input"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      style={{ padding: "6px 8px", fontSize: 14 }}
                    >
                      <option value="available">متاح</option>
                      <option value="reserved">محجوز</option>
                      <option value="completed">مُتمّ</option>
                    </select>
                  </div>
                  <div className="field" style={{ marginBottom: 8 }}>
                    <label>اسم المشارك</label>
                    <input
                      className="input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="اسم المشارك (اختياري)"
                      style={{ padding: "6px 8px" }}
                    />
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleEditSave}
                      disabled={busy}
                      style={{ flex: 1, padding: "4px 8px", fontSize: 13 }}
                    >
                      حفظ
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setEditingJuz(null)}
                      disabled={busy}
                      style={{ flex: 1, padding: "4px 8px", fontSize: 13 }}
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`juz ${j.status}`}
                  onClick={() => handleEditStart(j)}
                  style={{
                    cursor: "pointer",
                    position: "relative",
                    border: "2px solid transparent",
                    transition: "all 0.2s",
                  }}
                  title="انقر للتعديل"
                >
                  <span className="num">{j.number}</span>
                  <span className="lbl">{JUZ_LABEL[j.status]}</span>
                  {j.participant_name && (
                    <span className="who" style={{ fontSize: 11, marginTop: 4, fontWeight: 500 }}>
                      {j.participant_name}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 15 }}>📋 ملخص المشاركين</h3>
        <div style={{ fontSize: 13 }}>
          {juz.filter((j) => j.participant_name && j.participant_name !== "—").length === 0 ? (
            <p className="muted">لا توجد حجوزات بعد</p>
          ) : (
            <ul style={{ margin: 0, paddingRight: 20 }}>
              {juz
                .filter((j) => j.participant_name && j.participant_name !== "—")
                .map((j) => (
                  <li key={j.number} style={{ marginBottom: 4 }}>
                    <strong>{j.participant_name}</strong> — الجزء {j.number} ({JUZ_LABEL[j.status]})
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
