import { promises as dns } from "node:dns";

const BLOCKED_DOMAINS = new Set([
  "example.com",
  "example.net",
  "example.org",
  "example.test",
  "test.com",
  "fake.com",
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "guerrillamail.com",
  "yopmail.com",
  "dispostable.com",
]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export async function validateRealEmailAddress(email) {
  const normalized = normalizeEmail(email);
  if (!EMAIL_PATTERN.test(normalized)) {
    return { ok: false, reason: "invalid_format" };
  }

  const domain = normalized.split("@").pop();
  if (!domain || BLOCKED_DOMAINS.has(domain) || domain.endsWith(".test") || domain.endsWith(".invalid")) {
    return { ok: false, reason: "blocked_domain" };
  }

  try {
    const mx = await dns.resolveMx(domain);
    if (!mx.some((record) => record.exchange)) return { ok: false, reason: "no_mx" };
  } catch {
    return { ok: false, reason: "no_mx" };
  }

  return { ok: true, email: normalized };
}
