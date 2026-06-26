"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import { useSearchParams } from "next/navigation";
import { DUAS, getDailyDuaa } from "@/lib/dhikr-client";

const CATEGORIES = {
  deceased: { label: "أدعية للمتوفّى", emoji: "🌹" },
  quran_completion: { label: "أدعية ختم القرآن", emoji: "📖" },
  parents: { label: "أدعية للوالدين", emoji: "👨‍👩‍👧‍👦" },
  rizq: { label: "أدعية الرزق", emoji: "🤲" },
  morning_evening: { label: "أدعية الصباح والمساء", emoji: "☀️" },
  general: { label: "أدعية عامة", emoji: "✨" },
};

export default function DuaaLibrary() {
  const notify = useToast();
  const searchParams = useSearchParams();
  const urlCategory = searchParams?.get("category") || null;
  
  const [selectedCategory, setSelectedCategory] = useState(
    urlCategory && DUAS[urlCategory] ? urlCategory : "deceased"
  );
  const [dailyDuaa, setDailyDuaa] = useState(null);
  const [reminderDone, setReminderDone] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("duaa_favorites") || "[]");
      } catch {
        return [];
      }
    }
    return [];
  });

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    notify("تم نسخ الدعاء", "success");
  };

  const handleShare = (title, text) => {
    if (navigator.share) {
      navigator.share({ title, text }).catch(() => {});
    } else {
      handleCopy(text);
    }
  };

  const handleFavorite = (duaa) => {
    const id = `${selectedCategory}_${duaa.title}`;
    const isFavorited = favorites.some((f) => f.id === id);

    const newFavorites = isFavorited
      ? favorites.filter((f) => f.id !== id)
      : [...favorites, { id, category: selectedCategory, ...duaa }];

    setFavorites(newFavorites);
    localStorage.setItem("duaa_favorites", JSON.stringify(newFavorites));
    notify(isFavorited ? "تم حذف من المفضلة" : "تم إضافة إلى المفضلة");
  };

  const isFavorited = (duaa) => {
    const id = `${selectedCategory}_${duaa.title}`;
    return favorites.some((f) => f.id === id);
  };

  const currentDuas = DUAS[selectedCategory] || [];

  useEffect(() => {
    setDailyDuaa(getDailyDuaa());
    if (typeof window !== "undefined") {
      const today = new Date().toISOString().slice(0, 10);
      setReminderDone(localStorage.getItem("duaa_reminder_date") === today);
    }
  }, []);

  const markReminderDone = () => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("duaa_reminder_date", today);
    setReminderDone(true);
    notify("تم تسجيل تذكير اليوم");
  };

  return (
    <div className="container page">
      <h1 className="section-title" style={{ marginBottom: 20 }}>🤲 أدعية مختارة</h1>
      {dailyDuaa && (
        <div className="card" style={{ marginBottom: 20, background: "#fff8e5" }}>
          <strong style={{ display: "block", marginBottom: 10, fontSize: 16 }}>دعاء اليوم</strong>
          <p style={{ margin: "0 0 12px", lineHeight: 1.8, fontSize: 15 }}>{dailyDuaa.text}</p>
          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => handleCopy(dailyDuaa.text)}>📋 نسخ الدعاء</button>
            <button className="btn btn-ghost btn-sm" onClick={() => handleShare(dailyDuaa.title, dailyDuaa.text)}>🔗 مشاركة</button>
            {!reminderDone ? (
              <button className="btn btn-gold btn-sm" onClick={markReminderDone}>تم قراءته اليوم</button>
            ) : (
              <span className="muted" style={{ fontSize: 13 }}>تم تسجيل التذكير لليوم</span>
            )}
          </div>
        </div>
      )}

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="card" style={{ marginBottom: 20, background: "var(--gold-soft)" }}>
          <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 15 }}>⭐ أدعيتك المفضلة</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {favorites.slice(0, 3).map((fav) => (
              <div
                key={fav.id}
                style={{
                  fontSize: 13,
                  padding: 8,
                  background: "white",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
                onClick={() => setSelectedCategory(fav.category)}
              >
                {fav.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 10 }}>
        {Object.entries(CATEGORIES).map(([key, { label, emoji }]) => (
          <button
            key={key}
            className={`btn btn-sm ${selectedCategory === key ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setSelectedCategory(key)}
            style={{ whiteSpace: "nowrap", flex: "0 0 auto" }}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Duas List */}
      <div style={{ display: "grid", gap: 12 }}>
        {currentDuas.map((duaa, idx) => {
          const favId = `${selectedCategory}_${duaa.title}`;
          const isFav = favorites.some((f) => f.id === favId);
          return (
            <div key={idx} className="card">
              <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 15, color: "var(--green-dark)" }}>
                {duaa.title}
              </h3>
              <p style={{ margin: "0 0 14px", lineHeight: 1.8, fontSize: 14, color: "var(--ink)" }}>
                {duaa.text}
              </p>
              <div className="row" style={{ gap: 6 }}>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => handleCopy(duaa.text)}
                  title="نسخ"
                >
                  📋 نسخ
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => handleShare(duaa.title, duaa.text)}
                  title="مشاركة"
                >
                  🔗 مشاركة
                </button>
                <button
                  className={`btn btn-sm ${isFav ? "btn-gold" : "btn-ghost"}`}
                  onClick={() => handleFavorite(duaa)}
                  title={isFav ? "حذف من المفضلة" : "إضافة إلى المفضلة"}
                >
                  {isFav ? "⭐" : "☆"} مفضلة
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card center" style={{ marginTop: 20, padding: "14px", fontSize: 13, color: "var(--muted)" }}>
        <p style={{ margin: 0 }}>🤲 اللهم تقبل منك الدعاء والعمل</p>
      </div>
    </div>
  );
}
