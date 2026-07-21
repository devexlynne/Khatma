import Nav from "@/components/Nav";
import { requireUser } from "@/lib/guard";
import { listKhatmasByOwner, listPublicActiveKhatmas } from "@/lib/khatma";
import KhatmaList from "./KhatmaList";

export const dynamic = "force-dynamic";

export default function MyKhatmas() {
  const user = requireUser();
  const khatmas = listKhatmasByOwner(user.id);
  const publicKhatmas = listPublicActiveKhatmas(user.id);
  return (
    <>
      <Nav />
      <div className="container page">
        <KhatmaList khatmas={khatmas} publicKhatmas={publicKhatmas} />
      </div>
    </>
  );
}
