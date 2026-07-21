"use client";
import { useEffect, useState } from "react";

export default function AnnouncementBar() {
  const [data,setData]=useState(null);
  useEffect(()=>{ fetch("/api/announcement").then(r=>r.json()).then(next=>{
    setData(next);
  }).catch(()=>{}); },[]);
  if(!data?.message) return null;
  return <aside className="announcement-bar" aria-label="رسالة الموقع"><span className="announcement-star">✦</span><strong>رسالة اليوم</strong><div className="announcement-track"><span>{data.message}</span></div></aside>;
}
