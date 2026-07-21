import Link from "next/link";

export default function ParentsTributeGateway() {
  return (
    <section className="tribute-gateway" aria-labelledby="tribute-gateway-title">
      <Link href="/tribute" className="tribute-gateway-link" aria-label="اقرأ: لأنهما يستحقان">
        <img
          src="/sanctuary-gate.png"
          alt="زخرفة معمارية إسلامية لباب الحرم"
          className="tribute-gateway-image"
          loading="lazy"
        />
        <span className="tribute-gateway-shade" aria-hidden="true" />
        <span className="tribute-gateway-copy">
          <span className="tribute-gateway-kicker">سيرة حبٍّ ووفاء</span>
          <strong id="tribute-gateway-title">لأنهما يستحقان...</strong>
          <span className="tribute-gateway-cta">اضغط لقراءة الحكاية</span>
        </span>
      </Link>
    </section>
  );
}
