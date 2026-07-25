"use client";

import { useEffect, useRef, useState } from "react";

const AUDIO_URLS = [
  "https://everyayah.com/data/Abdul_Basit_Murattal_64kbps/017024.mp3",
  "https://cdn.islamic.network/quran/audio/64/ar.abdulbasitmurattal/017024.mp3",
];

export default function EntrySplash() {
  const audioRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  const playAudio = async () => {
    if (playing) return;
    setNeedsInteraction(false);
    for (const src of AUDIO_URLS) {
      try {
        const audio = new Audio(src);
        audio.preload = "auto";
        audio.onended = () => {
          setPlaying(false);
          setVisible(false);
        };
        audio.onerror = () => setPlaying(false);
        await audio.play();
        audioRef.current = audio;
        setPlaying(true);
        return;
      } catch {
        // Try the next source. Browsers may also require a user gesture.
      }
    }
    setPlaying(false);
    setNeedsInteraction(true);
  };

  useEffect(() => {
    playAudio();
    return () => audioRef.current?.pause();
  }, []);

  const closeSplash = () => {
    audioRef.current?.pause();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="entry-splash" role="dialog" aria-modal="true" aria-label="افتتاحية نور الوالدين">
      <div className="entry-splash-backdrop" />
      <div className="entry-splash-card">
        <div className="entry-splash-top">
          <div className="entry-splash-brand">
            <img src="/noor-clean-192.png" alt="" aria-hidden="true" />
            <div>
              <div className="entry-splash-label">غرسٌ في الجنة، وبرٌّ للوالدين</div>
              <h1>نور الوالدين</h1>
            </div>
          </div>
          <button className="btn btn-ghost" type="button" onClick={closeSplash}>تجاوز</button>
        </div>
        <div className="entry-splash-grid">
          <div className="entry-splash-visual">
            <img src="/khatma.png" alt="الوالد والوالدة" className="entry-splash-image" />
            <p className="entry-splash-caption">آياتٌ تُتلى، وأجرٌ يُهدى</p>
          </div>
          <div className="entry-splash-content">
            <div className="entry-splash-quote">
              <p>﴿وَاخْفِضْ لَهُمَا جَنَاحَ الذُّلِّ مِنَ الرَّحْمَةِ وَقُلْ رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا﴾</p>
              <span>سورة الإسراء، الآية ٢٤ — بصوت الشيخ عبد الباسط عبد الصمد</span>
            </div>
            <div className="entry-splash-actions">
              <button className="btn btn-gold" type="button" onClick={playAudio} disabled={playing}>
                {playing ? "🔊 جارٍ تشغيل الآية…" : "🔊 تشغيل الآية"}
              </button>
              <button className="btn btn-primary" type="button" onClick={closeSplash}>فتح الصفحة الآن</button>
            </div>
            {needsInteraction && <p className="entry-audio-notice">يتطلب هاتفك نقرة واحدة لبدء الصوت. اضغط «تشغيل الآية»، وستفتح الصفحة تلقائيًا عند انتهاء التلاوة.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
