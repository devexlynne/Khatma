export const dynamic = 'force-dynamic';
import Nav from "@/components/Nav";
import DuaaLibrary from "@/components/DuaaLibrary";

export const metadata = {
  title: "أدعية مختارة — منصة الختمات الجماعية",
  description: "مجموعة منتقاة من الأدعية الإسلامية",
};

export default function DuaaPage() {
  return (
    <>
      <Nav />
      <DuaaLibrary />
    </>
  );
}
