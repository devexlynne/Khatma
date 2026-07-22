import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import { requireUser } from "@/lib/guard";
import { getKhatmaById, getJuzList, khatmaProgress, khatmaTimeline, khatmaParticipants, khatmaInsights } from "@/lib/khatma";
import { getKhatmaGroupDhikrs } from "@/lib/dhikr";
import ManageKhatma from "./ManageKhatma";
import { checkIsAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default function KhatmaDetails({ params }) {
  const user = requireUser();
  const khatma = getKhatmaById(Number(params.id));
  if (!khatma || (khatma.owner_id !== user.id && !checkIsAdmin(user))) notFound();
  const juz = getJuzList(khatma.id);
  const progress = khatmaProgress(khatma.id);
  const groupDhikrs = getKhatmaGroupDhikrs(khatma.id);
  const timeline = khatmaTimeline(khatma.id);
  const participants = khatmaParticipants(khatma.id);
  const insights = khatmaInsights(khatma.id);

  return (
    <>
      <Nav />
      <div className="container page">
        <ManageKhatma
          khatma={khatma}
          juz={juz}
          progress={progress}
          groupDhikrs={groupDhikrs}
          timeline={timeline}
          participants={participants}
          insights={insights}
        />
      </div>
    </>
  );
}
