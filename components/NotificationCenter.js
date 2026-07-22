"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [seenAt, setSeenAt] = useState("");
  const wrapRef = useRef(null);

  async function load() {
    const response = await fetch("/api/notifications", { cache: "no-store" });
    if (response.ok) setItems((await response.json()).notifications || []);
  }

  useEffect(() => {
    setSeenAt(localStorage.getItem("notifications_seen_at") || "");
    load();
    const timer = setInterval(load, 60000);
    const close = (event) => { if (!wrapRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener("click", close);
    return () => { clearInterval(timer); document.removeEventListener("click", close); };
  }, []);

  const unread = items.filter((item) => {
    if (!seenAt) return true;
    const created = new Date(String(item.createdAt || "").replace(" ", "T") + (String(item.createdAt || "").includes("T") ? "" : "Z")).getTime();
    return Number.isFinite(created) && created > new Date(seenAt).getTime();
  }).length;
  function toggle(event) {
    event.stopPropagation();
    const next = !open;
    setOpen(next);
    if (next) {
      const now = new Date().toISOString();
      localStorage.setItem("notifications_seen_at", now);
      setSeenAt(now);
    }
  }

  return <div className="notification-center" ref={wrapRef}>
    <button type="button" className="notification-bell" onClick={toggle} aria-label="مركز الإشعارات" aria-expanded={open}>🔔{unread > 0 ? <span>{Math.min(unread, 9)}</span> : null}</button>
    {open ? <div className="notification-panel" onClick={(event) => event.stopPropagation()}>
      <div className="notification-heading"><strong>آخر الإشعارات</strong><button type="button" onClick={load}>تحديث</button></div>
      {items.length ? <div className="notification-list">{items.map((item) => <Link href={item.url || "/dashboard"} key={item.id} className="notification-item" onClick={() => setOpen(false)}><span className={`notification-dot ${item.type}`} /><div><strong>{item.title}</strong><p>{item.message}</p><small>{item.createdAt?.slice(0,16).replace("T"," ")}</small></div></Link>)}</div> : <p className="notification-empty">لا توجد إشعارات جديدة.</p>}
    </div> : null}
  </div>;
}
