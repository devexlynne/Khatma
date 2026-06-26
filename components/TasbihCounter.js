"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";

const PRESET_DHIKRS = [
  { text: "سبحان الله", defaultGoal: 33 },
  { text: "الحمد لله", defaultGoal: 33 },
  { text: "الله أكبر", defaultGoal: 34 },
  { text: "لا إله إلا الله", defaultGoal: 100 },
  { text: "أستغفر الله", defaultGoal: 100 },
  { text: "اللهم صلِّ على سيدنا محمد", defaultGoal: 100 },
  { text: "لا حول ولا قوة إلا بالله", defaultGoal: 100 },
];

const PRESET_GOALS = [33, 100, 333, 500, 1000, 5000];

export default function TasbihCounter() {
  const notify = useToast();
  const [step, setStep] = useState("select"); // select, selectGoal, counting
  const [selectedDhikr, setSelectedDhikr] = useState(null);
  const [customDhikr, setCustomDhikr] = useState("");
  const [count, setCount] = useState(0);
  const [generalCount, setGeneralCount] = useState(0);
  const [goal, setGoal] = useState(33);
  const [completed, setCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const currentDhikr = selectedDhikr || customDhikr;
  const progress = goal > 0 ? (count / goal) * 100 : 0;
  const isCompleted = count >= goal && goal > 0;

  const playTone = (freq, duration = 90, type = "sine") => {
    if (typeof window === "undefined" || !window.AudioContext) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      oscillator.type = type;
      oscillator.frequency.value = freq;
      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 0.02);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration / 1000);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);
      oscillator.onended = () => {
        if (audioCtx.state !== "closed") audioCtx.close().catch(() => {});
      };
    } catch (e) {}
  };

  const triggerHaptic = (pattern) => {
    if (!vibrationEnabled || typeof navigator === "undefined" || !navigator.vibrate) return;
    navigator.vibrate(pattern);
  };

  const playClickSound = () => {
    if (!soundEnabled) return;
    playTone(420, 60, "square");
  };

  const playSuccessSound = () => {
    if (!soundEnabled) return;
    playTone(520, 90, "triangle");
    setTimeout(() => playTone(680, 120, "triangle"), 110);
  };

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tasbih_session");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setSelectedDhikr(data.selectedDhikr);
        setCustomDhikr(data.customDhikr);
        setCount(data.count);
        setGeneralCount(data.generalCount || 0);
        setGoal(data.goal);
        setStep(data.step);
        setCompleted(data.completed);
        setSoundEnabled(data.soundEnabled ?? true);
        setVibrationEnabled(data.vibrationEnabled ?? true);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "tasbih_session",
      JSON.stringify({
        selectedDhikr,
        customDhikr,
        count,
        generalCount,
        goal,
        step,
        completed,
        soundEnabled,
        vibrationEnabled,
      })
    );
  }, [selectedDhikr, customDhikr, count, generalCount, goal, step, completed, soundEnabled, vibrationEnabled]);

  useEffect(() => {
    if (isCompleted && !completed) {
      setCompleted(true);
      playSuccessSound();
      triggerHaptic([25, 25, 25]);
      notify("تم إتمام الذكر، تقبّل الله منك ✨", "success");
    } else if (!isCompleted && completed) {
      setCompleted(false);
    }
  }, [isCompleted, completed]);

  const handleSelectDhikr = (dhikr) => {
    setSelectedDhikr(dhikr.text);
    setCustomDhikr("");
    setGoal(dhikr.defaultGoal);
    setCount(0);
    setCompleted(false);
    setStep("selectGoal");
  };

  const handleCustomDhikr = () => {
    if (!customDhikr.trim()) {
      notify("الرجاء كتابة الذكر", "error");
      return;
    }
    setSelectedDhikr(null);
    setStep("selectGoal");
  };

  const handleSelectGoal = (selectedGoal) => {
    setGoal(selectedGoal);
    setCount(0);
    setCompleted(false);
    setStep("counting");
  };

  const handleTap = () => {
    if (count >= goal) return;

    const newCount = count + 1;
    setCount(newCount);
    setGeneralCount((prev) => prev + 1);
    playClickSound();
    triggerHaptic(12);
  };

  const handleReset = () => {
    setCount(0);
    setCompleted(false);
    notify("تم إعادة تعيين العداد");
  };

  const handleChangeDhikr = () => {
    setStep("select");
    setCount(0);
    setCompleted(false);
  };

  // Select Dhikr Step
  if (step === "select") {
    return (
      <div className="container page">
        <h1 className="section-title" style={{ marginBottom: 20 }}>مسبحتي</h1>
        <p className="muted" style={{ marginBottom: 16 }}>اختر ذكرًا من الأذكار المقترحة أو أضِف ذكرًا خاصًا</p>

        <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
          {PRESET_DHIKRS.map((dhikr) => (
            <button
              key={dhikr.text}
              className="card"
              onClick={() => handleSelectDhikr(dhikr)}
              style={{
                cursor: "pointer",
                padding: 16,
                textAlign: "center",
                border: "2px solid transparent",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => e.target.style.borderColor = "var(--green)"}
              onMouseLeave={(e) => e.target.style.borderColor = "transparent"}
            >
              <div style={{ fontSize: 18, fontWeight: "bold" }}>{dhikr.text}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>الهدف: {dhikr.defaultGoal} مرة</div>
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>ذكر خاص</label>
            <textarea
              className="input"
              value={customDhikr}
              onChange={(e) => setCustomDhikr(e.target.value)}
              placeholder="اكتب ذكرًا خاصًا..."
              rows={3}
            />
          </div>
          <button className="btn btn-primary btn-block" onClick={handleCustomDhikr}>
            متابعة بالذكر الخاص
          </button>
        </div>
      </div>
    );
  }

  // Select Goal Step
  if (step === "selectGoal") {
    return (
      <div className="container page">
        <h1 className="section-title" style={{ marginBottom: 12 }}>{currentDhikr}</h1>
        <p className="muted" style={{ marginBottom: 20 }}>اختر هدفًا</p>

        <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
          {PRESET_GOALS.map((g) => (
            <button
              key={g}
              className="card"
              onClick={() => handleSelectGoal(g)}
              style={{
                cursor: "pointer",
                padding: 16,
                textAlign: "center",
                border: "2px solid transparent",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => e.target.style.borderColor = "var(--green)"}
              onMouseLeave={(e) => e.target.style.borderColor = "transparent"}
            >
              <div style={{ fontSize: 20, fontWeight: "bold" }}>{g} مرة</div>
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div className="field">
            <label>هدف مخصص</label>
            <input
              className="input"
              type="number"
              min="1"
              value={goal}
              onChange={(e) => setGoal(Math.max(1, parseInt(e.target.value) || 1))}
              placeholder="أدخل الهدف"
            />
          </div>
          <button className="btn btn-primary btn-block" onClick={() => setStep("counting")}>
            ابدأ التسبيح
          </button>
        </div>
      </div>
    );
  }

  // Counting Step
  if (step === "counting") {
    return (
      <div className="container page">
        {isCompleted && !completed ? setCompleted(true) : null}

        {completed ? (
          <div className="card center" style={{ marginTop: 80, marginBottom: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤲</div>
            <h2 className="section-title" style={{ fontSize: 20, color: "var(--green-dark)" }}>
              أتممت الذكر
            </h2>
            <p style={{ color: "var(--muted)", marginBottom: 20 }}>تقبّل الله منك وجزاك خيرًا</p>
            <div className="row" style={{ gap: 10 }}>
              <button className="btn btn-primary btn-sm" onClick={handleReset}>
                إعادة التصفير
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handleChangeDhikr}>
                تغيير الذكر
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="counting-grid">
              <div className="digital-card">
                <div className="digital-card-head">
                  <div>
                    <p className="muted" style={{ marginBottom: 4 }}>الذكر الحالي</p>
                    <h3 style={{ margin: 0, fontSize: 20 }}>{currentDhikr}</h3>
                  </div>
                  <span className="goal-chip">هدف {goal.toLocaleString()}</span>
                </div>

                <div className="digital-shell">
                  <div className="digital-screen">
                    <div className="digital-display">{count.toLocaleString()}</div>
                  </div>
                  <div className="digital-meta">
                    <span>من</span>
                    <strong>{goal.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="digital-note">
                  العداد الرقمي يحسب كل ضغطة ويساعدك على الوصول لهدفك برشاقة.
                </div>
              </div>

              <div className="digital-summary card" style={{ padding: 22 }}>
                <p className="muted" style={{ marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  العداد العام
                </p>
                <div className="general-value">{generalCount.toLocaleString()}</div>
                <p className="muted" style={{ marginTop: 10, lineHeight: 1.7 }}>
                  هذا العدد يجمع كل التسبيحات التي ضغطت عليها خلال هذه الجلسة.
                </p>
                <div className="general-chips">
                  <span>أهداف أكبر تصل إلى 5000</span>
                  <span>مناسب للذكر الطويل</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 34 }}>
              <button
                onClick={handleTap}
                disabled={isCompleted}
                className="btn btn-primary btn-tap"
              >
                اضغط على العداد
              </button>
            </div>

            <div className="row" style={{ gap: 10, marginTop: 24, justifyContent: "center" }}>
              <button className="btn btn-ghost btn-sm" onClick={handleReset}>
                🔄 إعادة التصفير
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handleChangeDhikr}>
                ✏️ تغيير الذكر
              </button>
            </div>

            <div className="card" style={{ marginTop: 16, padding: 18 }}>
              <div style={{ display: "grid", gap: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  <span>تفعيل الصوت</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={vibrationEnabled}
                    onChange={(e) => setVibrationEnabled(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  <span>تفعيل الاهتزاز</span>
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
}
