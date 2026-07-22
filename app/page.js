export const dynamic = "force-dynamic";
import Link from "next/link";
import Nav from "@/components/Nav";
import EntrySplash from "@/components/EntrySplash";
import MemorialDedication from "@/components/MemorialDedication";
import ParentsTributeGateway from "@/components/ParentsTributeGateway";
import AnnouncementBar from "@/components/AnnouncementBar";
import PublicKhatmasSection from "@/components/PublicKhatmasSection";
import KidsGardenSection from "@/components/KidsGardenSection";
import DailyDhikr from "@/components/DailyDhikr";
import PrayerTimes from "@/components/PrayerTimes";
import InstallApp from "@/components/InstallApp";
import ContactAdminForm from "@/components/ContactAdminForm";
import { getCurrentUser } from "@/lib/session";
import { khatmaGiftStats, listPublicActiveKhatmas } from "@/lib/khatma";

export default function Home() {
  const user = getCurrentUser();
  const father = "يحيى علي الحلبي";
  const mother = "دلال محمد طاهر اللاذقي";
  const giftStats = { father: khatmaGiftStats(father), mother: khatmaGiftStats(mother) };
  const publicKhatmas = listPublicActiveKhatmas();
  return <><EntrySplash /><Nav /><AnnouncementBar /><main className="container">
    <section className="hero moroccan-hero">
      <p className="bismillah">بسم الله الرحمن الرحيم</p>
      <h1>نور الوالدين</h1>
      <div className="intro-copy">
        <p>أنشأنا هذه المنصة كصدقة جارية عن روح والدنا ووالدتنا رحمهما الله وغفر لهما، وأن ينفع بها كل من قرأ القرآن أو دعا أو دلّ على الخير.</p>
        <p>تهدف المنصة إلى تيسير ختم القرآن الكريم بصورة فردية أو جماعية؛ حيث يمكن إنشاء ختمة لوالدينا أو لمن نحب، ودعوة الأهل والأصدقاء للمشاركة، وحجز الأجزاء، ومتابعة تقدم الختمة حتى تكتمل بإذن الله.</p>
        <p>كما تضم المنصة مجموعة من الأدعية والأذكار المأثورة، ليكون الدعاء رفيقًا لتلاوة القرآن، ونرجو أن يجعل الله ثواب ذلك في ميزان حسنات من نحب.</p>
        <p>ولم ننسَ أبناءنا الصغار، فخصصنا لهم حديقة المسلم الصغير؛ مساحة تعليمية وتربوية تقدم القرآن الكريم والأذكار والقصص الإسلامية والقيم والأخلاق بأسلوب مبسط يناسب أعمارهم.</p>
        <p>نسأل الله تعالى أن يتقبل هذا العمل، وأن يجعله خالصًا لوجهه الكريم، وأن ينفع من كانوا سببًا في هذا العمل.</p>
      </div>
      <div className="row hero-actions"><Link href={user ? "/khatmas/new" : "/signup"} className="btn btn-primary">ابدأ ختمة جديدة</Link><Link href={user ? "/dashboard" : "/login"} className="btn btn-ghost">{user ? "لوحة التحكم" : "تسجيل الدخول"}</Link></div>
      <p className="guest-note">لا يحتاج المشاركون إلى حساب أو بريد إلكتروني لحجز جزء عبر رابط الختمة العام؛ الحساب مطلوب فقط لإنشاء الختمة وإدارتها.</p>
    </section>
    <PublicKhatmasSection khatmas={publicKhatmas} />
    <MemorialDedication father={father} mother={mother} giftStats={giftStats} />
    <ParentsTributeGateway />
    <section className="card prophet-audio-card moroccan-frame">
      <div><span className="prophet-card-kicker">سيرةٌ تُسمع بالقلب</span><h2>مع النبي محمد ﷺ</h2><p>حلقات صوتية تقرّبنا من سيرة النبي محمد صلى الله عليه وسلم وهديه.</p></div>
      <a className="btn btn-primary" href="https://islamonline.net/podcast/" target="_blank" rel="noreferrer">الاستماع إلى الصوتيات</a>
    </section>
    <PrayerTimes />
    <InstallApp />
    <KidsGardenSection />
    <DailyDhikr />
    <ContactAdminForm />
    <footer className="center muted">القرآن يجمعنا...</footer>
  </main></>;
}
