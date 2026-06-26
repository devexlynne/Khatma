"use client";

import { useEffect, useState } from "react";

export default function PrayerTimes({ city = "Beirut", country = "Lebanon", method = 2 }) {
  const [times, setTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTimes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/prayertimes?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`);
      const json = await res.json();
      if (json.ok) {
        setTimes(json.data);
        setError(null);
      } else {
        setError(json.reason || "error");
      }
    } catch (err) {
      setError(err.message || "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimes();
    const id = setInterval(fetchTimes, 5 * 60 * 1000); // refresh every 5 minutes
    return () => clearInterval(id);
  }, [city, country, method]);

  if (loading) return <div className="card muted">جاري جلب أوقات الصلاة...</div>;
  if (error) return <div className="card muted">خطأ: {error}</div>;
  if (!times) return null;

  const t = times.timings || {};
  return (
    <div className="card prayer-times">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>أوقات الصلاة — {city}, {country}</strong>
        <small className="muted">طريقة الحساب: {times.meta?.method?.name || method}</small>
      </div>
      <div className="prayer-grid">
        {Object.entries(t).map(([k, v]) => (
          <div key={k} className="prayer-item">
            <div className="prayer-key">{k}</div>
            <div className="prayer-val">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
