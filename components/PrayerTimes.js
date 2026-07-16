"use client";

import { useEffect, useState } from "react";

const LOCATIONS = [
  ["بيروت، لبنان", "Beirut", "Lebanon"], ["طرابلس، لبنان", "Tripoli", "Lebanon"],
  ["الرياض، السعودية", "Riyadh", "Saudi Arabia"], ["القاهرة، مصر", "Cairo", "Egypt"],
  ["الرباط، المغرب", "Rabat", "Morocco"], ["عمّان، الأردن", "Amman", "Jordan"],
];
const PRAYERS = { Fajr:"الفجر", Sunrise:"الشروق", Dhuhr:"الظهر", Asr:"العصر", Maghrib:"المغرب", Isha:"العشاء" };

export default function PrayerTimes() {
  const [location,setLocation]=useState({city:"Beirut",country:"Lebanon",label:"بيروت، لبنان"});
  const [draft,setDraft]=useState({city:"",country:""});
  const [times,setTimes]=useState(null); const [error,setError]=useState("");
  useEffect(()=>{
    setTimes(null); setError("");
    fetch(`/api/prayertimes?city=${encodeURIComponent(location.city)}&country=${encodeURIComponent(location.country)}&method=2`)
      .then(r=>r.json()).then(j=>j.ok?setTimes(j.data):setError("تعذر جلب المواقيت، تحقق من اسم المدينة والبلد."))
      .catch(()=>setError("تعذر الاتصال بخدمة المواقيت."));
  },[location]);
  const choose=(value)=>{ const item=LOCATIONS.find(x=>x[0]===value); if(item)setLocation({label:item[0],city:item[1],country:item[2]}); };
  const search=(e)=>{ e.preventDefault(); if(draft.city.trim()&&draft.country.trim())setLocation({city:draft.city.trim(),country:draft.country.trim(),label:`${draft.city.trim()}، ${draft.country.trim()}`}); };
  return <section className="card prayer-times moroccan-frame">
    <div className="prayer-heading"><div><strong>أوقات الصلاة — {location.label}</strong><p className="muted">يمكنك الاختيار أو كتابة أي مدينة وبلد بالعربية.</p></div>
      <label>اختيار سريع<select className="input" value={LOCATIONS.some(x=>x[0]===location.label)?location.label:""} onChange={e=>choose(e.target.value)}><option value="">مدينة أخرى</option>{LOCATIONS.map(x=><option key={x[0]}>{x[0]}</option>)}</select></label>
    </div>
    <form className="prayer-search" onSubmit={search}><input className="input" value={draft.city} onChange={e=>setDraft({...draft,city:e.target.value})} placeholder="المدينة، مثل: صيدا" /><input className="input" value={draft.country} onChange={e=>setDraft({...draft,country:e.target.value})} placeholder="البلد، مثل: لبنان" /><button className="btn btn-primary btn-sm">عرض المواقيت</button></form>
    {!times&&!error&&<p className="muted">جارٍ جلب أوقات الصلاة…</p>}{error&&<p className="error-text">{error}</p>}
    {times&&<div className="prayer-grid">{Object.entries(PRAYERS).map(([key,label])=><div key={key} className="prayer-item"><div className="prayer-key">{label}</div><div className="prayer-val">{times.timings?.[key]}</div></div>)}</div>}
  </section>;
}
