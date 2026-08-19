import Link from "next/link";
import Nav from "@/components/Nav";
import MemorialDedication from "@/components/MemorialDedication";
import { getDailyDuaa } from "@/lib/dhikr-client";
import { requireUser } from "@/lib/guard";
import { ownerStats, adminOverview, recipientGiftStats } from "@/lib/khatma";
import AnnouncementAdmin from "@/components/AnnouncementAdmin";
import AdminMessages from "@/components/AdminMessages";
import KhatmaRequestsAdmin from "@/components/KhatmaRequestsAdmin";
import GiftRecipientStats from "@/components/GiftRecipientStats";
import { listUserContactMessages } from "@/lib/contactMessages";

export const dynamic = "force-dynamic";

function formatDateTime(value) {
  return value ? value.slice(0, 16) : "غير متوفر";
}

function shortText(value, max = 90) {
  if (!value) return "غير متوفر";
  const text = String(value);
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export default function Dashboard() {
  const user = requireUser();
  const stats = ownerStats(user.id);
  const dailyDuaa = getDailyDuaa();
  const isAdmin = user.role === "admin";
  const adminInfo = isAdmin ? adminOverview() : null;
  const recipientStats = recipientGiftStats(isAdmin ? null : user.id);
  const myMessages = listUserContactMessages(user.id);
  const dashboardStats = isAdmin
    ? {
        active: adminInfo.activeKhatmas,
        completed: adminInfo.completedKhatmas,
        completedJuz: adminInfo.completedJuz,
        avg: adminInfo.totalKhatmas
          ? Math.round(adminInfo.allKhatmas.reduce((sum, khatma) => sum + (khatma.percent || 0), 0) / adminInfo.totalKhatmas)
          : 0,
      }
    : stats;

  return (
    <>
      <Nav />
      <div className="container page">
        <h1 className="section-title">لوحة التحكم</h1>
        <p className="muted" style={{ marginTop: 0 }}>مرحبًا {user.full_name} 👋</p>
        {isAdmin ? (
          <div className="card note" style={{ marginTop: 14, padding: 16, borderColor: "#d7e5fa", background: "#eef6ff" }}>
            <strong>أنت متصل كمدير النظام</strong>
            <p className="muted" style={{ margin: "8px 0 0" }}>
              يمكنك هنا مشاهدة إحصائيات عامة للنظام، متابعة آخر الختمات، وفتح أي ختمة لإدارة حالة الأجزاء.
            </p>
          </div>
        ) : null}

        <div className="stat-grid" style={{ marginTop: 18 }}>
          <div className="stat"><div className="v">{dashboardStats.active}</div><div className="l">ختمات نشطة</div></div>
          <div className="stat"><div className="v">{dashboardStats.completed}</div><div className="l">ختمات مكتملة</div></div>
          <div className="stat"><div className="v">{dashboardStats.completedJuz}</div><div className="l">أجزاء مُتمّة</div></div>
          <div className="stat"><div className="v">{dashboardStats.avg}%</div><div className="l">متوسط الإنجاز</div></div>
        </div>

        <GiftRecipientStats recipients={recipientStats} admin={isAdmin} />

        {myMessages.length ? (
          <section className="card user-message-replies">
            <div className="admin-card-title"><div><span className="admin-kicker">رسائلك للمشرف</span><h3>الردود من الإدارة</h3></div><span className="badge active">{myMessages.length} رسالة</span></div>
            <div className="admin-message-list">
              {myMessages.map((message) => (
                <article key={message.id} className="admin-message-item">
                  <div className="admin-message-meta"><strong>{message.sender_name} · {message.category}</strong><span>{formatDateTime(message.created_at)}</span></div>
                  <p>{message.message}</p>
                  {message.admin_reply ? (
                    <div className="admin-reply-box"><strong>رد المشرف:</strong><p>{message.admin_reply}</p><small>{formatDateTime(message.replied_at)}</small></div>
                  ) : (
                    <p className="muted">لم يتم الرد على هذه الرسالة بعد.</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {isAdmin ? (
          <div style={{ marginTop: 22 }}>
            <AnnouncementAdmin />
            <KhatmaRequestsAdmin />
            <AdminMessages />
            <div className="card admin-visitor-summary">
              <div className="admin-card-title"><div><span className="admin-kicker">عدد الزائرين</span><h3>إحصاء الزيارات</h3></div><span className="badge admin-badge">تحديث مباشر</span></div>
              <div className="stat-grid admin-stat-grid">
                <div className="stat"><div className="v">{adminInfo.totalVisits}</div><div className="l">المجموع الكلي للزيارات</div></div>
                <div className="stat"><div className="v">{adminInfo.todayVisits}</div><div className="l">زيارات اليوم</div></div>
                <div className="stat"><div className="v">{adminInfo.uniqueVisitors}</div><div className="l">زوار مختلفون كليًا</div></div>
                <div className="stat"><div className="v">{adminInfo.todayUniqueVisitors}</div><div className="l">زوار مختلفون اليوم</div></div>
              </div>
            </div>
            <div className="row" style={{ gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
              <div style={{ flex: "1 1 320px", minWidth: 280 }}>
                <div className="stat-grid">
                  <div className="stat"><div className="v">{adminInfo.totalUsers}</div><div className="l">مستخدمون</div></div>
                  <div className="stat"><div className="v">{adminInfo.totalKhatmas}</div><div className="l">كل الختمات</div></div>
                  <div className="stat"><div className="v">{adminInfo.completedJuz}</div><div className="l">أجزاء مكتملة</div></div>
                  <div className="stat"><div className="v">{adminInfo.reservedJuz}</div><div className="l">أجزاء محجوزة</div></div>
                </div>
              </div>
              <div style={{ flex: "1 1 320px", minWidth: 280 }}>
                <div className="card" style={{ background: "#eef6ff", borderColor: "#d8e8f4" }}>
                  <strong style={{ display: "block", marginBottom: 10 }}>وضع مدير النظام</strong>
                  <p className="muted" style={{ margin: 0, lineHeight: 1.8 }}>
                    يمكنك متابعة تقدم كل الختمات، فتح أي صفحة ختمة كمشرف، وتحديث حالة الأجزاء إذا احتاج الأمر.
                  </p>
                </div>
              </div>
            </div>
            <div className="card" style={{ padding: 20, marginBottom: 24 }}>
              <strong style={{ display: "block", marginBottom: 12 }}>آخر الختمات</strong>
              <div className="row" style={{ flexDirection: "column", gap: 12 }}>
                {adminInfo.recentKhatmas.map((k) => (
                  <Link key={k.id} href={`/khatmas/${k.id}`} className="card" style={{ padding: "14px 16px", borderColor: "#dde7f1", background: "#fbfdff" }}>
                    <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 15 }}>{k.title}</h3>
                        <p className="muted" style={{ margin: "8px 0 0", fontSize: 13 }}>
                          {k.honorName ? `مهدى إلى ${k.honorName}` : "بدون إهداء"} · {k.status === "active" ? "نشطة" : k.status === "completed" ? "مكتملة" : "موقوفة"}
                        </p>
                      </div>
                      <span className={`badge ${k.status}`} style={{ padding: "6px 12px" }}>
                        {k.status === "active" ? "نشطة" : k.status === "completed" ? "مكتملة" : "موقوفة"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <section className="admin-full-report">
              <div className="row admin-section-heading">
                <div><span className="admin-kicker">تقرير النظام الكامل</span><h2 className="section-title">كل المعلومات المتاحة للمشرف</h2></div>
                <span className="badge admin-badge">تحديث مباشر</span>
              </div>
              <div className="stat-grid admin-stat-grid">
                <div className="stat"><div className="v">{adminInfo.totalKhatmas}</div><div className="l">إجمالي الختمات</div></div>
                <div className="stat"><div className="v">{adminInfo.activeKhatmas}</div><div className="l">ختمات نشطة</div></div>
                <div className="stat"><div className="v">{adminInfo.completedKhatmas}</div><div className="l">ختمات مكتملة</div></div>
                <div className="stat"><div className="v">{adminInfo.disabledKhatmas}</div><div className="l">ختمات موقوفة</div></div>
                <div className="stat"><div className="v">{adminInfo.completedJuz}</div><div className="l">أجزاء مكتملة</div></div>
                <div className="stat"><div className="v">{adminInfo.reservedJuz}</div><div className="l">أجزاء محجوزة</div></div>
                <div className="stat"><div className="v">{adminInfo.availableJuz}</div><div className="l">أجزاء متاحة</div></div>
                <div className="stat"><div className="v">{adminInfo.participantCount}</div><div className="l">أسماء مشاركين</div></div>
                <div className="stat"><div className="v">{adminInfo.totalUsers}</div><div className="l">حسابات مسجلة</div></div>
                <div className="stat"><div className="v">{adminInfo.totalVisits}</div><div className="l">دخول للموقع</div></div>
                <div className="stat"><div className="v">{adminInfo.todayVisits}</div><div className="l">دخول اليوم</div></div>
                <div className="stat"><div className="v">{adminInfo.uniqueVisitors}</div><div className="l">زوار مختلفون</div></div>
                <div className="stat"><div className="v">{adminInfo.todayUniqueVisitors}</div><div className="l">زوار اليوم</div></div>
                <div className="stat"><div className="v">{adminInfo.totalDedications}</div><div className="l">رسائل دعاء ورثاء</div></div>
                <div className="stat"><div className="v">{adminInfo.pendingDedications}</div><div className="l">رسائل تنتظر الموافقة</div></div>
                <div className="stat"><div className="v">{adminInfo.dhikrTotal}</div><div className="l">مجموع الذكر الجماعي</div></div>
              </div>

              <div className="card admin-data-card">
                <div className="admin-card-title"><h3>كل من دخل إلى الموقع مؤخراً</h3><span>{adminInfo.recentVisits.length} دخول حديث</span></div>
                <div className="admin-visit-list">
                  {adminInfo.recentVisits.length ? adminInfo.recentVisits.map((visit) => (
                    <article key={visit.id} className="admin-visit-item">
                      <div className="admin-khatma-top">
                        <div>
                          <h4>{visit.full_name || "زائر بدون تسجيل دخول"}</h4>
                          <p>{visit.email || `زائر رقم ${visit.visitor_id.slice(0, 8)}`}</p>
                        </div>
                        <span className={`badge ${visit.email ? "completed" : "active"}`}>{visit.email ? "مستخدم مسجل" : "زائر"}</span>
                      </div>
                      <div className="admin-detail-grid">
                        <span><b>الصفحة:</b> {visit.path}</span>
                        <span><b>وقت الدخول:</b> {formatDateTime(visit.created_at)}</span>
                        <span><b>IP:</b> {visit.ip_address || "غير متوفر"}</span>
                        <span><b>بلد IP:</b> {visit.ip_country || "غير متوفر"}</span>
                        <span><b>مدينة IP:</b> {visit.ip_city || "غير متوفر"}</span>
                        <span><b>المصدر:</b> {visit.referrer || "دخول مباشر"}</span>
                        <span><b>نوع الحساب:</b> {visit.role === "admin" ? "مشرف" : visit.email ? "مستخدم" : "زائر"}</span>
                        <span><b>المتصفح:</b> {shortText(visit.user_agent)}</span>
                      </div>
                    </article>
                  )) : <p className="muted">لم يتم تسجيل زيارات بعد. ستظهر هنا بعد فتح أي صفحة في الموقع.</p>}
                </div>
              </div>

              <div className="card admin-data-card">
                <div className="admin-card-title"><h3>تفاصيل الحسابات المسجلة</h3><span>{adminInfo.users.length} مستخدم</span></div>
                <div className="admin-user-list">
                  {adminInfo.users.map((account) => (
                    <article key={account.id} className="admin-user-item detailed">
                      <div>
                        <strong>{account.full_name}</strong>
                        <small>{account.email}</small>
                        <small>أنشئ الحساب: {formatDateTime(account.created_at)}</small>
                        <small>آخر دخول: {formatDateTime(account.last_seen)}</small>
                      </div>
                      <div className="admin-detail-grid admin-user-detail-grid">
                        <span><b>نوع الحساب:</b> {account.role === "admin" ? "مشرف" : "مستخدم"}</span>
                        <span><b>عدد الدخول:</b> {account.visit_count || 0}</span>
                        <span><b>آخر صفحة:</b> {account.last_path || "غير متوفر"}</span>
                        <span><b>IP آخر دخول:</b> {account.last_ip || "غير متوفر"}</span>
                        <span><b>بلد آخر IP:</b> {account.last_ip_country || "غير متوفر"}</span>
                        <span><b>مدينة آخر IP:</b> {account.last_ip_city || "غير متوفر"}</span>
                        <span><b>آخر مصدر:</b> {account.last_referrer || "دخول مباشر"}</span>
                        <span><b>الهاتف:</b> {account.latest_phone || "لم يرسل رقمًا"}</span>
                        <span><b>البلد:</b> {account.latest_country || "غير متوفر"}</span>
                        <span><b>رسائل للمشرف:</b> {account.contact_count || 0}</span>
                        <span><b>آخر رسالة:</b> {account.latest_message ? shortText(account.latest_message, 120) : "لا توجد رسالة"}</span>
                        <span><b>الختمات:</b> {account.khatmas} · مكتملة {account.completed_khatmas} · أجزاء {account.completed_juz || 0}</span>
                        <span><b>المتصفح:</b> {shortText(account.last_user_agent, 120)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="card admin-data-card">
                <div className="admin-card-title"><h3>أسماء الحاجزين والمشاركين</h3><span>{adminInfo.recentParticipants.length} اسم</span></div>
                <div className="admin-visit-list">
                  {adminInfo.recentParticipants.length ? adminInfo.recentParticipants.map((participant) => (
                    <article key={participant.id} className="admin-visit-item">
                      <div className="admin-khatma-top">
                        <div>
                          <h4>{participant.participant_name}</h4>
                          <p>{participant.khatma_title}</p>
                        </div>
                        <span className={`badge ${participant.status === "completed" ? "completed" : "active"}`}>
                          {participant.status === "completed" ? "أكمل القراءة" : participant.status === "reserved" ? "حجز جزء" : "متاح"}
                        </span>
                      </div>
                      <div className="admin-detail-grid">
                        <span><b>الجزء:</b> {participant.number}</span>
                        <span><b>الختمة:</b> {participant.khatma_title}</span>
                        <span><b>المالك:</b> {participant.owner_name}</span>
                        <span><b>بريد المالك:</b> {participant.owner_email}</span>
                        <span><b>الإهداء:</b> {participant.honor_name || "بدون إهداء"}</span>
                        <span><b>وقت الحجز:</b> {formatDateTime(participant.reserved_at)}</span>
                        <span><b>وقت الإتمام:</b> {formatDateTime(participant.completed_at)}</span>
                        <span><b>الرابط العام:</b> {participant.public_id}</span>
                      </div>
                      <div className="row">
                        <Link href={`/khatmas/${participant.khatma_id}`} className="btn btn-primary btn-sm">إدارة الختمة</Link>
                        <Link href={`/k/${participant.public_id}`} className="btn btn-ghost btn-sm">فتح الرابط العام</Link>
                      </div>
                    </article>
                  )) : <p className="muted">لا توجد أسماء حجز أو مشاركة بعد.</p>}
                </div>
              </div>

              <div className="card admin-data-card">
                <div className="admin-card-title"><h3>تفاصيل جميع الختمات لكل المستخدمين</h3><span>{adminInfo.allKhatmas.length} ختمة</span></div>
                <div className="admin-khatma-list">
                  {adminInfo.allKhatmas.length ? adminInfo.allKhatmas.map((k) => (
                    <article key={k.id} className="admin-khatma-item">
                      <div className="admin-khatma-top">
                        <div><h4>{k.title}</h4><p>{k.description || "لا يوجد وصف"}</p></div>
                        <span className={`badge ${k.status}`}>{k.status === "active" ? "نشطة" : k.status === "completed" ? "مكتملة" : "موقوفة"}</span>
                      </div>
                      <div className="admin-detail-grid">
                        <span><b>المالك:</b> {k.owner_name}</span>
                        <span><b>البريد:</b> {k.owner_email}</span>
                        <span><b>الإهداء:</b> {k.honor_name || "بدون إهداء"}</span>
                        <span><b>تاريخ الإنشاء:</b> {k.created_at?.slice(0,16)}</span>
                        <span><b>المشاركون:</b> {k.participants || 0}</span>
                        <span><b>الرمز العام:</b> {k.public_id}</span>
                      </div>
                      <div className="progress"><span style={{ width: `${k.percent}%` }} /></div>
                      <div className="admin-progress-line"><span>{k.completed || 0} مكتمل</span><span>{k.reserved || 0} محجوز</span><span>{k.available || 0} متاح</span><strong>{k.percent}%</strong></div>
                      <div className="row">
                        <Link href={`/khatmas/${k.id}`} className="btn btn-primary btn-sm">إدارة الختمة</Link>
                        <Link href={`/k/${k.public_id}`} className="btn btn-ghost btn-sm">فتح الرابط العام</Link>
                      </div>
                    </article>
                  )) : <p className="muted">لا توجد ختمات بعد.</p>}
                </div>
              </div>

            </section>
          </div>
        ) : null}

        <div className="row" style={{ gap: 16, flexWrap: "wrap", marginTop: 18, marginBottom: 24 }}>
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <div className="card highlight-card">
              <strong style={{ display: "block", marginBottom: 10 }}>المشاركين</strong>
              {stats.topParticipants.length ? (
                <div className="row" style={{ flexWrap: "wrap", gap: 10 }}>
                  {stats.topParticipants.map((participant) => (
                    <span key={participant.name} className="pill">
                      {participant.name} · {participant.count} جزء
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted" style={{ margin: 0 }}>
                  لم يبدأ أي مشارك بعد. شارك رابط الختمة لتشجيع أول الأصدقاء.
                </p>
              )}
            </div>
          </div>
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <div className="card" style={{ background: "#f4f8ff" }}>
              <strong style={{ display: "block", marginBottom: 10 }}>لمحة ذكية</strong>
              <p className="muted" style={{ margin: 0, lineHeight: 1.8 }}>
                {stats.completed === 0
                  ? "ابدأ أول ختماتك اليوم وادعُ لأحبائك أثناء الحجز."
                  : stats.avg < 40
                  ? "التقدّم في البداية؛ رجاءً شارك تذكيرًا لطيفًا مع من لم يؤكد حصته بعد."
                  : stats.avg < 80
                  ? "جيد جدًا! أعد نشر الرابط لتشجيع بقية المشاركين على إكمال الأجزاء."
                  : "ممتاز — الختمات في طريقها إلى الاكتمال. أكمل شاملًا دعاء ختم القرآن."}
              </p>
              <div style={{ marginTop: 12 }} className="row">
                <Link href="/duas?category=quran_completion" className="btn btn-gold btn-sm">دعاء ختم القرآن</Link>
                <Link href="/duas?category=deceased" className="btn btn-ghost btn-sm">دعاء للمتوفّى</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="row" style={{ justifyContent: "space-between", alignItems: "center", margin: "30px 0 14px" }}>
          <h2 className="section-title" style={{ fontSize: 19 }}>ملخّص الختمات</h2>
          <Link href="/khatmas/new" className="btn btn-primary btn-sm">+ ختمة جديدة</Link>
        </div>

        <div className="row" style={{ gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <div className="card" style={{ background: "#f7fafc" }}>
              <strong style={{ display: "block", marginBottom: 10 }}>دعاء اليوم الموصى به</strong>
              <p style={{ margin: 0, lineHeight: 1.8 }}>{dailyDuaa.text}</p>
              <div style={{ marginTop: 12 }}>
                <Link href="/duas?category=quran_completion" className="btn btn-gold btn-sm">اطّلع على الأدعية</Link>
              </div>
            </div>
          </div>
          <div style={{ flex: "1 1 320px", minWidth: 280 }}>
            <MemorialDedication father="يحيى علي الحلبي" mother="دلال محمد طاهر اللادقي" />
          </div>
        </div>

        {stats.khatmas.length === 0 ? (
          <div className="card center">
            <p className="muted">لا توجد ختمات بعد. ابدأ ختمتك الأولى الآن.</p>
            <Link href="/khatmas/new" className="btn btn-primary">إنشاء ختمة</Link>
          </div>
        ) : (
          <div className="stat-grid">
            {stats.khatmas.map((k) => (
              <Link key={k.id} href={`/khatmas/${k.id}`} className="card k-card" style={{ textDecoration: "none" }}>
                <div className="top">
                  <h3>{k.title}</h3>
                  <span className={`badge ${k.status}`}>
                    {k.status === "active" ? "نشطة" : k.status === "completed" ? "مكتملة" : "موقوفة"}
                  </span>
                </div>
                <div className="progress"><span style={{ width: `${k.progress.percent}%` }} /></div>
                <div className="meta">{k.progress.completed} / 30 جزء مُتمّ — {k.progress.percent}%</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
