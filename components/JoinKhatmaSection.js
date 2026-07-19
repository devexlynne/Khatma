"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinKhatmaSection() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const openKhatma = (event) => {
    event.preventDefault();
    const input = value.trim();
    if (!input) return setError("ألصق رابط الختمة أو اكتب رمزها أولاً.");
    let publicId = input;
    try {
      const url = new URL(input);
      const parts = url.pathname.split("/").filter(Boolean);
      const kIndex = parts.indexOf("k");
      publicId = kIndex >= 0 ? parts[kIndex + 1] : parts.at(-1);
    } catch {
      publicId = input.replace(/^\/?k\//, "").split(/[?#/]/)[0];
    }
    if (!publicId) return setError("رابط الختمة غير صحيح.");
    router.push(`/k/${encodeURIComponent(publicId)}`);
  };

  return (
    <section className="card join-khatma-card" aria-labelledby="join-khatma-title">
      <div className="join-khatma-icon" aria-hidden="true">٣٠</div>
      <div className="join-khatma-copy">
        <span className="join-khatma-kicker">المشاركة في ختمة</span>
        <h2 id="join-khatma-title">حجز جزء من القرآن الكريم</h2>
        <p>ألصق رابط الختمة الذي وصلك من منشئها لتظهر لك الأجزاء الثلاثون، ثم اختر جزءاً متاحاً واحجزه باسمك دون إنشاء حساب.</p>
      </div>
      <form className="join-khatma-form" onSubmit={openKhatma}>
        <label htmlFor="khatma-link">رابط الختمة أو رمزها</label>
        <div className="join-khatma-controls">
          <input id="khatma-link" className="input" value={value} onChange={(event)=>{setValue(event.target.value);setError("");}} placeholder="مثال: https://…/k/Ab12Cd34" inputMode="url" />
          <button className="btn btn-primary" type="submit">إظهار الأجزاء للحجز</button>
        </div>
        {error && <p className="error-text">{error}</p>}
      </form>
    </section>
  );
}
