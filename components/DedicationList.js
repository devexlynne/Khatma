"use client";

import { useEffect, useState } from "react";

export default function DedicationList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/dedications/list");
        const data = await res.json();
        if (data.ok && mounted) setItems(data.items || []);
      } catch (err) {}
      if (mounted) setLoading(false);
    };
    fetchItems();
    return () => (mounted = false);
  }, []);

  if (loading) return <p className="muted">جاري تحميل الأدعية...</p>;
  if (!items.length) return <p className="muted">لا توجد dedications بعد.</p>;

  return (
    <div className="dedication-list">
      {items.map((it) => (
        <div key={it.id} className="dedication-item card">
          {it.image_url ? <img src={it.image_url} alt="dedication" className="dedication-item-img" /> : null}
          <div className="dedication-item-body">
            {it.name ? <div className="dedication-item-name">لـ {it.name}</div> : null}
            <div className="dedication-item-msg">{it.message}</div>
            <div className="muted dedication-item-meta">{new Date(it.approved_at || it.submitted_at).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
