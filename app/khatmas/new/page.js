import Nav from "@/components/Nav";
import { requireUser } from "@/lib/guard";
import NewKhatmaForm from "./NewKhatmaForm";
import { recipientSuggestions, listKhatmaOwners } from "@/lib/khatma";
import { checkIsAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default function NewKhatma() {
  const user = requireUser();
  const admin = checkIsAdmin(user);
  const suggestions = recipientSuggestions(user.id);
  const owners = admin ? listKhatmaOwners() : [];
  return (
    <>
      <Nav />
      <div className="container page" style={{ maxWidth: 560 }}>
        <h1 className="section-title">إنشاء ختمة جديدة</h1>
        <p className="muted" style={{ marginTop: 0 }}>سيتم إنشاء 30 جزءًا متاحًا تلقائيًا.</p>
        <NewKhatmaForm suggestions={suggestions} owners={owners} currentUserId={user.id} isAdmin={admin} />
      </div>
    </>
  );
}
