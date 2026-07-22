"use client";

import { useEffect, useState } from "react";

const LOCATIONS = [
  ["بيروت، لبنان", "Beirut", "Lebanon", 33.8938, 35.5018, "Asia/Beirut"], ["طرابلس، لبنان", "Tripoli", "Lebanon", 34.4367, 35.8497, "Asia/Beirut"],
  ["الرياض، السعودية", "Riyadh", "Saudi Arabia", 24.7136, 46.6753, "Asia/Riyadh"], ["القاهرة، مصر", "Cairo", "Egypt", 30.0444, 31.2357, "Africa/Cairo"],
  ["الرباط، المغرب", "Rabat", "Morocco", 34.0209, -6.8416, "Africa/Casablanca"], ["عمّان، الأردن", "Amman", "Jordan", 31.9539, 35.9106, "Asia/Amman"],
  ["باريس، فرنسا", "Paris", "France", 48.8566, 2.3522, "Europe/Paris"],
];
const PRAYERS = { Fajr:"الفجر", Sunrise:"الشروق", Dhuhr:"الظهر", Asr:"العصر", Maghrib:"المغرب", Isha:"العشاء" };
const METHODS = [
  ["auto", "تلقائي حسب البلد"],
  ["12", "فرنسا — UOIF"],
  ["3", "رابطة العالم الإسلامي"],
  ["5", "الهيئة المصرية العامة للمساحة"],
  ["4", "أم القرى — مكة"],
  ["21", "وزارة الأوقاف المغربية"],
  ["13", "رئاسة الشؤون الدينية التركية"],
];
const METHOD_LABELS = Object.fromEntries(METHODS.filter(([value])=>value!=="auto"));

export default function PrayerTimes() {
  const [location,setLocation]=useState({city:"Beirut",country:"Lebanon",label:"بيروت، لبنان",latitude:33.8938,longitude:35.5018,timezone:"Asia/Beirut"});
  const [draft,setDraft]=useState({city:"",country:""});
  const [method,setMethod]=useState("auto");
  const [times,setTimes]=useState(null); const [error,setError]=useState("");
  useEffect(()=>{
    setTimes(null); setError("");
    const controller=new AbortController();
    const coordinates=Number.isFinite(location.latitude)&&Number.isFinite(location.longitude)?`&latitude=${location.latitude}&longitude=${location.longitude}`:"";
    const timezone=coordinates&&location.timezone?`&timezone=${encodeURIComponent(location.timezone)}`:"";
    const calculationMethod=method!=="auto"?`&method=${method}`:"";
    fetch(`/api/prayertimes?city=${encodeURIComponent(location.city)}&country=${encodeURIComponent(location.country)}${coordinates}${timezone}${calculationMethod}`,{signal:controller.signal})
      .then(r=>r.json()).then(j=>j.ok?setTimes(j.data):setError("لم يتم العثور على المدينة. اكتب اسمها بدقة، وأضف البلد إذا وُجدت مدن متشابهة."))
      .catch(err=>{if(err.name!=="AbortError")setError("تعذر الاتصال بخدمة المواقيت.");});
    return ()=>controller.abort();
  },[location,method]);
  const choose=(value)=>{
    const item=LOCATIONS.find(x=>x[0]===value);
    if(item)setLocation({label:item[0],city:item[1],country:item[2],latitude:item[3],longitude:item[4],timezone:item[5]});
  };
  const search=(e)=>{ e.preventDefault(); const city=draft.city.trim(); const country=draft.country.trim(); if(!city){setTimes(null);setError("اكتب اسم المدينة أولًا.");return;} setLocation({city,country,label:country?`${city}، ${country}`:city}); };
  const useMyLocation=()=>{
    if(!navigator.geolocation)return setError("تحديد الموقع غير مدعوم في هذا المتصفح.");
    setError("");
    navigator.geolocation.getCurrentPosition(
      ({coords})=>{
        const inFrance=coords.latitude>=41&&coords.latitude<=51.5&&coords.longitude>=-5.5&&coords.longitude<=9.8;
        const timezone=Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        setLocation({city:"Current location",country:inFrance?"France":"",label:inFrance?"موقعي الحالي — فرنسا":"موقعي الحالي",latitude:coords.latitude,longitude:coords.longitude,timezone});
      },
      ()=>setError("تعذر تحديد موقعك. اسمح للموقع بالوصول إلى موقع الهاتف ثم حاول مجددًا."),
      {enableHighAccuracy:true,timeout:10000,maximumAge:300000}
    );
  };
  return <section className="card prayer-times moroccan-frame">
    <div className="prayer-heading"><div><strong>أوقات الصلاة — {location.label}</strong><p className="muted">يمكنك الاختيار أو كتابة أي مدينة وبلد بالعربية.</p></div>
      <label>اختيار سريع<select className="input" value={LOCATIONS.some(x=>x[0]===location.label)?location.label:""} onChange={e=>choose(e.target.value)}><option value="">مدينة أخرى</option>{LOCATIONS.map(x=><option key={x[0]}>{x[0]}</option>)}</select></label>
    </div>
    <button type="button" className="btn btn-ghost btn-sm prayer-location-btn" onClick={useMyLocation}>استخدام موقعي الحالي</button>
    <form className="prayer-search" onSubmit={search}><input className="input" value={draft.city} onChange={e=>setDraft({...draft,city:e.target.value})} placeholder="المدينة، مثل: باريس" required /><input className="input" value={draft.country} onChange={e=>setDraft({...draft,country:e.target.value})} placeholder="البلد (اختياري)، مثل: فرنسا" /><button className="btn btn-primary btn-sm">تحديث المواقيت</button></form>
    <label className="prayer-method">طريقة حساب الفجر والعشاء<select className="input" value={method} onChange={e=>setMethod(e.target.value)}>{METHODS.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
    <p className="muted prayer-method-note">في فرنسا قد تختلف المواقيت بين المساجد. اختر الطريقة التي يعتمدها مسجدك إذا كان جدوله مختلفًا.</p>
    {!times&&!error&&<p className="muted">جارٍ جلب أوقات الصلاة…</p>}{error&&<p className="error-text">{error}</p>}
    {times&&<><p className="prayer-resolved">الموقع المعتمد: <strong>{times.location?.name || location.label}{times.location?.country?`، ${times.location.country}`:""}</strong>{times.location?.timezone?` — ${times.location.timezone}`:""}</p><p className="muted prayer-date">مواقيت {times.date?.readable || "اليوم"} — طريقة الحساب: {METHOD_LABELS[String(times.method)] || `رقم ${times.method}`}.</p><div className="prayer-grid">{Object.entries(PRAYERS).map(([key,label])=><div key={key} className="prayer-item"><div className="prayer-key">{label}</div><div className="prayer-val">{times.timings?.[key]}</div></div>)}</div></>}
  </section>;
}
