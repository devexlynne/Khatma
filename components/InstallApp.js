"use client";

import { useEffect, useState } from "react";

export default function InstallApp() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const capture = (event) => { event.preventDefault(); setInstallPrompt(event); };
    const complete = () => { setInstalled(true); setInstallPrompt(null); };
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", complete);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", complete);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <section className="card install-card moroccan-frame">
      <div>
        <strong>احفظ نور الوالدين على شاشة هاتفك</strong>
        <p className="muted">افتح المنصة بسرعة كتطبيق مستقل من الشاشة الرئيسية.</p>
      </div>
      {installed ? <span className="badge completed">تم تثبيت التطبيق</span> : installPrompt ? (
        <button className="btn btn-primary" onClick={install}>تثبيت التطبيق</button>
      ) : <p className="muted install-help">من قائمة المتصفح اختر «إضافة إلى الشاشة الرئيسية» أو «تثبيت التطبيق».</p>}
    </section>
  );
}
