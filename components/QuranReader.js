"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function QuranReader({ verses = [], initialFont = 26, audioUrls = [] }) {
  const [fontSize, setFontSize] = useState(initialFont);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [selectedAya, setSelectedAya] = useState(verses[0]?.aya ?? null);
  const audioRef = useRef(null);
  const trackIndexRef = useRef(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("quranFontSize");
      if (saved) setFontSize(Number(saved));
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("quranFontSize", String(fontSize));
    } catch (e) {}
  }, [fontSize]);

  useEffect(() => {
    setSelectedAya(verses[0]?.aya ?? null);
    setCurrentTrack(0);
    trackIndexRef.current = 0;
  }, [verses]);

  const selectedIndex = useMemo(() => {
    return Math.max(0, verses.findIndex((verse) => verse.aya === selectedAya));
  }, [selectedAya, verses]);

  const activeAya = isPlaying ? verses[currentTrack]?.aya : selectedAya;

  const playAudio = async (startIndex = selectedIndex) => {
    const audio = audioRef.current;
    if (!audio || !audioUrls || audioUrls.length === 0) return;

    const safeIndex = Math.min(Math.max(startIndex, 0), audioUrls.length - 1);
    trackIndexRef.current = safeIndex;
    setCurrentTrack(safeIndex);
    setSelectedAya(verses[safeIndex]?.aya ?? null);
    audio.src = audioUrls[safeIndex];

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
      setIsPlaying(false);
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const handleAudioEnded = async () => {
    if (!audioUrls || audioUrls.length === 0) {
      setIsPlaying(false);
      return;
    }

    const nextIndex = trackIndexRef.current + 1;
    if (nextIndex >= audioUrls.length) {
      setIsPlaying(false);
      trackIndexRef.current = 0;
      setCurrentTrack(0);
      return;
    }

    trackIndexRef.current = nextIndex;
    setCurrentTrack(nextIndex);
    setSelectedAya(verses[nextIndex]?.aya ?? null);
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = audioUrls[nextIndex];
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
      setIsPlaying(false);
    }
  };

  const increase = () => setFontSize((s) => Math.min(42, s + 2));
  const decrease = () => setFontSize((s) => Math.max(18, s - 2));
  const reset = () => setFontSize(initialFont);

  return (
    <div className="mushaf-reader">
      <style>{`
        .mushaf-reader {
          direction: rtl;
        }

        .mushaf-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 14px;
          padding: 10px;
          border-radius: 8px;
          background: #4f8a32;
          color: #fff;
          box-shadow: 0 8px 22px rgba(57, 102, 34, 0.2);
        }

        .mushaf-toolbar-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .mushaf-btn {
          min-width: 42px;
          height: 38px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.14);
          color: #fff;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .mushaf-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.24);
          transform: translateY(-1px);
        }

        .mushaf-btn:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        .mushaf-page {
          position: relative;
          min-height: 560px;
          padding: 34px 34px 42px;
          border-radius: 8px;
          background:
            linear-gradient(90deg, rgba(110, 84, 45, 0.08), transparent 6%, transparent 94%, rgba(110, 84, 45, 0.08)),
            #fff4d8;
          border: 8px solid #4f8a32;
          box-shadow:
            inset 0 0 0 2px rgba(219, 173, 83, 0.65),
            inset 0 0 0 9px rgba(255, 251, 232, 0.85),
            0 18px 45px rgba(54, 73, 38, 0.18);
          overflow: hidden;
        }

        .mushaf-page::before,
        .mushaf-page::after {
          content: "";
          position: absolute;
          left: 18px;
          right: 18px;
          height: 5px;
          border-radius: 99px;
          background: linear-gradient(90deg, transparent, #d7a94d 18%, #4f8a32 50%, #d7a94d 82%, transparent);
          opacity: 0.75;
        }

        .mushaf-page::before { top: 16px; }
        .mushaf-page::after { bottom: 16px; }

        .mushaf-text {
          position: relative;
          z-index: 1;
          color: #2f2619;
          font-family: "Amiri", "Scheherazade New", "Noto Naskh Arabic", "Traditional Arabic", serif;
          line-height: 2.2;
          text-align: justify;
          text-align-last: center;
          font-weight: 600;
        }

        .mushaf-surah-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 18px auto 16px;
          color: #315f22;
          font-family: "Tajawal", "Segoe UI", sans-serif;
          font-size: 18px;
          font-weight: 900;
          text-align: center;
        }

        .mushaf-surah-title::before,
        .mushaf-surah-title::after {
          content: "";
          width: min(120px, 22vw);
          height: 2px;
          background: linear-gradient(90deg, transparent, #d2a64b, transparent);
        }

        .mushaf-ayah {
          display: inline;
          padding: 2px 5px 5px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
        }

        .mushaf-ayah:hover,
        .mushaf-ayah:focus-visible {
          outline: none;
          background: rgba(79, 138, 50, 0.12);
        }

        .mushaf-ayah.is-active {
          background: rgba(245, 201, 83, 0.42);
          color: #1f4316;
          box-shadow: 0 0 0 1px rgba(153, 113, 30, 0.18);
        }

        .mushaf-marker {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.8em;
          height: 1.8em;
          margin: 0 0.18em;
          color: #7a5b1b;
          border: 1px solid rgba(122, 91, 27, 0.38);
          border-radius: 50%;
          font-family: "Tajawal", "Segoe UI", sans-serif;
          font-size: 0.48em;
          font-weight: 900;
          vertical-align: 0.22em;
          background: rgba(255, 248, 220, 0.72);
        }

        .mushaf-status {
          margin-top: 12px;
          text-align: center;
          color: var(--muted);
          font-size: 13px;
          font-weight: 700;
        }

        @media (max-width: 620px) {
          .mushaf-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .mushaf-toolbar-group {
            justify-content: center;
          }

          .mushaf-page {
            min-height: 520px;
            padding: 28px 18px 34px;
            border-width: 6px;
          }

          .mushaf-text {
            line-height: 2.05;
          }
        }
      `}</style>

      <div className="mushaf-toolbar" aria-label="Quran reader controls">
        <div className="mushaf-toolbar-group">
          <button className="mushaf-btn" onClick={decrease} aria-label="تقليل حجم الخط">A-</button>
          <button className="mushaf-btn" onClick={reset} aria-label="إعادة حجم الخط">إعادة</button>
          <button className="mushaf-btn" onClick={increase} aria-label="تكبير حجم الخط">A+</button>
        </div>

        <div className="mushaf-toolbar-group">
          {audioUrls?.length > 0 ? (
            <>
              <button className="mushaf-btn" onClick={() => playAudio(selectedIndex)} disabled={isPlaying}>
                تشغيل
              </button>
              <button className="mushaf-btn" onClick={stopPlayback} disabled={!isPlaying}>
                إيقاف
              </button>
            </>
          ) : null}
        </div>
      </div>

      <audio ref={audioRef} hidden onEnded={handleAudioEnded} />

      <div className="mushaf-page">
        <div className="mushaf-text" style={{ fontSize: `${fontSize}px` }}>
          {verses.map((verse, index) => {
            const startsSurah = index === 0 || verse.surahNumber !== verses[index - 1]?.surahNumber;
            const isActive = verse.aya === activeAya;

            return (
              <span key={verse.aya}>
                {startsSurah ? (
                  <span className="mushaf-surah-title">{verse.surahName}</span>
                ) : " "}
                <span
                  className={`mushaf-ayah${isActive ? " is-active" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  onClick={() => setSelectedAya(verse.aya)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedAya(verse.aya);
                    }
                  }}
                >
                  {verse.text?.replace(/^\uFEFF/, "")}
                  <span className="mushaf-marker" aria-label={`الآية ${verse.numberInSurah}`}>
                    {verse.numberInSurah}
                  </span>
                </span>
              </span>
            );
          })}
        </div>
      </div>

      <div className="mushaf-status">
        {activeAya ? `الآية المحددة ${verses.find((verse) => verse.aya === activeAya)?.numberInSurah ?? ""}` : "اختر آية"}
      </div>
    </div>
  );
}
