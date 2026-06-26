import DedicationForm from "./DedicationForm";
import DedicationList from "./DedicationList";

export default function MemorialDedication({ father, mother }) {
  return (
    <>
      <div className="card dedication-card">
        <div className="dedication-head">
          <div className="dedication-icon icon-decorated">❤️</div>
          <div>
            <div className="dedication-subtitle">مساحة ذكرى ومودة</div>
            <h2>نهدي هذا المشروع المبارك إلى والديّنا</h2>
          </div>
        </div>
        <div className="dedication-photo-wrapper">
          <img
            src="/khatma.png"
            alt="الأشخاص المكرمون لتطبيق الختمة"
            className="dedication-photo"
            loading="lazy"
          />
          <p className="dedication-photo-caption">نحتفي بهم بكل ودّ ومحبة في قلب هذه الختمة</p>
        </div>
        <div className="dedication-grid">
          <div className="dedication-person">
            <span className="dedication-label">الوالد</span>
            <strong>{father}</strong>
          </div>
          <div className="dedication-person">
            <span className="dedication-label">الوالدة</span>
            <strong>{mother}</strong>
          </div>
        </div>
        <p className="muted dedication-note">
          دعاءنا أن تكون هذه الختمة رحمة وتقديرًا لهما، وأن يجمعنا الله بهما في خير ومحبة وذكر.
        </p>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>💬 اكتب دعاءً أو رثاءً</h3>
        <p className="muted" style={{ marginBottom: 16, fontSize: 14 }}>أرسل رسالة للوالد أو الوالدة — ستظهر بعد موافقة المشرف.</p>
        <DedicationForm />
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>📖 الرسائل المعتمدة</h3>
        <DedicationList />
      </div>
    </>
  );
}
