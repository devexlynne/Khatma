"use client";

import { useEffect, useState } from "react";

const LOCATIONS = [
  { label: "بيروت، لبنان", city: "Beirut", country: "Lebanon" },
  { label: "طرابلس، لبنان", city: "Tripoli", country: "Lebanon" },
  { label: "الرياض، السعودية", city: "Riyadh", country: "Saudi Arabia" },
  { label: "القاهرة، مصر", city: "Cairo", country: "Egypt" },
  { label: "الرباط، المغرب", city: "Rabat", country: "Morocco" },
  { label: "عمّان، الأردن", city: "Amman", country: "Jordan" },
];
const PRAYERS = { Fajr: "الفجر", Sunrise: "الشروق", Dhuhr: "الظهر", Asr: "العصر", Maghrib: "المغرب", Isha: "العشاء" };

export default function PrayerTimes() {
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [times, setTimes] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setTimes(null); setError("");
    fetch(`/api/prayertimes?city=${encodeURIComponent(location.city)}&country=${encodeURIComponent(location.country)}&method=2`)
      .then((r) => r.json()).then((j) => j.ok ? setTimes(j.data) : setError("تعذر جلب المواقيت"))
      .catch(() => setError("تعذر الاتصال بخدمة المواقيت"));
  }, [location]);

  return (
    <section className="card prayer-times moroccan-frame">
      <div className="prayer-heading">
        <strong>أوقات الصلاة</strong>
        <label>اختر البلد والمدينة
          <select className="input" value={location.label} onChange={(e) => setLocation(LOCATIONS.find((x) => x.label === e.target.value))}>
            {LOCATIONS.map((x) => <option key={x.label}>{x.label}</option>)}
          </select>
        </label>
      </div>
      {!times && !error && <p className="muted">جارٍ جلب أوقات الصلاة…</p>}
      {error && <p className="error-text">{error}</p>}
      {times && <div className="prayer-grid">{Object.entries(PRAYERS).map(([key, label]) => (
        <div key={key} className="prayer-item"><div className="prayer-key">{label}</div><div className="prayer-val">{times.timings?.[key]}</div></div>
      ))}</div>}
    </section>
  );
}
