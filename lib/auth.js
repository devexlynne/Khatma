import db from "./db.js";
import bcrypt from "bcryptjs";
import { sessionToken } from "./ids.js";

const COOKIE = "khatma_session";

export function createUser(fullName, email, password) {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
  if (existing) return { ok: false, reason: "email_taken" };
  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare("INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)")
    .run(fullName.trim(), email.toLowerCase().trim(), hash);
  return { ok: true, userId: Number(info.lastInsertRowid) };
}

export function verifyUser(email, password) {
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim());
  if (!user) return null;
  if (!bcrypt.compareSync(password, user.password_hash)) return null;
  return user;
}

export function startSession(userId) {
  const token = sessionToken();
  db.prepare("INSERT INTO sessions (token, user_id) VALUES (?, ?)").run(token, userId);
  return token;
}

export function endSession(token) {
  if (token) db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function userFromToken(token) {
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?`
    )
    .get(token);
  return row ? JSON.parse(JSON.stringify(row)) : null;
}

export function isAdmin(user) {
  return user && user.role === "admin";
}

export const COOKIE_NAME = COOKIE;
