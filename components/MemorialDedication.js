import DedicationForm from "./DedicationForm";
import DedicationList from "./DedicationList";

export default function MemorialDedication({ father, mother }) {
  return (
    <>
      <div className="card dedication-card moroccan-frame">
        <div className="dedication-head">
          <div className="dedication-icon">❤</div>
          <div>
            <div className="dedication-subtitle">غرسٌ في الجنة، وبرٌّ للوالدين</div>
            <h2>آياتٌ تُتلى، وأجرٌ يُهدى</h2>
          </div>
        </div>
        <div className="dedication-photo-wrapper">
          <img src="/khatma.png" alt="الوالد والوالدة" className="dedication-photo" loading="lazy" />
          <p className="dedication-photo-caption">برُّ الوالدين… أثرٌ يبقى، وأجرٌ لا ينقطع</p>
        </div>
        <div className="dedication-grid">
          <div className="dedication-person center"><span className="dedication-label">الوالد</span><strong>{father}</strong></div>
          <div className="dedication-person center"><span className="dedication-label">الوالدة</span><strong>{mother}</strong></div>
        </div>
      </div>
      <div className="card moroccan-frame" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>اكتب دعاءً أو رثاءً، وشارك بالأجر</h3>
        <DedicationForm />
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>الرسائل المعتمدة</h3>
        <DedicationList />
      </div>
    </>
  );
}
