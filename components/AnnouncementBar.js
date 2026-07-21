"use client";
import { useEffect, useState } from "react";

export default function AnnouncementBar() {
  const [data,setData]=useState(null);
  useEffect(()=>{ const load=()=>fetch("/api/announcement",{cache:"no-store"}).then(r=>r.json()).then(setData).catch(()=>{}); load(); const timer=setInterval(load,15000); return()=>clearInterval(timer); },[]);
  if(!data?.message) return null;
  return <aside className="announcement-bar" aria-label="شريط أخبار الموقع"><span className="announcement-star">✦</span><strong>آخر الأخبار</strong><div className="announcement-track"><span>{data.message}</span></div></aside>;
}
