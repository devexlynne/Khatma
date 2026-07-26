"use client";

export default function BackButton() {
  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  }

  return (
    <button type="button" className="nav-back-btn" onClick={goBack} aria-label="العودة للصفحة السابقة">
      رجوع
    </button>
  );
}
