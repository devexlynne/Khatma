import Link from "next/link";
import { notFound } from "next/navigation";
import { getKhatmaByPublicId, getJuzList, khatmaProgress } from "@/lib/khatma";
import { getCurrentUser, checkIsAdmin } from "@/lib/session";
import ReservePanel from "./ReservePanel";
import AdminReservePanel from "./AdminReservePanel";
import QiblaCompass from "@/components/QiblaCompass";

export const dynamic = "force-dynamic";

export default function PublicKhatma({ params }) {
  const khatma = getKhatmaByPublicId(params.publicId);
  if (!khatma) notFound();
  const juz = getJuzList(khatma.id);
  const progress = khatmaProgress(khatma.id);
  
  const user = getCurrentUser();
  const isAdmin = user && checkIsAdmin(user);

  return (
    <>
      <nav className="nav">
        <div className="container nav-inner">
          <Link href="/" className="brand"><span className="logo">۩</span><span>ختمة</span></Link>
        </div>
      </nav>
      <div className="container page" style={{ maxWidth: 760 }}>
        <div className="center" style={{ marginBottom: 8 }}>
          <h1 className="section-title">{khatma.title}</h1>
          {khatma.description ? <p className="muted" style={{ marginTop: 0 }}>{khatma.description}</p> : null}
        </div>

        {khatma.status === "disabled" ? (
          <div className="card center"><p className="muted">هذه الختمة موقوفة حاليًا. لا يمكن الحجز فيها.</p></div>
        ) : progress.completed === 30 ? (
          <div className="celebrate">
            <div style={{ fontSize: 34 }}>🤲</div>
            <h2>الحمد لله، اكتملت الختمة</h2>
            <p>تقبّل الله من الجميع وجعل ثوابها في ميزان حسنات من أُهديت له.</p>
          </div>
        ) : (
          <>
            <QiblaCompass />
            {isAdmin ? (
              <AdminReservePanel khatmaId={khatma.id} juz={juz} progress={progress} />
            ) : (
              <>
                <div className="card highlight-card" style={{ marginBottom: 16 }}>
                  <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div>
                      <strong>انضمام آمن</strong>
                      <p className="muted" style={{ marginTop: 8 }}>
                        جميع الحجوزات عامة، لكن أسماء الآخرين مخفية لحماية الخصوصية.
                      </p>
                    </div>
                    <span className={`badge ${progress.completed === 30 ? "completed" : "active"}`}>
                      {progress.completed === 30 ? "ختمة مكتملة" : `${progress.completed} تمّ · ${progress.reserved} محجوز · ${progress.available} متاح`}
                    </span>
                  </div>
                </div>
                <ReservePanel
                  publicId={khatma.public_id}
                  juz={juz.map(({ number, status }) => ({ number, status }))}
                  progress={progress}
                />
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
