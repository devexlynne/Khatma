import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import LogoutButton from "./LogoutButton";

export default async function Nav() {
  const user = getCurrentUser();
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link href="/" className="brand">
          <span className="logo">۩</span>
          <span>ختمة</span>
        </Link>
        <div className="nav-links">
          <Link href="/tasbih"><span className="icon-decorated">🤲</span> مسبحتي</Link>
          <Link href="/duas"><span className="icon-decorated">🤲</span> أدعية</Link>
          <Link href="/quran"><span className="icon-decorated">📖</span> القرآن</Link>
          {user ? (
            <>
              <Link href="/dashboard">لوحة التحكم</Link>
              <Link href="/khatmas">ختماتي</Link>
              <Link href="/khatmas/new" className="active">+ ختمة جديدة</Link>
              {user.role === "admin" && <span className="badge admin-badge">مدير</span>}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login">دخول</Link>
              <Link href="/signup" className="active">إنشاء حساب</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
