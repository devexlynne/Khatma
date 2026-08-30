import { getDatabase } from "./db.js";

export function createDedication({ name, message, image_url, submitted_by }) {
  const db = getDatabase();
  const stmt = db.prepare(
    `INSERT INTO dedications (name, message, image_url, submitted_by) VALUES (?, ?, ?, ?)`
  );
  const info = stmt.run(name || null, message, image_url || null, submitted_by || null);
  return { id: info.lastInsertRowid };
}

export function getApprovedDedications(limit = 100) {
  const db = getDatabase();
  const stmt = db.prepare(
    `SELECT id, name, message, image_url, submitted_at, approved_at FROM dedications WHERE status = 'approved' ORDER BY approved_at DESC LIMIT ?`
  );
  return stmt.all(limit).map((r) => JSON.parse(JSON.stringify(r)));
}

export function getPendingDedications() {
  const db = getDatabase();
  const stmt = db.prepare(
    `SELECT id, name, message, image_url, submitted_at, submitted_by FROM dedications WHERE status = 'pending' ORDER BY submitted_at ASC`
  );
  return stmt.all().map((r) => JSON.parse(JSON.stringify(r)));
}

export function getAdminDedications(limit = 200) {
  const db = getDatabase();
  const stmt = db.prepare(
    `SELECT d.id, d.name, d.message, d.image_url, d.status, d.submitted_at, d.approved_at,
            u.full_name AS submitter_name, u.email AS submitter_email
       FROM dedications d
       LEFT JOIN users u ON u.id = d.submitted_by
      ORDER BY CASE d.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END,
               d.submitted_at DESC, d.id DESC
      LIMIT ?`
  );
  return stmt.all(limit).map((row) => JSON.parse(JSON.stringify(row)));
}

export function approveDedication(id, approver_id) {
  const db = getDatabase();
  const tx = db.transaction(() => {
    const now = new Date().toISOString();
    const stmt = db.prepare(
      `UPDATE dedications SET status = 'approved', approved_at = ?, approver_id = ? WHERE id = ? AND status = 'pending'`
    );
    const res = stmt.run(now, approver_id || null, id);
    return res.changes > 0;
  });

  return tx();
}

export function rejectDedication(id, approver_id) {
  const db = getDatabase();
  const tx = db.transaction(() => {
    const now = new Date().toISOString();
    const stmt = db.prepare(
      `UPDATE dedications SET status = 'rejected', approved_at = ? , approver_id = ? WHERE id = ? AND status = 'pending'`
    );
    const res = stmt.run(now, approver_id || null, id);
    return res.changes > 0;
  });

  return tx();
}
