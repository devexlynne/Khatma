import crypto from "crypto";

// URL-safe random id, e.g. for public khatma links and completion tokens.
export function randomId(bytes = 9) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function sessionToken() {
  return crypto.randomBytes(32).toString("base64url");
}
