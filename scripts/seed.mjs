// Seeds a demo account and a sample khatma with mixed juz statuses.
// Run: npm run seed
import { createUser } from "../lib/auth.js";
import db from "../lib/db.js";
import { createKhatma, reserveJuz, completeJuzByToken, adminSetJuzStatus } from "../lib/khatma.js";

const email = "demo@khatma.app";
let user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
if (!user) {
  const res = createUser("مستخدم تجريبي", email, "demo123");
  user = db.prepare("SELECT * FROM users WHERE id=?").get(res.userId);
  console.log("Created demo user:", email, "/ password: demo123");
} else {
  console.log("Demo user already exists:", email);
}

// Create an admin user
const adminEmail = "admin@khatma.app";
let admin = db.prepare("SELECT * FROM users WHERE email=?").get(adminEmail);
if (!admin) {
  const res = createUser("مدير النظام", adminEmail, "admin123");
  db.prepare("UPDATE users SET role='admin' WHERE id=?").run(res.userId);
  admin = db.prepare("SELECT * FROM users WHERE id=?").get(res.userId);
  console.log("Created admin user:", adminEmail, "/ password: admin123");
} else {
  console.log("Admin user already exists:", adminEmail);
}

const k = createKhatma(user.id, "ختمة رمضان لعائلتنا", "نهديها لروح الوالد رحمه الله");
const names = ["أحمد", "فاطمة", "محمد", "نورة", "خالد", "سارة", "علي", "ليلى", "عمر", "هند", "يوسف"];
// Complete first 11, reserve next 7, leave rest available.
for (let n = 1; n <= 11; n++) {
  const r = reserveJuz(k.id, n, names[(n - 1) % names.length]);
  completeJuzByToken(r.token);
}
for (let n = 12; n <= 18; n++) {
  reserveJuz(k.id, n, names[(n - 1) % names.length]);
}
console.log("Seeded khatma:", k.title, "public link: /k/" + k.public_id);
console.log("Done.");
process.exit(0);
