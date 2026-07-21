"use client";
import { useEffect,useState } from "react";
import { useToast } from "@/components/Toast";

export default function AnnouncementAdmin(){
  const [message,setMessage]=useState(""); const [saving,setSaving]=useState(false); const notify=useToast();
  useEffect(()=>{fetch("/api/announcement").then(r=>r.json()).then(d=>setMessage(d.message||""));},[]);
  const save=async()=>{setSaving(true); const r=await fetch("/api/announcement",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message})}); setSaving(false); notify(r.ok?"تم تحديث شريط الرسائل":"تعذر حفظ الرسالة",r.ok?"success":"error");};
  return <section className="card announcement-admin"><div><strong>شريط رسائل الموقع</strong><p className="muted">غيّر الدعاء أو الرسالة التي تظهر للزوار في الصفحة الرئيسية.</p></div><textarea className="input" rows="3" maxLength="500" value={message} onChange={e=>setMessage(e.target.value)} /><button className="btn btn-primary" onClick={save} disabled={saving||!message.trim()}>{saving?"جارٍ الحفظ…":"نشر الرسالة"}</button></section>;
}
