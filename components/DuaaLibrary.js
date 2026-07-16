"use client";
import { useEffect, useRef, useState } from "react";
import { DUAS } from "@/lib/dhikrData";
import { useToast } from "@/components/Toast";

const CATEGORIES = { deceased:"أدعية للمتوفى", quran_completion:"دعاء ختم القرآن", parents:"أدعية للوالدين", morning:"أذكار الصباح", evening:"أذكار المساء", sleep:"أذكار النوم", names:"أسماء الله الحسنى" };

export default function DuaaLibrary() {
  const notify = useToast();
  const [category,setCategory] = useState("deceased");
  const [favorites,setFavorites] = useState([]);
  const [speakingId,setSpeakingId] = useState(null);
  const audioRef=useRef(null);
  const speechRun=useRef(0);
  useEffect(()=>{ try { setFavorites(JSON.parse(localStorage.getItem("duaa_favorites")||"[]")); } catch {} },[]);
  useEffect(()=>{ const requested=new URLSearchParams(window.location.search).get("category"); if(requested && DUAS[requested]) setCategory(requested); },[]);
  const idOf=(d)=>`${category}:${d.title}`;
  const copy=(text)=>navigator.clipboard?.writeText(text).then(()=>notify("تم نسخ الدعاء","success"));
  const share=(d)=>navigator.share ? navigator.share({title:d.title,text:d.text}).catch(()=>{}) : copy(d.text);
  const splitText=(text)=>{
    const words=text.split(/\s+/); const chunks=[]; let chunk="";
    for(const word of words){ const next=chunk?`${chunk} ${word}`:word; if(next.length>180&&chunk){chunks.push(chunk);chunk=word;}else chunk=next; }
    if(chunk)chunks.push(chunk); return chunks;
  };
  const stopAudio=()=>{ speechRun.current+=1; audioRef.current?.pause(); audioRef.current=null; setSpeakingId(null); };
  const speak=async(d)=>{
    const id=idOf(d); if(speakingId===id)return stopAudio(); stopAudio(); const run=speechRun.current; setSpeakingId(id);
    try{
      for(const chunk of splitText(d.text)){
        if(run!==speechRun.current)break;
        const audio=new Audio(`/api/tts?text=${encodeURIComponent(chunk)}`); audioRef.current=audio;
        await new Promise((resolve,reject)=>{audio.onended=resolve;audio.onpause=resolve;audio.onerror=reject;audio.play().catch(reject);});
      }
    }catch{ notify("تعذر تشغيل الصوت الآن، حاول مرة أخرى.","error"); }
    finally{ audioRef.current=null; setSpeakingId(null); }
  };
  const favorite=(d)=>{ const id=idOf(d); const next=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id]; setFavorites(next); localStorage.setItem("duaa_favorites",JSON.stringify(next)); };
  return <div className="container page"><h1 className="section-title">الأدعية والأذكار</h1>
    <div className="duaa-tabs">{Object.entries(CATEGORIES).map(([key,label])=><button key={key} className={`btn btn-sm ${category===key?"btn-primary":"btn-ghost"}`} onClick={()=>setCategory(key)}>{label}</button>)}</div>
    <div className="duaa-list">{(DUAS[category]||[]).map((d,i)=><article className="card moroccan-frame" key={`${d.title}-${i}`}><h3>{d.title}</h3><p>{d.text}</p>
      {d.audio && <audio controls preload="none" src={d.audio}>متصفحك لا يدعم تشغيل الصوت.</audio>}
      {d.source && <p><a href={d.source} target="_blank" rel="noreferrer">فتح المصدر أو التسجيل الصوتي</a></p>}
      {d.alternateSource && <p><a href={d.alternateSource} target="_blank" rel="noreferrer">دعاء ختم القرآن بصوت الشيخ محمد جبريل</a></p>}
      <div className="row"><button className={`btn btn-sm ${speakingId===idOf(d)?"btn-gold":"btn-ghost"}`} onClick={()=>speak(d)}>{speakingId===idOf(d)?"■ إيقاف":"🔊 استماع آلي"}</button><button className="btn btn-sm btn-ghost" onClick={()=>copy(d.text)}>نسخ</button><button className="btn btn-sm btn-ghost" onClick={()=>share(d)}>مشاركة</button><button className={`btn btn-sm ${favorites.includes(idOf(d))?"btn-gold":"btn-ghost"}`} onClick={()=>favorite(d)}>{favorites.includes(idOf(d))?"★":"☆"} مفضلة</button></div>
    </article>)}</div>
    {(category==="morning"||category==="evening"||category==="sleep") && <div className="card center" style={{marginTop:18}}><a href="https://hisnmuslim.com/i/ar/0" target="_blank" rel="noreferrer">المرجع: حصن المسلم</a></div>}
  </div>;
}
