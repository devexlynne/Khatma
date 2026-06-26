"use client";

import { useRef, useState, useEffect } from "react";

// Multiple reliable Quran audio sources (17:24 - Surah Al-Isra, Ayah 24)
// Using direct MP3 URLs from established Islamic audio services
const AUDIO_URLS = [
  "https://everyayah.com/data/Alafasy_64kbps/017024.mp3", // Mishari Al-Afasy - everyayah.com
  "https://cdn.islamic.network/quran/audio/64/ar.alafasy/017024.mp3", // Islamic.Network CDN
  "https://www.quranmp3.com/audio/quran-in-arabic-mp3-by-mishari-alafasy/surah-17-al-isra-ayah-24-mishari-alafasy.mp3", // QuranMP3
];

export default function EntrySplash() {
  const [visible, setVisible] = useState(true);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const autoplayAttemptedRef = useRef(false);

  const playAudio = async () => {
    if (playing) return; // Prevent multiple simultaneous attempts
    
    try {
      setPlaying(true);

      for (const url of AUDIO_URLS) {
        try {
          // Set a timeout for each fetch attempt
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          
          const response = await fetch(url, { 
            mode: 'cors',
            signal: controller.signal,
            headers: {
              'Accept': 'audio/*'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            console.debug(`[Audio] HTTP ${response.status} from ${url}`);
            continue;
          }

          const blob = await response.blob();
          if (blob.size === 0) {
            console.debug(`[Audio] Empty blob from ${url}`);
            continue;
          }
          
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio();
          audio.src = audioUrl;
          
          audio.onended = () => {
            console.log('[Audio] Playback finished');
            setVisible(false);
            setPlaying(false);
            URL.revokeObjectURL(audioUrl);
          };
          
          audio.onerror = (e) => {
            console.debug('[Audio] Play error:', e);
            setPlaying(false);
          };

          console.log('[Audio] Playing from:', url);
          await audio.play();
          audioRef.current = audio;
          return; // Success
        } catch (err) {
          console.debug(`[Audio] Failed to load ${url}:`, err.message);
          continue;
        }
      }
      
      // All sources failed - reset the playing state immediately
      console.log('[Audio] All sources failed, resetting button state');
      setPlaying(false);
      setTimeout(() => setVisible(false), 2500);
    } catch (err) {
      console.error("[Audio] Unexpected error:", err);
      setPlaying(false);
      setTimeout(() => setVisible(false), 2500);
    }
  };

  // Auto-play audio on component mount and set auto-close timer
  useEffect(() => {
    if (!autoplayAttemptedRef.current) {
      autoplayAttemptedRef.current = true;
      // Attempt to play audio
      playAudio();
    }
    
    // Auto-close splash after 6 seconds regardless of audio status
    // This prevents users from being stuck on the splash screen
    const autoCloseTimer = setTimeout(() => {
      console.log('[Splash] Auto-closing after timeout');
      setVisible(false);
    }, 6000);
    
    return () => clearTimeout(autoCloseTimer);
  }, []);

  const closeSplash = () => {
    setVisible(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  if (!visible) return null;

  return (
    <div className="entry-splash">
      <div className="entry-splash-backdrop" />
      <div className="entry-splash-card">
        <div className="entry-splash-top">
          <div>
            <div className="entry-splash-label">نستهل الصفحة بذكر البرّ</div>
            <h1>والدينا في ضيافة الذكر والتقدير</h1>
          </div>
          <button className="btn btn-ghost" type="button" onClick={closeSplash}>
            تجاوز
          </button>
        </div>

        <div className="entry-splash-grid">
          <div className="entry-splash-visual">
            <img
              src="/khatma.png"
              alt="الوالد والوالدة"
              className="entry-splash-image"
              loading="eager"
            />
            <p className="entry-splash-caption">الذكرى والمحبة تجمعنا في أول صفحة.</p>
          </div>

          <div className="entry-splash-content">
            <div className="entry-splash-quote">
              <p>
                <strong>وَاخْفِضْ لَهُمَا جَنَاحَ الذُّلِّ مِنَ الرَّحْمَةِ وَقُل رَّبِّ
                ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا</strong>
              </p>
              <span>الآية بصوت الشيخ عبد الباسط عبد الصمد</span>
            </div>

            <div className="entry-splash-actions">
              <button 
                className="btn btn-gold" 
                type="button" 
                onClick={playAudio}
                disabled={playing}
                title="اضغط لتشغيل تلاوة الآية الكريمة"
              >
                {playing ? "جاري التشغيل..." : "🔊 شغّل الآية"}
              </button>
              <button className="btn btn-primary" type="button" onClick={closeSplash}>
                افتح الصفحة
              </button>
            </div>
            
            <div className="muted" style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5 }}>
              💡 <em>الآية بصوت الشيخ عبد الباسط عبد الصمد (جودة 64 كيلوبت/ث)</em>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
