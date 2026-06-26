import Nav from "@/components/Nav";
import { requireUser } from "@/lib/guard";
import NewKhatmaForm from "./NewKhatmaForm";

export const dynamic = "force-dynamic";

export default function NewKhatma() {
  requireUser();
  return (
    <>
      <Nav />
      <div className="container page" style={{ maxWidth: 560 }}>
        <h1 className="section-title">إنشاء ختمة جديدة</h1>
        <p className="muted" style={{ marginTop: 0 }}>سيتم إنشاء 30 جزءًا متاحًا تلقائيًا.</p>
        <NewKhatmaForm />
      </div>
    </>
  );
}
