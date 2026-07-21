"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";

export default function AnnouncementAdmin(){
  const [message,setMessage]=useState(""); const [saving,setSaving]=useState(false); const [published,setPublished]=useState(false); const notify=useToast();
  useEffect(()=>{fetch("/api/announcement",{cache:"no-store"}).then(r=>r.json()).then(d=>setMessage(d.message||""));},[]);
  const save=async()=>{setSaving(true); setPublished(false); const r=await fetch("/api/announcement",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message})}); const data=await r.json().catch(()=>({})); setSaving(false); if(r.ok){setPublished(true);setMessage(data.message||message);} notify(r.ok?"تم نشر الخبر في الصفحة الرئيسية":"تعذر نشر الخبر",r.ok?"success":"error");};
  return <section className="card announcement-admin"><div><strong>إضافة خبر أو دعاء للصفحة الرئيسية</strong><p className="muted">اكتب الخبر، الإعلان، الدعاء أو الرسالة التي تريد إظهارها للزوار في شريط الأخبار أعلى الصفحة.</p></div><label className="label" htmlFor="admin-news-message">نص الخبر أو الرسالة</label><textarea id="admin-news-message" className="input" rows="3" maxLength="500" placeholder="اكتب الخبر أو الدعاء هنا…" value={message} onChange={e=>{setMessage(e.target.value);setPublished(false);}} /><div className="row"><button className="btn btn-primary" onClick={save} disabled={saving||!message.trim()}>{saving?"جارٍ النشر…":"نشر الخبر في الصفحة"}</button><Link className="btn btn-ghost" href="/">عرض الصفحة الرئيسية</Link></div>{published&&<div className="announcement-success"><strong>✓ تم نشر الخبر بنجاح</strong><span>{message}</span></div>}</section>;
}
