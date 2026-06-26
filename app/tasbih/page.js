import Nav from "@/components/Nav";
import TasbihCounter from "@/components/TasbihCounter";

export const metadata = {
  title: "مسبحتي — منصة الختمات الجماعية",
  description: "عداد تسبيح رقمي لحساب الأذكار والتسبيحات الإسلامية",
};

export default function TasbihPage() {
  return (
    <>
      <Nav />
      <TasbihCounter />
    </>
  );
}
