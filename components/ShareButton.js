"use client";
import { useToast } from "@/components/Toast";

export default function ShareButton({ publicId, title, className = "btn btn-gold btn-sm", label = "مشاركة" }) {
  const notify = useToast();

  function share() {
    const url = `${window.location.origin}/k/${publicId}`;
    const msg =
      `شارك معنا في ختمة القرآن: «${title}»\n` +
      `اختر جزءًا متاحًا واحجزه من خلال الرابط التالي:\n${url}\n\nتقبّل الله منّا ومنكم 🤲`;
    const wa = `https://wa.me/?text=${encodeURIComponent(msg)}`;

    // Try clipboard for convenience, then open WhatsApp.
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => notify("تم نسخ رابط الختمة", "info"),
        () => {}
      );
    }
    window.open(wa, "_blank");
  }

  return (
    <button className={className} onClick={share} type="button">
      🔗 {label}
    </button>
  );
}
