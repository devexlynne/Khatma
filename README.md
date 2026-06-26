# ختمة — Khatma Platform

منصة لتنظيم ختمات القرآن الجماعية بسهولة واحترام. أنشئ ختمة، شارك الرابط، ودع كل
مشارك يحجز جزءًا ويتابع الجميع التقدّم حتى تكتمل الختمة.

A full-stack Arabic (RTL) web app for organizing collective Quran khatmas.
Built with **Next.js 14 (App Router)** and **SQLite** (via Node's built-in
`node:sqlite` — no native compilation required).

---

## التشغيل / Getting started

You need **Node.js 22 or newer** (the app uses Node's built-in SQLite module).

```bash
npm install
npm run seed     # optional: creates a demo account + sample khatma
npm run dev      # starts the app at http://localhost:3000
```

Then open <http://localhost:3000>.

> ملاحظة: تُمرَّر الرايات `--experimental-sqlite` تلقائيًا عبر سكربتات npm، فلا
> حاجة لإضافتها يدويًا. The `--experimental-sqlite` flag is wired into the npm
> scripts already, so you don't need to pass it yourself.

### حساب تجريبي / Demo account (after `npm run seed`)

- البريد / email: `demo@khatma.app`
- كلمة المرور / password: `demo123`

---

## المزايا / Features

**للمشرف (صاحب الختمة) — Admin / owner**

- إنشاء حساب وتسجيل الدخول (كلمة مرور مُشفّرة بـ bcrypt).
- لوحة تحكم بإحصائيات: ختمات نشطة، مكتملة، أجزاء مُتمّة، متوسط الإنجاز.
- صفحة «ختماتي» مع فلاتر (الكل / نشطة / مكتملة / موقوفة) وبحث بالاسم.
- إنشاء ختمة، **تعديل** الاسم والوصف، **حذف**، و**إيقاف/إعادة تفعيل**.
- صفحة تفاصيل الختمة: شبكة الأجزاء الثلاثين بحالاتها وأسماء المشاركين.
- **التحكم اليدوي** بحالة أي جزء (متاح / محجوز / مُتمّ).
- زر **مشاركة** يولّد رسالة واتساب جاهزة وينسخ الرابط.

**للمشارك (بدون حساب) — Participant (no account)**

- يفتح الرابط المشترَك، يرى التقدّم، ويختار جزءًا متاحًا.
- يحجز الجزء **بالاسم فقط** — لا كلمة مرور ولا رمز تحقق.
- يحصل على **رابط إتمام خاص** يُحفظ تلقائيًا في المتصفح (localStorage).
- يؤكّد الإتمام لاحقًا عبر ذلك الرابط.

**لمسات إضافية — Extras**

- منع الحجز المزدوج على مستوى قاعدة البيانات (آمن ضد التزامن).
- تنبيهات داخل التطبيق (تم الحجز، محجوز مسبقًا، تم الإتمام…).
- رسالة تهنئة عند اكتمال الختمة 30/30:
  «الحمد لله، اكتملت الختمة. تقبّل الله من الجميع…»
- الختمة تُعلَّم «مكتملة» تلقائيًا عند إتمام كل الأجزاء.

---

## كيف يُمنع الحجز المزدوج / How duplicate reservation is prevented

This is the key technical guarantee. Reservation is a single **conditional
UPDATE** wrapped in a transaction (`lib/khatma.js → reserveJuz`):

```sql
UPDATE juz
   SET status='reserved', participant_name=?, token=?
 WHERE khatma_id=? AND number=? AND status='available';
```

The row only changes if it is still `available`. SQLite serializes writers, so
when two people reserve the same Juz' at the same instant, exactly **one**
UPDATE reports `changes === 1` and wins; the other gets `changes === 0` and is
told the Juz' is already taken. This holds regardless of journal mode.

> Verified with a concurrency test: 25 simultaneous attempts on the same Juz'
> → exactly 1 winner.

---

## بنية المشروع / Project structure

```
app/
  page.js                     الصفحة الرئيسية (Landing)
  login/ signup/              المصادقة (Auth)
  dashboard/                  لوحة التحكم
  khatmas/                    ختماتي + إنشاء + تفاصيل/إدارة
  k/[publicId]/               صفحة الحجز العامة (Public reserve)
  complete/[token]/           صفحة تأكيد الإتمام (Complete)
  api/                        مسارات الـ API (auth, khatmas, public)
components/                   Nav, Toast, ShareButton, ...
lib/
  db.js                       SQLite (node:sqlite) + المخطط + transactions
  khatma.js                   منطق الختمات/الأجزاء/الحجز
  auth.js                     إنشاء/تحقق المستخدم + الجلسات
  session.js                  قراءة المستخدم الحالي من الكوكي
scripts/seed.mjs              بيانات تجريبية
```

---

## إعدادات / Configuration

- `KHATMA_DB` — optional path to the SQLite file. Defaults to `./data/khatma.db`.
  Useful if `./data` is on a filesystem that doesn't support SQLite WAL
  (the app falls back gracefully in that case).

---

## ملاحظات نشر / Deployment notes

The app stores data in a local SQLite file, so it runs well on a single Node
host or a small VPS. For serverless platforms (e.g. Vercel) you'd swap the
SQLite file for a hosted database, since serverless filesystems are ephemeral.
The data layer is isolated in `lib/`, so only `lib/db.js` and the query helpers
would need adapting.
