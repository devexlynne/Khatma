import fs from "fs";
import path from "path";

const CACHE_PATH = process.env.KHATMA_PRAYERS_CACHE || path.join(process.cwd(), "data", "prayertimes_cache.json");
const TTL_MS = 10 * 60 * 1000; // 10 minutes

const COUNTRY_METHODS = new Map([
  ["sa", 4],
  ["saudi arabia", 4], ["السعودية", 4], ["المملكة العربية السعودية", 4],
  ["eg", 5],
  ["egypt", 5], ["مصر", 5],
  ["ma", 21],
  ["morocco", 21], ["المغرب", 21],
  ["jo", 23],
  ["jordan", 23], ["الأردن", 23], ["الاردن", 23],
  ["kw", 9],
  ["kuwait", 9], ["الكويت", 9],
  ["qa", 10],
  ["qatar", 10], ["قطر", 10],
  ["ae", 8],
  ["uae", 8], ["united arab emirates", 8], ["الإمارات", 8], ["الامارات", 8],
  ["tr", 13],
  ["turkey", 13], ["تركيا", 13],
  ["tn", 18],
  ["tunisia", 18], ["تونس", 18],
  ["dz", 19],
  ["algeria", 19], ["الجزائر", 19],
  ["fr", 12],
  ["france", 12], ["فرنسا", 12],
  ["lb", 3],
  ["lebanon", 3], ["لبنان", 3],
  ["pt", 22], ["portugal", 22], ["البرتغال", 22],
  ["sg", 11], ["singapore", 11], ["سنغافورة", 11],
  ["my", 17], ["malaysia", 17], ["ماليزيا", 17],
  ["id", 20], ["indonesia", 20], ["إندونيسيا", 20], ["اندونيسيا", 20],
  ["pk", 1], ["pakistan", 1], ["باكستان", 1],
  ["bd", 1], ["bangladesh", 1], ["بنغلاديش", 1],
  ["in", 1], ["india", 1], ["الهند", 1],
  ["ru", 14], ["russia", 14], ["روسيا", 14],
]);

function methodForCountry(country) {
  return COUNTRY_METHODS.get(String(country || "").trim().toLowerCase()) || 3;
}

function localDate(timeZone) {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timeZone || "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${values.year}-${values.month}-${values.day}`;
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

async function fetchJson(url) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { "User-Agent": "khatma/1" } });
      if (!response.ok) throw new Error(`request_failed_${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("request_failed");
}

async function resolveLocation(city, country) {
  const name = String(city || "").trim();
  const requestedCountry = String(country || "").trim();
  if (!name) throw new Error("location_required");
  const countryCode = COUNTRY_CODES.get(requestedCountry.toLowerCase());
  const language = /[\u0600-\u06ff]/.test(`${name} ${requestedCountry}`) ? "ar" : "en";
  const params = new URLSearchParams({ name, count: "10", language, format: "json" });
  if (countryCode) params.set("countryCode", countryCode);
  const json = await fetchJson(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
  const results = Array.isArray(json?.results) ? json.results : [];
  const normalizedCountry = requestedCountry.toLocaleLowerCase(language);
  const result = results.find(item =>
    String(item.country_code || "").toLowerCase() === String(countryCode || "").toLowerCase() ||
    String(item.country || "").trim().toLocaleLowerCase(language) === normalizedCountry
  ) || results[0];
  if (!result || !Number.isFinite(result.latitude) || !Number.isFinite(result.longitude)) {
    throw new Error("location_not_found");
  }
  return {
    name: result.name,
    country: result.country || requestedCountry,
    countryCode: String(result.country_code || "").toLowerCase(),
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone || "UTC",
  };
}

const COUNTRY_CODES = new Map([
  ["france", "FR"], ["فرنسا", "FR"], ["lebanon", "LB"], ["لبنان", "LB"],
  ["saudi arabia", "SA"], ["السعودية", "SA"], ["مصر", "EG"], ["egypt", "EG"],
  ["morocco", "MA"], ["المغرب", "MA"], ["jordan", "JO"], ["الأردن", "JO"], ["الاردن", "JO"],
  ["turkey", "TR"], ["تركيا", "TR"], ["algeria", "DZ"], ["الجزائر", "DZ"],
  ["tunisia", "TN"], ["تونس", "TN"], ["united arab emirates", "AE"], ["الإمارات", "AE"],
  ["qatar", "QA"], ["قطر", "QA"], ["kuwait", "KW"], ["الكويت", "KW"],
  ["portugal", "PT"], ["البرتغال", "PT"], ["malaysia", "MY"], ["ماليزيا", "MY"],
  ["indonesia", "ID"], ["إندونيسيا", "ID"], ["pakistan", "PK"], ["باكستان", "PK"],
  ["india", "IN"], ["الهند", "IN"], ["bangladesh", "BD"], ["بنغلاديش", "BD"],
  ["russia", "RU"], ["روسيا", "RU"], ["singapore", "SG"], ["سنغافورة", "SG"],
]);

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

export async function getPrayerTimes({ city = "Beirut", country = "Lebanon", method, date, latitude, longitude, timezone } = {}) {
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
  const resolved = hasCoordinates ? {
    name: String(city || "موقعي الحالي"),
    country: String(country || ""),
    countryCode: "",
    latitude,
    longitude,
    timezone: String(timezone || "UTC"),
  } : await resolveLocation(city, country);
  const selectedMethod = Number.isFinite(method) ? method : methodForCountry(resolved.countryCode || country || resolved.country);
  const dateKey = date || localDate(resolved.timezone);
  const placeKey = `${resolved.latitude.toFixed(4)},${resolved.longitude.toFixed(4)}`;
  const cacheKey = `${placeKey}|${dateKey}|m${selectedMethod}`;
  const cache = readCache();
  const entry = cache[cacheKey];
  const now = Date.now();
  if (entry && entry.fetched_at && now - entry.fetched_at < TTL_MS) {
    return entry.data;
  }

  const datePath = apiDate(dateKey);
  const locationQuery = `latitude=${resolved.latitude}&longitude=${resolved.longitude}`;
  const url = `https://api.aladhan.com/v1/timings${datePath ? `/${datePath}` : ""}?${locationQuery}&method=${selectedMethod}&school=0`;
  try {
    const json = await fetchJson(url);
    if (json && json.data) {
      const obj = {
        timings: json.data.timings,
        date: json.data.date,
        meta: json.data.meta,
        method: selectedMethod,
        location: {
          name: resolved.name,
          country: resolved.country,
          latitude: resolved.latitude,
          longitude: resolved.longitude,
          timezone: json.data.meta?.timezone || resolved.timezone,
        },
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
