"use client";
import { useToast } from "@/components/Toast";

export default function ShareCompletionCard({ publicId, title, honorName }) {
  const notify = useToast();

  const shareText = `الحمد لله، اكتملت ختمة القرآن «${title}» مهدىً إلى ${honorName || "أحبائنا"}. شارك الدعاء معنا عبر هذا الرابط:`;

  const getUrl = () => `${window.location.origin}/k/${publicId}`;

  const handleCopy = async () => {
    if (navigator.clipboard) {
      const url = getUrl();
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      notify("تم نسخ بطاقة المشاركة", "success");
    }
  };

  const handleShare = () => {
    const url = getUrl();
    if (navigator.share) {
      navigator.share({ title: `ختمة مكتملة: ${title}`, text: `${shareText}\n${url}` }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="card" style={{ padding: 18, background: "linear-gradient(135deg, #fff5f1, #fff2ef)", border: "1px solid rgba(231, 84, 73, 0.18)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "#b54d39" }}>بطاقة مشاركة الإنجاز</div>
          <h3 style={{ margin: "10px 0 6px" }}>ختمة مكتملة بكل فخر</h3>
          <p className="muted" style={{ margin: 0, lineHeight: 1.8 }}>
            شارك الرابط وأطلق دعاءً خاصًا للوالد {honorName ? `و${honorName}` : ""}، لتكون الختمة ذكرًا حيًا وجعل الله ثوابها مستمرًا.
          </p>
        </div>
        <div style={{ display: "grid", gap: 8, minWidth: 180 }}>
          <button className="btn btn-primary btn-sm" onClick={handleShare}>🔗 شارك الآن</button>
          <button className="btn btn-ghost btn-sm" onClick={handleCopy}>📋 نسخ البطاقة</button>
        </div>
      </div>
    </div>
  );
}
