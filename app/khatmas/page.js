import Nav from "@/components/Nav";
import { requireUser } from "@/lib/guard";
import { listKhatmasByOwner } from "@/lib/khatma";
import KhatmaList from "./KhatmaList";

export const dynamic = "force-dynamic";

export default function MyKhatmas() {
  const user = requireUser();
  const khatmas = listKhatmasByOwner(user.id);
  return (
    <>
      <Nav />
      <div className="container page">
        <KhatmaList khatmas={khatmas} />
      </div>
    </>
  );
}
