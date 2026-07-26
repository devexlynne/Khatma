import Link from "next/link";
import { notFound } from "next/navigation";
import { getJuzByToken, getKhatmaById } from "@/lib/khatma";
import CompletePanel from "./CompletePanel";

export const dynamic = "force-dynamic";

export default function CompletePage({ params }) {
  const juz = getJuzByToken(params.token);
  if (!juz) notFound();
  const khatma = getKhatmaById(juz.khatma_id);

  return (
    <>
      <nav className="nav">
        <div className="container nav-inner">
          <Link href="/" className="brand"><img className="logo logo-img" src="/noor-clean-192.png" alt="" aria-hidden="true" /><span>ختمة</span></Link>
        </div>
      </nav>
      <div className="container page" style={{ maxWidth: 520 }}>
        <CompletePanel
          token={params.token}
          juz={{ number: juz.number, status: juz.status, name: juz.participant_name }}
          khatma={{ title: khatma?.title, publicId: khatma?.public_id }}
        />
      </div>
    </>
  );
}
