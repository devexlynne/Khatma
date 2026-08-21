import db from "./db.js";
import bcrypt from "bcryptjs";
import { sessionToken } from "./ids.js";

const COOKIE = "khatma_session";

function configuredAdminEmails() {
  return [process.env.ADMIN_EMAIL, process.env.ADMIN_EMAILS]
    .filter(Boolean)
    .flatMap((value) => value.split(","))
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isConfiguredAdminEmail(email) {
  return Boolean(email) && configuredAdminEmails().includes(email.toLowerCase().trim());
}

function applyConfiguredRole(user) {
  if (!user) return null;
  const plain = JSON.parse(JSON.stringify(user));
  if (isConfiguredAdminEmail(plain.email)) {
    plain.role = "admin";
    plain.approval_status = "approved";
  }
  return plain;
}

export function createUser(fullName, email, password) {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail);
  if (existing) return { ok: false, reason: "email_taken" };
  const hash = bcrypt.hashSync(password, 10);
  const role = isConfiguredAdminEmail(normalizedEmail) ? "admin" : "user";
  const approvalStatus = role === "admin" ? "approved" : "pending";
  const info = db
    .prepare("INSERT INTO users (full_name, email, password_hash, role, approval_status) VALUES (?, ?, ?, ?, ?)")
    .run(fullName.trim(), normalizedEmail, hash, role, approvalStatus);
  return { ok: true, userId: Number(info.lastInsertRowid), approvalStatus };
}

export function verifyUser(email, password) {
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim());
  if (!user) return { ok: false, reason: "invalid" };
  if (!bcrypt.compareSync(password, user.password_hash)) return { ok: false, reason: "invalid" };
  const plain = applyConfiguredRole(user);
  if (!isAdmin(plain) && plain.approval_status !== "approved") {
    return { ok: false, reason: plain.approval_status === "rejected" ? "rejected" : "pending_approval" };
  }
  return { ok: true, user: plain };
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
  const user = applyConfiguredRole(row);
  if (!user) return null;
  if (!isAdmin(user) && user.approval_status !== "approved") return null;
  return user;
}

export function isAdmin(user) {
  return Boolean(user && (user.role === "admin" || isConfiguredAdminEmail(user.email)));
}

export const COOKIE_NAME = COOKIE;
