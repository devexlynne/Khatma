"use client";
import { useEffect, useState } from "react";

// Calculate Qibla direction from user's location
// Returns bearing in degrees (0 = North, 90 = East, 180 = South, 270 = West)
function calculateQibla(lat, lon) {
  // Kaaba location: 21.4225° N, 39.8262° E
  const kaabaLat = 21.4225;
  const kaabaLon = 39.8262;

  const dLon = (kaabaLon - lon) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(kaabaLat * Math.PI / 180);
  const x = Math.cos(lat * Math.PI / 180) * Math.sin(kaabaLat * Math.PI / 180) -
    Math.sin(lat * Math.PI / 180) * Math.cos(kaabaLat * Math.PI / 180) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  bearing = (bearing + 360) % 360; // Normalize to 0-360
  return bearing;
}

export default function QiblaCompass() {
  const [qibla, setQibla] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(null);
  const [error, setError] = useState(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    // Get user's location
    if (!navigator.geolocation) {
      setError("الموقع الجغرافي غير متاح");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const qiblaDir = calculateQibla(
          position.coords.latitude,
          position.coords.longitude
        );
        setQibla(qiblaDir);
      },
      () => {
        setError("تعذّر الحصول على الموقع");
      }
    );

    // Try to get device orientation for compass
    if (typeof DeviceOrientationEvent !== "undefined") {
      const handleOrientation = (event) => {
        setDeviceHeading(event.alpha); // Alpha is the compass heading
      };

      window.addEventListener("deviceorientation", handleOrientation);
      return () => window.removeEventListener("deviceorientation", handleOrientation);
    }
  }, []);

  if (!qibla) return null;

  const rotation = deviceHeading !== null ? deviceHeading : 0;
  const qiblaAngle = qibla - rotation;

  return (
    <div className="card qibla-card" style={{ marginBottom: 16 }}>
      <div style={{ textAlign: "center" }}>
        <h3 style={{ marginTop: 0, marginBottom: 12, fontSize: 16, fontWeight: 500 }}>
          🧭 اتجاه القبلة
        </h3>
        
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: "50%",
            border: "3px solid #8b5a3c",
            margin: "0 auto 12px",
            position: "relative",
            background: "radial-gradient(circle, #f5f0e8 0%, #e8dcc8 100%)",
            overflow: "hidden",
          }}
        >
          {/* Compass circle with cardinal directions */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* North indicator */}
            <div style={{ position: "absolute", top: 8, fontSize: 18, fontWeight: "bold", color: "#c41e3a" }}>
              ⬆ ش
            </div>
            {/* Qibla needle */}
            <div
              style={{
                position: "absolute",
                width: 3,
                height: 60,
                background: "#c41e3a",
                transform: `rotate(${qiblaAngle}deg)`,
                transformOrigin: "bottom",
                transition: "transform 0.3s ease-out",
              }}
            />
            {/* Center dot */}
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#c41e3a" }} />
          </div>
        </div>

        <div style={{ fontSize: 13, color: "#666" }}>
          الاتجاه: <strong>{Math.round(qibla)}°</strong>
        </div>
        {error && <div style={{ fontSize: 12, color: "#d9534f", marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  );
}
