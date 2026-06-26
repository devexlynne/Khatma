import db from "./db.js";

export function createDedication({ name, message, image_url, submitted_by }) {
  const stmt = db.prepare(
    `INSERT INTO dedications (name, message, image_url, submitted_by) VALUES (?, ?, ?, ?)`
  );
  const info = stmt.run(name || null, message, image_url || null, submitted_by || null);
  return { id: info.lastInsertRowid };
}

export function getApprovedDedications(limit = 100) {
  const stmt = db.prepare(
    `SELECT id, name, message, image_url, submitted_at, approved_at FROM dedications WHERE status = 'approved' ORDER BY approved_at DESC LIMIT ?`
  );
  return stmt.all(limit).map((r) => JSON.parse(JSON.stringify(r)));
}

export function getPendingDedications() {
  const stmt = db.prepare(
    `SELECT id, name, message, image_url, submitted_at, submitted_by FROM dedications WHERE status = 'pending' ORDER BY submitted_at ASC`
  );
  return stmt.all().map((r) => JSON.parse(JSON.stringify(r)));
}

export const approveDedication = db.transaction((id, approver_id) => {
  const now = new Date().toISOString();
  const stmt = db.prepare(
    `UPDATE dedications SET status = 'approved', approved_at = ?, approver_id = ? WHERE id = ? AND status = 'pending'`
  );
  const res = stmt.run(now, approver_id || null, id);
  return res.changes > 0;
});

export const rejectDedication = db.transaction((id, approver_id) => {
  const now = new Date().toISOString();
  const stmt = db.prepare(
    `UPDATE dedications SET status = 'rejected', approved_at = ? , approver_id = ? WHERE id = ? AND status = 'pending'`
  );
  const res = stmt.run(now, approver_id || null, id);
  return res.changes > 0;
});
