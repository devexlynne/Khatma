import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import LogoutButton from "./LogoutButton";
import AnnouncementSignal from "./AnnouncementSignal";
import NotificationCenter from "./NotificationCenter";

export default function Nav() {
  const user = getCurrentUser();
  return <nav className="nav"><div className="container nav-inner">
    <div className="brand-wrap"><Link href="/" className="brand"><img className="logo logo-img" src="/noor-clean-192.png" alt="" aria-hidden="true" /><span>نور الوالدين</span><span className="brand-star" aria-hidden="true">✦</span></Link><AnnouncementSignal />{user ? <NotificationCenter /> : null}</div>
    <div className="nav-links">
      <Link href="/tasbih">مسبحتي</Link><Link href="/duas">أدعية</Link><Link href="/quran">القرآن</Link>
      {user ? <><Link href="/dashboard">لوحة التحكم</Link><Link href="/khatmas">ختماتي</Link><Link href="/khatmas/new" className="active">+ ختمة جديدة</Link>{user.role === "admin" && <span className="badge admin-badge">مشرف</span>}<LogoutButton /></> : <><Link href="/login">دخول</Link><Link href="/signup" className="active">إنشاء حساب</Link></>}
    </div>
  </div></nav>;
}
