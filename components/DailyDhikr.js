"use client";

import { PRESET_DHIKRS } from "@/lib/dhikrData";
import Link from "next/link";

export default function DailyDhikr() {
  // Get deterministic daily dhikr based on date
  const today = Math.floor(new Date().getTime() / 1000 / 86400);
  const dhikrIndex = today % PRESET_DHIKRS.length;
  const dailyDhikr = PRESET_DHIKRS[dhikrIndex];

  return (
    <div
      className="card"
      style={{
        background: "linear-gradient(135deg, var(--green-soft), var(--blue-soft))",
        borderColor: "var(--green)",
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: "bold",
            color: "var(--green-dark)",
            marginBottom: 4,
          }}
        >
          ✨ ذكر اليوم
        </div>

        <div
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "var(--green-dark)",
            marginBottom: 8,
          }}
        >
          {dailyDhikr.text}
        </div>

        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          الهدف: {dailyDhikr.goal} مرة
        </div>
      </div>

      <Link
        href="/tasbih"
        className="btn btn-primary btn-sm"
        style={{ width: "100%", textAlign: "center" }}
      >
        🤲 ابدأ التسبيح
      </Link>
    </div>
  );
}