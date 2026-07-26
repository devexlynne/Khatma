import db from "./db.js";
import { createKhatma } from "./khatma.js";

function text(value, limit) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, limit);
}

export function createKhatmaRequest(user, body = {}) {
  const requesterName = text(body.requesterName || user?.full_name, 80);
  const contactInfo = text(body.contactInfo || user?.email, 120);
  const beneficiaryName = text(body.beneficiaryName, 120);
  const relationship = "";
  const beneficiaryStatus = "deceased";
  const suggestedTitle = text(body.suggestedTitle, 140);
  const message = text(body.message, 800);
  if (!requesterName || !beneficiaryName) return { ok: false, reason: "missing_fields" };
  const result = db.prepare(
    `INSERT INTO khatma_requests
      (requester_user_id, requester_name, contact_info, beneficiary_name, relationship, beneficiary_status, suggested_title, message)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(user?.id || null, requesterName, contactInfo || null, beneficiaryName, relationship || null, beneficiaryStatus, suggestedTitle || null, message || null);
  return { ok: true, id: Number(result.lastInsertRowid) };
}

export function listKhatmaRequests() {
  return db.prepare(
    `SELECT r.*, u.full_name AS account_name, u.email AS account_email,
            k.public_id AS khatma_public_id, k.title AS khatma_title
       FROM khatma_requests r
       LEFT JOIN users u ON u.id=r.requester_user_id
       LEFT JOIN khatmas k ON k.id=r.created_khatma_id
      ORDER BY CASE r.status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END, r.created_at DESC`
  ).all().map((row) => JSON.parse(JSON.stringify(row)));
}

export function reviewKhatmaRequest(id, adminUser, action) {
  const request = db.prepare("SELECT * FROM khatma_requests WHERE id=?").get(Number(id));
  if (!request || request.status !== "pending") return { ok: false, reason: "not_pending" };
  if (action === "reject") {
    const result = db.prepare("UPDATE khatma_requests SET status='rejected', reviewed_by=?, reviewed_at=datetime('now') WHERE id=? AND status='pending'")
      .run(adminUser.id, request.id);
    return { ok: result.changes === 1, status: "rejected" };
  }
  if (action !== "approve") return { ok: false, reason: "bad_action" };

  const claim = db.prepare("UPDATE khatma_requests SET status='processing', reviewed_by=?, reviewed_at=datetime('now') WHERE id=? AND status='pending'")
    .run(adminUser.id, request.id);
  if (claim.changes !== 1) return { ok: false, reason: "not_pending" };
  try {
    const ownerId = request.requester_user_id || adminUser.id;
    const title = request.suggested_title || `ختمة قرآن مهداة إلى ${request.beneficiary_name}`;
    const description = request.message || `تم إنشاء هذه الختمة بناءً على طلب ${request.requester_name}.`;
    const khatma = createKhatma(ownerId, title, description, request.beneficiary_name, {
      honorRelation: request.relationship,
      honorStatus: request.beneficiary_status,
      requestId: request.id,
    });
    db.prepare("UPDATE khatma_requests SET status='approved', created_khatma_id=? WHERE id=?")
      .run(khatma.id, request.id);
    return { ok: true, status: "approved", khatma };
  } catch (error) {
    db.prepare("UPDATE khatma_requests SET status='pending', reviewed_by=NULL, reviewed_at=NULL WHERE id=?")
      .run(request.id);
    throw error;
  }
}

export function khatmaRequestCounts() {
  const row = db.prepare(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) AS approved
       FROM khatma_requests`
  ).get();
  return { total: row?.total || 0, pending: row?.pending || 0, approved: row?.approved || 0 };
}
