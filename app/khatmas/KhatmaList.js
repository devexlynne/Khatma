"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";

const FILTERS = [
  { key: "all", label: "الكل" },
  { key: "active", label: "نشطة" },
  { key: "completed", label: "مكتملة" },
  { key: "disabled", label: "موقوفة" },
];

const STATUS_AR = { active: "نشطة", completed: "مكتملة", disabled: "موقوفة" };

export default function KhatmaList({ khatmas }) {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    return khatmas.filter((k) => {
      const okStatus = filter === "all" ? true : k.status === filter;
      const okQ = q.trim() === "" ? true : k.title.includes(q.trim());
      return okStatus && okQ;
    });
  }, [khatmas, filter, q]);

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 className="section-title">ختماتي</h1>
        <Link href="/khatmas/new" className="btn btn-primary btn-sm">+ ختمة جديدة</Link>
      </div>

      <div className="row" style={{ marginBottom: 16, alignItems: "center" }}>
        <div className="row">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`btn btn-sm ${filter === f.key ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          className="input"
          placeholder="بحث بالاسم…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ maxWidth: 220, marginInlineStart: "auto" }}
        />
      </div>

      {shown.length === 0 ? (
        <div className="card center"><p className="muted">لا توجد ختمات مطابقة.</p></div>
      ) : (
        <div className="stat-grid">
          {shown.map((k) => (
            <div key={k.id} className="card k-card">
              <div className="top">
                <h3>{k.title}</h3>
                <span className={`badge ${k.status}`}>{STATUS_AR[k.status]}</span>
              </div>
              {k.description ? <p className="desc">{k.description}</p> : null}
              <div className="progress"><span style={{ width: `${k.progress.percent}%` }} /></div>
              <div className="meta">
                {k.progress.completed} / 30 — {k.progress.percent}% · أُنشئت {k.created_at?.slice(0, 10)}
              </div>
              <div className="row">
                <Link href={`/khatmas/${k.id}`} className="btn btn-ghost btn-sm">إدارة</Link>
                <ShareButton publicId={k.public_id} title={k.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
