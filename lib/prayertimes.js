import fs from "fs";
import path from "path";

const CACHE_PATH = process.env.KHATMA_PRAYERS_CACHE || path.join(process.cwd(), "data", "prayertimes_cache.json");
const TTL_MS = 10 * 60 * 1000; // 10 minutes

const COUNTRY_METHODS = new Map([
  ["saudi arabia", 4], ["السعودية", 4], ["المملكة العربية السعودية", 4],
  ["egypt", 5], ["مصر", 5],
  ["morocco", 21], ["المغرب", 21],
  ["jordan", 23], ["الأردن", 23], ["الاردن", 23],
  ["kuwait", 9], ["الكويت", 9],
  ["qatar", 10], ["قطر", 10],
  ["uae", 8], ["united arab emirates", 8], ["الإمارات", 8], ["الامارات", 8],
  ["turkey", 13], ["تركيا", 13],
  ["tunisia", 18], ["تونس", 18],
  ["algeria", 19], ["الجزائر", 19],
  ["france", 12], ["فرنسا", 12],
  ["lebanon", 3], ["لبنان", 3],
]);

function methodForCountry(country) {
  return COUNTRY_METHODS.get(String(country || "").trim().toLowerCase()) || 3;
}

function apiDate(date) {
  const match = String(date || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
}

function readCache() {
  try {
    if (!fs.existsSync(CACHE_PATH)) return {};
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    return {};
  }
}

function writeCache(cache) {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf8");
  } catch (e) {
    // ignore
  }
}

export async function getPrayerTimes({ city = "Beirut", country = "Lebanon", method, date, latitude, longitude } = {}) {
  const selectedMethod = Number.isFinite(method) ? method : methodForCountry(country);
  const dateKey = date || new Date().toISOString().slice(0, 10);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const placeKey = hasCoordinates ? `${latitude.toFixed(4)},${longitude.toFixed(4)}` : `${city}|${country}`;
  const cacheKey = `${placeKey}|${dateKey}|m${selectedMethod}`;
  const cache = readCache();
  const entry = cache[cacheKey];
  const now = Date.now();
  if (entry && entry.fetched_at && now - entry.fetched_at < TTL_MS) {
    return entry.data;
  }

  const datePath = apiDate(dateKey);
  const endpoint = hasCoordinates ? "timings" : "timingsByCity";
  const locationQuery = hasCoordinates
    ? `latitude=${latitude}&longitude=${longitude}`
    : `city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`;
  const url = `https://api.aladhan.com/v1/${endpoint}${datePath ? `/${datePath}` : ""}?${locationQuery}&method=${selectedMethod}&school=0`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "khatma/1" } });
    if (!res.ok) throw new Error("fetch_failed");
    const json = await res.json();
    if (json && json.data) {
      const obj = {
        timings: json.data.timings,
        date: json.data.date,
        meta: json.data.meta,
        method: selectedMethod,
      };
      cache[cacheKey] = { fetched_at: now, data: obj };
      writeCache(cache);
      return obj;
    }
  } catch (err) {
    // fallback to cache if available
    if (entry && entry.data) return entry.data;
    throw err;
  }
}
