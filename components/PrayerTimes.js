"use client";

import { useEffect, useState } from "react";

const LOCATIONS = [
  ["بيروت، لبنان", "Beirut", "Lebanon", 33.8938, 35.5018], ["طرابلس، لبنان", "Tripoli", "Lebanon", 34.4367, 35.8497],
  ["الرياض، السعودية", "Riyadh", "Saudi Arabia", 24.7136, 46.6753], ["القاهرة، مصر", "Cairo", "Egypt", 30.0444, 31.2357],
  ["الرباط، المغرب", "Rabat", "Morocco", 34.0209, -6.8416], ["عمّان، الأردن", "Amman", "Jordan", 31.9539, 35.9106],
];
const PRAYERS = { Fajr:"الفجر", Sunrise:"الشروق", Dhuhr:"الظهر", Asr:"العصر", Maghrib:"المغرب", Isha:"العشاء" };

export default function PrayerTimes() {
  const [location,setLocation]=useState({city:"Beirut",country:"Lebanon",label:"بيروت، لبنان",latitude:33.8938,longitude:35.5018});
  const [draft,setDraft]=useState({city:"",country:""});
  const [times,setTimes]=useState(null); const [error,setError]=useState("");
  useEffect(()=>{
    setTimes(null); setError("");
    const now=new Date();
    const date=[now.getFullYear(),String(now.getMonth()+1).padStart(2,"0"),String(now.getDate()).padStart(2,"0")].join("-");
    const coordinates=Number.isFinite(location.latitude)&&Number.isFinite(location.longitude)?`&latitude=${location.latitude}&longitude=${location.longitude}`:"";
    fetch(`/api/prayertimes?city=${encodeURIComponent(location.city)}&country=${encodeURIComponent(location.country)}&date=${date}${coordinates}`)
      .then(r=>r.json()).then(j=>j.ok?setTimes(j.data):setError("تعذر جلب المواقيت، تحقق من اسم المدينة والبلد."))
      .catch(()=>setError("تعذر الاتصال بخدمة المواقيت."));
  },[location]);
  const choose=(value)=>{ const item=LOCATIONS.find(x=>x[0]===value); if(item)setLocation({label:item[0],city:item[1],country:item[2],latitude:item[3],longitude:item[4]}); };
  const search=(e)=>{ e.preventDefault(); if(draft.city.trim()&&draft.country.trim())setLocation({city:draft.city.trim(),country:draft.country.trim(),label:`${draft.city.trim()}، ${draft.country.trim()}`}); };
  const useMyLocation=()=>{
    if(!navigator.geolocation)return setError("تحديد الموقع غير مدعوم في هذا المتصفح.");
    setError("");
    navigator.geolocation.getCurrentPosition(
      ({coords})=>setLocation({city:"Current location",country:"",label:"موقعي الحالي",latitude:coords.latitude,longitude:coords.longitude}),
      ()=>setError("تعذر تحديد موقعك. اسمح للموقع بالوصول إلى موقع الهاتف ثم حاول مجددًا."),
      {enableHighAccuracy:true,timeout:10000,maximumAge:300000}
    );
  };
  return <section className="card prayer-times moroccan-frame">
    <div className="prayer-heading"><div><strong>أوقات الصلاة — {location.label}</strong><p className="muted">يمكنك الاختيار أو كتابة أي مدينة وبلد بالعربية.</p></div>
      <label>اختيار سريع<select className="input" value={LOCATIONS.some(x=>x[0]===location.label)?location.label:""} onChange={e=>choose(e.target.value)}><option value="">مدينة أخرى</option>{LOCATIONS.map(x=><option key={x[0]}>{x[0]}</option>)}</select></label>
    </div>
    <button type="button" className="btn btn-ghost btn-sm prayer-location-btn" onClick={useMyLocation}>استخدام موقعي الحالي</button>
    <form className="prayer-search" onSubmit={search}><input className="input" value={draft.city} onChange={e=>setDraft({...draft,city:e.target.value})} placeholder="المدينة، مثل: صيدا" /><input className="input" value={draft.country} onChange={e=>setDraft({...draft,country:e.target.value})} placeholder="البلد، مثل: لبنان" /><button className="btn btn-primary btn-sm">عرض المواقيت</button></form>
    {!times&&!error&&<p className="muted">جارٍ جلب أوقات الصلاة…</p>}{error&&<p className="error-text">{error}</p>}
    {times&&<><p className="muted prayer-date">مواقيت {times.date?.readable || "اليوم"} حسب طريقة الحساب المعتمدة للمنطقة.</p><div className="prayer-grid">{Object.entries(PRAYERS).map(([key,label])=><div key={key} className="prayer-item"><div className="prayer-key">{label}</div><div className="prayer-val">{times.timings?.[key]}</div></div>)}</div></>}
  </section>;
}
