"use client";
import { useEffect,useState } from "react";

export default function AnnouncementSignal(){
  const [fresh,setFresh]=useState(false);
  useEffect(()=>{fetch("/api/announcement",{cache:"no-store"}).then(r=>r.json()).then(d=>setFresh(Boolean(d.updatedAt&&localStorage.getItem("announcement_seen")!==d.updatedAt))).catch(()=>{});},[]);
  const acknowledge=()=>{fetch("/api/announcement").then(r=>r.json()).then(d=>{if(d.updatedAt)localStorage.setItem("announcement_seen",d.updatedAt);setFresh(false);});};
  return fresh?<button type="button" className="brand-news-star" title="هناك رسالة جديدة" aria-label="هناك رسالة جديدة" onClick={acknowledge}>✦</button>:null;
}
