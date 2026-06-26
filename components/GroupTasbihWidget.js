"use client";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";

const GROUP_DHIKRS = [
  "استغفار جماعي",
  "تسبيح جماعي",
  "صلاة على النبي",
  "تهليل جماعي",
];

export default function GroupTasbihWidget({ khatmaId, groupDhikrs }) {
  const router = useRouter();
  const notify = useToast();
  const [selectedDhikr, setSelectedDhikr] = useState(null);
  const [count, setCount] = useState(1);
  const [busy, setBusy] = useState(false);

  const handleContribute = async () => {
    if (!selectedDhikr) {
      notify("اختر نوع الذكر أولًا", "error");
      return;
    }

    setBusy(true);
    const res = await fetch(`/api/khatmas/${khatmaId}/group-dhikr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dhikrType: selectedDhikr, count }),
    });
    setBusy(false);

    if (res.ok) {
      notify(`تم إضافة ${count} ${selectedDhikr} للذكر الجماعي ✨`);
      setSelectedDhikr(null);
      setCount(1);
      router.refresh();
    } else {
      notify("تعذّر إضافة المساهمة", "error");
    }
  };

  return (
    <div className="card" style={{ background: "linear-gradient(135deg, var(--gold-soft), rgba(201, 164, 76, 0.1))" }}>
      <h3 style={{ marginTop: 0, marginBottom: 14, fontSize: 15, color: "var(--gold)" }}>
        🤲 الذكر الجماعي لهذه الختمة
      </h3>

      {/* Show existing group dhikrs */}
      {groupDhikrs && groupDhikrs.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {groupDhikrs.map((gd) => (
            <div key={gd.id} style={{ marginBottom: 10, padding: "10px", background: "white", borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <strong style={{ fontSize: 13 }}>{gd.dhikr_type}</strong>
                <span style={{ fontSize: 12, fontWeight: "bold", color: "var(--gold)" }}>{gd.total_count}</span>
              </div>
              <div style={{ height: 4, background: "#e0e0e0", borderRadius: 2, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    background: "var(--gold)",
                    width: `${Math.min((gd.total_count / 1000) * 100, 100)}%`,
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add contribution form */}
      <div className="field" style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 12 }}>أضف مساهمتك</label>
        <select
          className="input"
          value={selectedDhikr || ""}
          onChange={(e) => setSelectedDhikr(e.target.value)}
          style={{ padding: "6px 8px", fontSize: 13 }}
        >
          <option value="">اختر نوع الذكر</option>
          {GROUP_DHIKRS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="field" style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 12 }}>العدد</label>
        <input
          type="number"
          className="input"
          min="1"
          value={count}
          onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
          style={{ padding: "6px 8px", fontSize: 13 }}
        />
      </div>

      <button
        className="btn btn-gold btn-block"
        onClick={handleContribute}
        disabled={busy || !selectedDhikr}
        style={{ fontSize: 13 }}
      >
        {busy ? "جارٍ الإضافة…" : "📤 أضف المساهمة"}
      </button>
    </div>
  );
}
