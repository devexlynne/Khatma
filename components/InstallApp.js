"use client";

import { useEffect, useState } from "react";

export default function InstallApp() {
  const [installPrompt,setInstallPrompt]=useState(null);
  const [installed,setInstalled]=useState(false);
  const [isIOS,setIsIOS]=useState(false);
  useEffect(()=>{
    const standalone=window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone===true;
    setInstalled(standalone);
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const capture=e=>{e.preventDefault();setInstallPrompt(e);};
    const complete=()=>{setInstalled(true);setInstallPrompt(null);};
    window.addEventListener("beforeinstallprompt",capture); window.addEventListener("appinstalled",complete);
    return()=>{window.removeEventListener("beforeinstallprompt",capture);window.removeEventListener("appinstalled",complete);};
  },[]);
  const install=async()=>{if(!installPrompt)return;await installPrompt.prompt();const result=await installPrompt.userChoice;if(result.outcome==="accepted")setInstalled(true);setInstallPrompt(null);};
  return <section className="card install-card moroccan-frame">
    <div><strong>احفظ نور الوالدين على شاشة هاتفك</strong><p className="muted">افتح المنصة بسرعة كتطبيق مستقل من الشاشة الرئيسية.</p></div>
    {installed?<span className="badge completed">تم تثبيت التطبيق</span>:installPrompt?<button className="btn btn-primary" onClick={install}>تثبيت التطبيق</button>:isIOS?
      <ol className="install-steps"><li>افتح الموقع في Safari.</li><li>اضغط زر المشاركة <b>□↑</b>.</li><li>اختر «إضافة إلى الشاشة الرئيسية» ثم «إضافة».</li></ol>:
      <p className="muted install-help">من قائمة المتصفح اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».</p>}
  </section>;
}
