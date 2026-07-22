import assert from "node:assert/strict";
import bcrypt from "bcryptjs";

const { default: db } = await import("../lib/db.js");
const { createKhatma, getJuzList, recipientGiftStats, adminSetJuzStatus } = await import("../lib/khatma.js");
const { createKhatmaRequest, reviewKhatmaRequest } = await import("../lib/khatmaRequest.js");

const suffix = Date.now();
const passwordHash = bcrypt.hashSync("Test1234!", 10);
const userInfo = db.prepare("INSERT INTO users (full_name,email,password_hash,role) VALUES (?,?,?,'user')")
  .run("مستخدم تجريبي", `user-${suffix}@example.test`, passwordHash);
const adminInfo = db.prepare("INSERT INTO users (full_name,email,password_hash,role) VALUES (?,?,?,'admin')")
  .run("مشرف تجريبي", `admin-${suffix}@example.test`, passwordHash);
const user = { id: Number(userInfo.lastInsertRowid), full_name: "مستخدم تجريبي", email: `user-${suffix}@example.test`, role: "user" };
const admin = { id: Number(adminInfo.lastInsertRowid), full_name: "مشرف تجريبي", email: `admin-${suffix}@example.test`, role: "admin" };

const request = createKhatmaRequest(user, {
  requesterName: user.full_name,
  beneficiaryName: "شخص عزيز",
  relationship: "قريب",
  beneficiaryStatus: "deceased",
  message: "طلب تجريبي",
});
assert.equal(request.ok, true);

const approval = reviewKhatmaRequest(request.id, admin, "approve");
assert.equal(approval.ok, true);
assert.equal(approval.khatma.owner_id, user.id, "Registered request must be assigned to its user");
assert.equal(approval.khatma.honor_name, "شخص عزيز");
assert.equal(approval.khatma.honor_relation, "قريب");
assert.equal(getJuzList(approval.khatma.id).length, 30);

for (let number = 1; number <= 30; number += 1) {
  assert.equal(adminSetJuzStatus(approval.khatma.id, admin, number, "completed", "قارئ تجريبي").ok, true);
}
let stats = recipientGiftStats(user.id).find((item) => item.name === "شخص عزيز");
assert.equal(stats.total, 1);
assert.equal(stats.completed, 1);

createKhatma(user.id, "ختمة ثانية", "", "  شخص   عزيز  ", { honorRelation: "قريب", honorStatus: "deceased" });
stats = recipientGiftStats(user.id).find((item) => item.name === "شخص عزيز");
assert.equal(stats.total, 2, "Same normalized recipient name must increment the counter");
assert.equal(stats.completed, 1);
assert.equal(stats.active, 1);

const guestRequest = createKhatmaRequest(null, { requesterName: "زائر", beneficiaryName: "مستفيد زائر" });
const guestApproval = reviewKhatmaRequest(guestRequest.id, admin, "approve");
assert.equal(guestApproval.khatma.owner_id, admin.id, "Guest request must be managed by the approving admin");

console.log(JSON.stringify({ ok: true, requestId: request.id, assignedOwner: approval.khatma.owner_id, recipientStats: stats, guestOwner: guestApproval.khatma.owner_id, adminEmail: admin.email }, null, 2));
