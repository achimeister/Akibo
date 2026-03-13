import { useState, useMemo, useEffect, useRef } from "react";

const MONTHS = [
  "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
  "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"
];
const CATEGORIES = ["Sopravvivenza","Optional","Cultura","Extra"];

const INITIAL_DATA = {
  Febbraio: {
    entrate: [{ id:1, data:"2024-02-01", voce:"Stipendio", importo:3314.07 }],
    usciteFisse: [
      { id:1, voce:"Affitto/mutuo", importo:550 },
      { id:2, voce:"Auto",          importo:170 },
      { id:3, voce:"Luce + Gas",    importo:160 },
      { id:4, voce:"Fabio",         importo:120 },
      { id:5, voce:"Cellulare",     importo:10  },
      { id:6, voce:"Parcheggio",    importo:50  },
    ],
    cassaforte: 1000,
    transazioni: [
      { id:1,  data:"2024-02-01", voce:"Benzina",                 importo:80,     categoria:"Sopravvivenza", settimana:5 },
      { id:2,  data:"2024-02-01", voce:"Spesa Iper",               importo:47.10,  categoria:"Sopravvivenza", settimana:5 },
      { id:3,  data:"2024-02-02", voce:"Spesa Esselunga",          importo:19.85,  categoria:"Sopravvivenza", settimana:5 },
      { id:4,  data:"2024-02-07", voce:"Benzina",                  importo:74.11,  categoria:"Sopravvivenza", settimana:6 },
      { id:5,  data:"2024-02-09", voce:"Spesa Iper",               importo:54.35,  categoria:"Sopravvivenza", settimana:6 },
      { id:6,  data:"2024-02-07", voce:"Cena WeCoVa",              importo:30,     categoria:"Optional",      settimana:6 },
      { id:7,  data:"2024-02-07", voce:"Fotoritocco",              importo:7.58,   categoria:"Optional",      settimana:6 },
      { id:8,  data:"2024-02-09", voce:"Colazione",                importo:4.30,   categoria:"Optional",      settimana:6 },
      { id:9,  data:"2024-02-09", voce:"Aperitivo",                importo:3.50,   categoria:"Optional",      settimana:6 },
      { id:10, data:"2024-02-12", voce:"Parcheggio",               importo:3,      categoria:"Optional",      settimana:7 },
      { id:11, data:"2024-02-12", voce:"Lonely Planet Thailandia", importo:31,     categoria:"Cultura",       settimana:7 },
      { id:12, data:"2024-02-13", voce:"Borse Moto",               importo:470.27, categoria:"Extra",         settimana:7 },
    ],
  },
};

const emptyMonth = () => ({ entrate:[], usciteFisse:[], cassaforte:0, transazioni:[] });

const C = {
  cream:"#FFF7CD", peach:"#FDC3A1", salmon:"#FB9B8F", pink:"#F57799",
  navy:"#355872",  blue:"#7AAACE",  sky:"#9CD5FF",    offwhite:"#F7F8F0",
  ink:"#2C3E50",   inkMid:"#567085",inkLight:"#92ABBE",
  border:"#D9EBF7",shadow:"rgba(53,88,114,0.10)",
  green:"#4A9E6B", greenBg:"#E8FAF0",
};

const CAT = {
  Sopravvivenza:{ color:C.salmon, bg:"#FDE8E8", icon:"🛒" },
  Optional:     { color:C.peach,  bg:"#FEF1E6", icon:"✨" },
  Cultura:      { color:C.blue,   bg:"#E6F3FB", icon:"📚" },
  Extra:        { color:C.pink,   bg:"#FDEAF1", icon:"🎲" },
};

const fEur = n => `€ ${Number(n||0).toFixed(2).replace(".",",")}`;
const FONT_H = "'Zen Maru Gothic','Kosugi Maru',serif";
const FONT_B = "'Kosugi Maru','Zen Maru Gothic',sans-serif";

// ── Buddha SVG ────────────────────────────────────────────
function BuddhaLogo({ size=40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="22" r="18" fill="#FFF7CD" stroke="#FDC3A1" strokeWidth="2" opacity=".8"/>
      <circle cx="40" cy="22" r="14" fill="none" stroke="#F57799" strokeWidth="1" strokeDasharray="3 2" opacity=".6"/>
      <ellipse cx="40" cy="56" rx="22" ry="20" fill="#FDC3A1"/>
      <ellipse cx="40" cy="58" rx="18" ry="16" fill="#FFF7CD" opacity=".5"/>
      <circle cx="40" cy="22" r="13" fill="#FDC3A1"/>
      <ellipse cx="40" cy="10" rx="5" ry="4" fill="#FB9B8F"/>
      <path d="M34 21 Q36 19 38 21" stroke="#355872" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M42 21 Q44 19 46 21" stroke="#355872" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M35 26 Q40 30 45 26" stroke="#F57799" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <ellipse cx="27" cy="23" rx="3.5" ry="5" fill="#FDC3A1"/>
      <ellipse cx="53" cy="23" rx="3.5" ry="5" fill="#FDC3A1"/>
      <ellipse cx="27" cy="23" rx="2" ry="3" fill="#FB9B8F" opacity=".5"/>
      <ellipse cx="53" cy="23" rx="2" ry="3" fill="#FB9B8F" opacity=".5"/>
      <path d="M19 50 Q14 54 16 60" stroke="#FDC3A1" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M61 50 Q68 52 66 60" stroke="#FDC3A1" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <ellipse cx="68" cy="63" rx="9" ry="8" fill="#F57799"/>
      <ellipse cx="68" cy="63" rx="6" ry="5.5" fill="#FB9B8F" opacity=".4"/>
      <ellipse cx="76" cy="64" rx="3" ry="2.5" fill="#FB9B8F"/>
      <circle cx="75" cy="64" r=".8" fill="#F57799"/>
      <circle cx="77" cy="64" r=".8" fill="#F57799"/>
      <ellipse cx="68" cy="56" rx="2.5" ry="2" fill="#F57799" transform="rotate(-15 68 56)"/>
      <rect x="65" y="55" width="6" height="1.5" rx=".75" fill="#355872" opacity=".5"/>
      <ellipse cx="68" cy="53" rx="3" ry="1.5" fill="#FFF7CD" stroke="#FDC3A1" strokeWidth="1"/>
      <path d="M59 65 Q57 62 59 60" stroke="#F57799" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <rect x="62" y="69" width="3" height="4" rx="1.5" fill="#FB9B8F"/>
      <rect x="71" y="69" width="3" height="4" rx="1.5" fill="#FB9B8F"/>
      <circle cx="40" cy="58" r="2.5" fill="#FB9B8F" opacity=".6"/>
      <path d="M24 48 Q30 52 36 60" stroke="#FB9B8F" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".6"/>
      <path d="M56 48 Q50 52 44 60" stroke="#FB9B8F" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".6"/>
      <circle cx="28" cy="75" r="3" fill="#FDC3A1" opacity=".7"/>
      <circle cx="40" cy="77" r="3.5" fill="#FDC3A1" opacity=".7"/>
      <circle cx="52" cy="75" r="3" fill="#FDC3A1" opacity=".7"/>
    </svg>
  );
}

// ── Toast notification ────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(()=>{ const t=setTimeout(onDone,4000); return()=>clearTimeout(t); },[]);
  return (
    <div style={{
      position:"fixed", bottom:30, left:"50%", transform:"translateX(-50%)",
      background:C.navy, color:"#fff", borderRadius:16, padding:"14px 24px",
      fontFamily:FONT_H, fontWeight:700, fontSize:14, zIndex:100,
      boxShadow:`0 8px 30px rgba(53,88,114,.35)`,
      display:"flex", alignItems:"center", gap:12, maxWidth:420,
      animation:"slideUp .3s ease",
    }}>
      <span style={{ fontSize:24 }}>🐷</span>
      <span>{msg}</span>
    </div>
  );
}

// ── UI components ─────────────────────────────────────────
function Card({ children, style={} }) {
  return <div style={{ background:C.offwhite, border:`1.5px solid ${C.border}`,
    borderRadius:20, boxShadow:`0 4px 18px ${C.shadow}`, ...style }}>{children}</div>;
}

function ModalBox({ title, accent, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,62,80,.38)",
      zIndex:50, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:C.offwhite, border:`2px solid ${accent||C.blue}`,
        borderRadius:24, padding:28, width:"90%", maxWidth:430,
        boxShadow:`0 16px 48px ${C.shadow}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <span style={{ fontFamily:FONT_H, fontSize:17, fontWeight:700, color:C.ink }}>{title}</span>
          <button onClick={onClose} style={{ background:"none", border:"none",
            color:C.inkLight, fontSize:26, cursor:"pointer", lineHeight:1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const iStyle = { width:"100%", background:C.cream, border:`1.5px solid ${C.border}`,
  borderRadius:12, color:C.ink, padding:"9px 13px", fontSize:14,
  fontFamily:FONT_B, outline:"none", boxSizing:"border-box" };

function Inp({ label, ...p }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:11, color:C.inkMid, marginBottom:5,
        fontFamily:FONT_H, letterSpacing:.5, fontWeight:700 }}>{label}</label>
      <input {...p} style={iStyle}/>
    </div>
  );
}
function Sel({ label, options, ...p }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:11, color:C.inkMid, marginBottom:5,
        fontFamily:FONT_H, letterSpacing:.5, fontWeight:700 }}>{label}</label>
      <select {...p} style={iStyle}>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function Btn({ children, onClick, color, ghost=false, small=false, disabled=false }) {
  const bg=color||C.pink;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background:ghost?"transparent":disabled?"#ccc":bg,
      border:`2px solid ${disabled?"#ccc":bg}`,
      color:ghost?bg:"#fff", padding:small?"5px 14px":"9px 22px",
      borderRadius:99, cursor:disabled?"not-allowed":"pointer",
      fontFamily:FONT_H, fontWeight:700, fontSize:small?11:13,
      boxShadow:ghost||disabled?"none":`0 4px 14px ${C.shadow}`,
      transition:"all .15s", whiteSpace:"nowrap", opacity:disabled?.6:1,
    }}>{children}</button>
  );
}
function KpiCard({ label, value, icon, color, bg, sub }) {
  return (
    <Card style={{ padding:"18px 20px", background:bg||C.offwhite }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <span style={{ fontSize:11, color:C.inkMid, fontFamily:FONT_H, fontWeight:700 }}>{label}</span>
        <span style={{ fontSize:22 }}>{icon}</span>
      </div>
      <div style={{ fontSize:21, fontWeight:700, color:color||C.ink, marginTop:8, fontFamily:FONT_H }}>{fEur(value)}</div>
      {sub && <div style={{ fontSize:10, color:C.inkLight, marginTop:4, fontFamily:FONT_B }}>{sub}</div>}
    </Card>
  );
}

// ── Main App ─────────────────────────────────────────────
export default function AkiboApp() {
  // ── localStorage persistence ───────────────────────────
  const [data, setData] = useState(()=>{
    try {
      const saved = localStorage.getItem("akibo_data");
      if(saved) return JSON.parse(saved);
    } catch(e) {}
    const d={};
    MONTHS.forEach(m=>d[m]=INITIAL_DATA[m]||emptyMonth());
    return d;
  });

  // Auto-save whenever data changes
  useEffect(()=>{
    try { localStorage.setItem("akibo_data", JSON.stringify(data)); } catch(e) {}
  },[data]);

  const [month,     setMonth]     = useState(()=>localStorage.getItem("akibo_month")||"Febbraio");
  const [tab,       setTab]       = useState("dashboard");
  const [modal,     setModal]     = useState(null);
  const [form,      setForm]      = useState({});
  const [quickOpen,          setQuickOpen]          = useState(false);
  const [toast,              setToast]              = useState(null);
  const [dismissedCarryover, setDismissedCarryover] = useState({});

  // Save selected month
  useEffect(()=>{ localStorage.setItem("akibo_month", month); },[month]);

  // ── Per-month calculations ─────────────────────────────
  // Calculate cumulative cassaforte and residuo carryover for every month
  const monthStats = useMemo(()=>{
    const stats={};
    let cumulativeCassa = 0;    // running piggy bank total
    let carryover       = 0;    // residuo carried from previous month

    MONTHS.forEach(m=>{
      const md = data[m];
      const totIn  = md.entrate.reduce((a,t)=>a+Number(t.importo||0),0);
      const totFix = md.usciteFisse.reduce((a,t)=>a+Number(t.importo||0),0);
      const totVar = md.transazioni.reduce((a,t)=>a+Number(t.importo||0),0);
      // Budget disponibile = entrate - fisse - cassaforte mensile + residuo portato dal mese prima
      const budgetDisp = totIn - totFix - md.cassaforte + carryover;
      const residuo    = budgetDisp - totVar;
      cumulativeCassa += md.cassaforte;

      stats[m] = { totIn, totFix, totVar, budgetDisp, residuo, carryover, cumulativeCassa };
      carryover = residuo > 0 ? residuo : 0; // only carry positive residual
    });
    return stats;
  },[data]);

  const ms = monthStats[month];
  const md = data[month];

  const byCat = useMemo(()=>{
    const a={}; CATEGORIES.forEach(c=>a[c]=0);
    md.transazioni.forEach(t=>{ a[t.categoria]=(a[t.categoria]||0)+Number(t.importo||0); });
    return a;
  },[md]);

  const byWeek = useMemo(()=>{
    const a={};
    md.transazioni.forEach(t=>{ a[t.settimana]=(a[t.settimana]||0)+Number(t.importo||0); });
    return a;
  },[md]);

  // Build calendar weeks for the selected month (past + current only)
  const monthWeeks = useMemo(()=>{
    const mIdx = MONTHS.indexOf(month);
    const year = mIdx <= 1 ? 2024 : new Date().getFullYear();
    const today = new Date(); today.setHours(0,0,0,0);
    const firstDay = new Date(year, mIdx, 1);
    const lastDay  = new Date(year, mIdx + 1, 0);
    const weeks = [];
    // Monday on or before the 1st
    const cursor = new Date(firstDay);
    const dow = (cursor.getDay() + 6) % 7;
    cursor.setDate(cursor.getDate() - dow);

    while(cursor <= lastDay) {
      const mon = new Date(cursor);
      const sun = new Date(cursor); sun.setDate(sun.getDate() + 6);
      // ISO week number
      const tmp = new Date(mon); tmp.setDate(tmp.getDate() + 3 - (tmp.getDay()+6)%7);
      const w1 = new Date(tmp.getFullYear(), 0, 4);
      const weekNum = 1 + Math.round(((tmp - w1)/86400000 - 3 + (w1.getDay()+6)%7)/7);
      // Only past or current weeks
      if(mon <= today) {
        const fmt = d => String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0');
        const isCurrent = today >= mon && today <= sun;
        weeks.push({ weekNum, label:`${fmt(mon)} – ${fmt(sun)}`, isCurrent });
      }
      cursor.setDate(cursor.getDate() + 7);
    }
    return weeks;
  },[month]);

  const upd   = fn=>setData(d=>({...d,[month]:fn(d[month])}));
  const open  = type=>{ setModal(type); setForm({}); setQuickOpen(false); };
  const close = ()=>{ setModal(null); setForm({}); };

  // Auto-compute settimana ISO (week number of year) from a date string
  const weekOfYear = dateStr => {
    if(!dateStr) return null;
    const d = new Date(dateStr);
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  };

  const ff = k => e => {
    const val = e.target.value;
    if(k==="data") {
      const wk = weekOfYear(val);
      setForm(f=>({...f, data:val, ...(wk ? {settimana:wk} : {})}));
    } else {
      setForm(f=>({...f,[k]:val}));
    }
  };

  const saveEntrata = ()=>{
    if(!form.voce||!form.importo) return;
    upd(m=>({...m,entrate:[...m.entrate,{id:Date.now(),data:form.data||"",voce:form.voce,importo:parseFloat(form.importo)}]}));
    close();
  };
  const saveFissa = ()=>{
    if(!form.voce||!form.importo) return;
    upd(m=>({...m,usciteFisse:[...m.usciteFisse,{id:Date.now(),voce:form.voce,importo:parseFloat(form.importo)}]}));
    close();
  };
  const saveTx = ()=>{
    if(!form.voce||!form.importo||!form.categoria) return;
    const importo = parseFloat(form.importo);
    // Check if this transaction would push into the cassaforte
    const newTotVar = ms.totVar + importo;
    const newResiduo = ms.budgetDisp - newTotVar;
    if(newResiduo < 0) {
      setToast("Attenzione! Stai andando oltre il tuo budget. Dovrai attingere ai risparmi del salvadanaio 🐷 — ci stai davvero pensando?");
    }
    upd(m=>({...m,transazioni:[...m.transazioni,{id:Date.now(),data:form.data||"",voce:form.voce,
      importo,categoria:form.categoria,settimana:parseInt(form.settimana)||1}]}));
    close();
  };

  // Cassaforte: can only be set up to totIn - totFix (can't create money), 
  // but CAN go negative if user adds a big expense (which triggers toast)
  const setCassaforte = val=>{
    const newVal = parseFloat(val)||0;
    const prevCassa = md.cassaforte;
    // If increasing cassaforte beyond available residuo → warn
    const availableToSave = ms.budgetDisp + prevCassa; // re-add old cassaforte to see what's free
    if(newVal > availableToSave && newVal > prevCassa) {
      setToast("Stai destinando più denaro di quello disponibile al salvadanaio. Controlla il tuo residuo prima di procedere!");
      return;
    }
    // If user is effectively withdrawing from cassa (lowering it) to cover expenses
    if(newVal < 0) {
      setToast("Il salvadanaio non può essere negativo. Se hai bisogno di fondi extra, registra un'entrata straordinaria.");
      return;
    }
    upd(m=>({...m,cassaforte:newVal}));
  };

  // Move residuo to cassaforte
  const [residuoToAdd, setResiduoToAdd] = useState("");
  const addResiduoToCassa = ()=>{
    const amt = parseFloat(residuoToAdd)||0;
    if(amt<=0) return;
    if(amt > ms.residuo) {
      setToast("Non puoi aggiungere più del residuo disponibile al salvadanaio!");
      return;
    }
    // Add to cassaforte of current month
    upd(m=>({...m,cassaforte:m.cassaforte+amt}));
    setResiduoToAdd("");
    close();
  };

  const delTx  = id=>upd(m=>({...m,transazioni:m.transazioni.filter(t=>t.id!==id)}));
  const delIn  = id=>upd(m=>({...m,entrate:m.entrate.filter(t=>t.id!==id)}));
  const delFix = id=>upd(m=>({...m,usciteFisse:m.usciteFisse.filter(t=>t.id!==id)}));

  // ── Export / Import dati ─────────────────────────────
  const exportData = ()=>{
    const blob = new Blob([JSON.stringify({akibo:true,v:1,data},null,2)],{type:"application/json"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href=url; a.download=`akibo_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    setToast("Backup esportato! 🎉");
  };
  const importData = e=>{
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev=>{
      try {
        const parsed = JSON.parse(ev.target.result);
        if(!parsed.akibo){ setToast("File non valido — usa un backup Akibo!"); return; }
        setData(parsed.data);
        setToast("Dati importati con successo! 🐷");
      } catch { setToast("Errore nella lettura del file."); }
    };
    reader.readAsText(file);
    e.target.value="";
  };
  const importRef = useRef();

  const maxCat  = Math.max(...Object.values(byCat),1);
  const pct     = ms.budgetDisp>0?Math.min(100,(ms.totVar/ms.budgetDisp)*100):0;

  const prevMonthIdx = MONTHS.indexOf(month)-1;
  const prevMonth    = prevMonthIdx>=0 ? MONTHS[prevMonthIdx] : null;
  const prevResiduo  = prevMonth ? monthStats[prevMonth].residuo : 0;

  const TABS = [["dashboard","📊 Dashboard"],["transazioni","💸 Transazioni"],["impostazioni","⚙️ Mese"]];

  return (
    <div style={{ fontFamily:FONT_B, background:C.cream, minHeight:"100vh", color:C.ink }}>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      <link href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700;900&family=Kosugi+Maru&display=swap" rel="stylesheet"/>

      {/* Toast */}
      {toast && <Toast msg={toast} onDone={()=>setToast(null)}/>}

      {/* Click-outside overlay for quick menu */}
      {quickOpen && <div onClick={()=>setQuickOpen(false)} style={{ position:"fixed",inset:0,zIndex:39 }}/>}

      {/* ── NAVBAR ── */}
      <div style={{ background:C.offwhite, borderBottom:`2px solid ${C.border}`,
        padding:"0 24px", display:"flex", alignItems:"center", gap:12, height:68,
        boxShadow:`0 3px 14px ${C.shadow}` }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <BuddhaLogo size={52}/>
          <div>
            <div style={{ fontFamily:FONT_H, fontWeight:900, fontSize:26, color:C.navy, letterSpacing:2, lineHeight:1 }}>AKIBO</div>
            <div style={{ fontFamily:FONT_H, fontWeight:700, fontSize:10, color:C.pink, letterSpacing:3, lineHeight:1, marginTop:2 }}>le tue finanze</div>
          </div>
        </div>

        {/* Quick Add button */}
        <div style={{ position:"relative", marginLeft:10 }}>
          <button onClick={()=>setQuickOpen(q=>!q)} style={{
            display:"flex", alignItems:"center", gap:7,
            background:`linear-gradient(135deg,${C.peach},${C.pink})`,
            border:"none", borderRadius:99, padding:"9px 20px",
            cursor:"pointer", fontFamily:FONT_H, fontWeight:700,
            fontSize:14, color:"#fff", boxShadow:`0 4px 14px ${C.pink}66`,
          }}>
            <span style={{ fontSize:18, lineHeight:1 }}>＋</span> Aggiungi
          </button>
          {quickOpen && (
            <div style={{ position:"absolute", top:"calc(100% + 10px)", left:0,
              background:C.offwhite, border:`2px solid ${C.border}`,
              borderRadius:16, overflow:"hidden", zIndex:40,
              boxShadow:`0 8px 30px ${C.shadow}`, minWidth:200 }}>
              <button onClick={()=>{ setQuickOpen(false); open("tx"); }} style={{
                width:"100%", padding:"13px 18px", background:"none", border:"none",
                cursor:"pointer", display:"flex", alignItems:"center", gap:10,
                fontFamily:FONT_H, fontWeight:700, fontSize:13, color:C.ink,
                borderBottom:`1.5px solid ${C.border}`,
              }}
                onMouseEnter={e=>e.currentTarget.style.background=CAT.Extra.bg}
                onMouseLeave={e=>e.currentTarget.style.background="none"}>
                <span style={{ fontSize:20 }}>💸</span>
                <div style={{ textAlign:"left" }}>
                  <div>Nuova spesa</div>
                  <div style={{ fontSize:10, color:C.inkLight, fontWeight:400 }}>Sopravvivenza, Optional…</div>
                </div>
              </button>
              <button onClick={()=>{ setQuickOpen(false); open("entrata"); }} style={{
                width:"100%", padding:"13px 18px", background:"none", border:"none",
                cursor:"pointer", display:"flex", alignItems:"center", gap:10,
                fontFamily:FONT_H, fontWeight:700, fontSize:13, color:C.ink,
                borderBottom:`1.5px solid ${C.border}`,
              }}
                onMouseEnter={e=>e.currentTarget.style.background=C.greenBg}
                onMouseLeave={e=>e.currentTarget.style.background="none"}>
                <span style={{ fontSize:20 }}>💰</span>
                <div style={{ textAlign:"left" }}>
                  <div>Nuova entrata</div>
                  <div style={{ fontSize:10, color:C.inkLight, fontWeight:400 }}>Stipendio, bonus…</div>
                </div>
              </button>
              <button onClick={()=>{ setQuickOpen(false); open("fissa"); }} style={{
                width:"100%", padding:"13px 18px", background:"none", border:"none",
                cursor:"pointer", display:"flex", alignItems:"center", gap:10,
                fontFamily:FONT_H, fontWeight:700, fontSize:13, color:C.ink,
              }}
                onMouseEnter={e=>e.currentTarget.style.background="#FDE8E8"}
                onMouseLeave={e=>e.currentTarget.style.background="none"}>
                <span style={{ fontSize:20 }}>🔒</span>
                <div style={{ textAlign:"left" }}>
                  <div>Uscita fissa mensile</div>
                  <div style={{ fontSize:10, color:C.inkLight, fontWeight:400 }}>Affitto, abbonamenti…</div>
                </div>
              </button>
            </div>
          )}
        </div>

        <div style={{ flex:1 }}/>

        {/* Export / Import */}
        <input ref={importRef} type="file" accept=".json" onChange={importData} style={{display:"none"}}/>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={exportData} title="Esporta backup" style={{
            background:"transparent", border:`1.5px solid ${C.border}`,
            borderRadius:99, padding:"7px 13px", cursor:"pointer",
            fontFamily:FONT_H, fontWeight:700, fontSize:12, color:C.inkMid,
            display:"flex", alignItems:"center", gap:5,
          }}>
            <span>💾</span><span style={{display:"none"}}>Backup</span>
          </button>
          <button onClick={()=>importRef.current.click()} title="Importa backup" style={{
            background:"transparent", border:`1.5px solid ${C.border}`,
            borderRadius:99, padding:"7px 13px", cursor:"pointer",
            fontFamily:FONT_H, fontWeight:700, fontSize:12, color:C.inkMid,
            display:"flex", alignItems:"center", gap:5,
          }}>
            <span>📂</span><span style={{display:"none"}}>Importa</span>
          </button>
        </div>

        {/* Month dropdown */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:11, color:C.inkMid, fontFamily:FONT_H, fontWeight:700 }}>Mese:</span>
          <select value={month} onChange={e=>setMonth(e.target.value)} style={{
            background:C.navy, color:C.sky, border:`1.5px solid ${C.blue}`,
            borderRadius:12, padding:"7px 14px", fontFamily:FONT_H, fontWeight:700,
            fontSize:13, cursor:"pointer", outline:"none",
            boxShadow:`0 3px 10px ${C.shadow}`,
          }}>
            {MONTHS.map(m=>(
              <option key={m} value={m} style={{ background:C.offwhite, color:C.ink }}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ background:C.offwhite, borderBottom:`2px solid ${C.border}`, padding:"0 24px", display:"flex" }}>
        {TABS.map(([key,lbl])=>(
          <button key={key} onClick={()=>setTab(key)} style={{
            background:"none", border:"none",
            borderBottom:`3px solid ${tab===key?C.pink:"transparent"}`,
            color:tab===key?C.pink:C.inkLight,
            padding:"14px 18px", cursor:"pointer",
            fontFamily:FONT_H, fontWeight:700, fontSize:13,
            transition:"color .15s",
          }}>{lbl}</button>
        ))}
      </div>

      {/* ── PAGE ── */}
      <div style={{ padding:"26px 24px", maxWidth:980, margin:"0 auto" }}>

        {/* ══ DASHBOARD ══ */}
        {tab==="dashboard" && <>

          {/* Carryover banner */}
          {ms.carryover>0 && !dismissedCarryover[month] && (
            <div style={{ background:`linear-gradient(90deg,${C.sky}44,${C.blue}22)`,
              border:`1.5px solid ${C.blue}`, borderRadius:14, padding:"12px 18px",
              marginBottom:18, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:22 }}>🔄</span>
              <div style={{ flex:1 }}>
                <span style={{ fontFamily:FONT_H, fontWeight:700, fontSize:13, color:C.navy }}>
                  Residuo portato da {prevMonth}:&nbsp;
                </span>
                <span style={{ fontFamily:FONT_H, fontWeight:700, fontSize:15, color:C.green }}>
                  {fEur(ms.carryover)}
                </span>
                <span style={{ fontSize:11, color:C.inkMid, marginLeft:8, fontFamily:FONT_B }}>
                  già incluso nel tuo budget disponibile
                </span>
              </div>
              <button
                onClick={()=>setDismissedCarryover(d=>({...d,[month]:true}))}
                style={{
                  background:C.navy, border:"none", color:C.sky,
                  padding:"6px 16px", borderRadius:99, cursor:"pointer",
                  fontFamily:FONT_H, fontWeight:700, fontSize:11,
                  boxShadow:`0 2px 8px ${C.shadow}`, whiteSpace:"nowrap",
                }}>
                ✓ Ok, ho capito
              </button>
            </div>
          )}

          {/* KPI */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
            <KpiCard label="Entrate"       value={ms.totIn}  icon="💰" color={C.green} bg={C.greenBg}/>
            <KpiCard label="Uscite fisse"  value={ms.totFix} icon="🔒" color={C.salmon} bg="#FDE8E8"/>
            <KpiCard label="Budget disponibile" value={ms.budgetDisp} icon="🎯" color={C.navy} bg={`${C.sky}44`}
              sub={ms.carryover>0?`incl. ${fEur(ms.carryover)} da ${prevMonth}`:undefined}/>
            <KpiCard label="Residuo" value={ms.residuo} icon={ms.residuo>=0?"🌸":"⚠️"}
              color={ms.residuo>=0?C.green:C.pink} bg={ms.residuo>=0?C.greenBg:"#FDEAF1"}/>
          </div>

          {/* Budget bar */}
          <Card style={{ padding:"20px 24px", marginBottom:22 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div>
                <span style={{ fontFamily:FONT_H, fontWeight:700, fontSize:15, color:C.navy }}>
                  Utilizzo budget — {month}
                </span>
                <span style={{ fontSize:11, color:C.inkLight, marginLeft:10 }}>
                  {fEur(ms.totVar)} su {fEur(ms.budgetDisp)}
                </span>
              </div>
              <span style={{ fontFamily:FONT_H, fontWeight:700, fontSize:20,
                color:pct>85?C.pink:pct>60?C.peach:C.blue }}>{Math.round(pct)}%</span>
            </div>
            <div style={{ height:20, background:C.cream, borderRadius:99, overflow:"hidden", border:`1.5px solid ${C.border}` }}>
              <div style={{ height:"100%", width:`${pct}%`,
                background:`linear-gradient(90deg,${C.peach},${C.salmon},${C.pink})`,
                borderRadius:99, transition:"width .7s ease", boxShadow:`2px 0 10px ${C.pink}66` }}/>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
              <span style={{ fontSize:11, color:C.inkLight }}>🟠 Speso: {fEur(ms.totVar)}</span>
              <span style={{ fontSize:11, color:C.inkLight }}>🔵 Residuo: {fEur(ms.residuo)}</span>
            </div>
          </Card>

          {/* Charts */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:22 }}>
            <Card style={{ padding:"20px 22px" }}>
              <div style={{ fontFamily:FONT_H, fontWeight:700, fontSize:14, color:C.navy, marginBottom:18 }}>Spese per categoria</div>
              {CATEGORIES.map(cat=>{
                const conf=CAT[cat]; const val=byCat[cat]||0;
                return (
                  <div key={cat} style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:30,height:30,borderRadius:10,background:conf.bg,
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:15 }}>{conf.icon}</div>
                        <span style={{ fontSize:13, color:C.ink, fontFamily:FONT_B }}>{cat}</span>
                      </div>
                      <span style={{ fontSize:13, fontWeight:700, color:conf.color, fontFamily:FONT_H }}>{fEur(val)}</span>
                    </div>
                    <div style={{ height:10, background:C.cream, borderRadius:99, overflow:"hidden", border:`1px solid ${C.border}` }}>
                      <div style={{ height:"100%", width:`${(val/maxCat)*100}%`, background:conf.color, borderRadius:99, transition:"width .5s" }}/>
                    </div>
                  </div>
                );
              })}
            </Card>

            <Card style={{ padding:"20px 22px" }}>
              <div style={{ fontFamily:FONT_H, fontWeight:700, fontSize:14, color:C.navy, marginBottom:18 }}>Spese per settimana</div>
              {monthWeeks.length===0 && <span style={{ fontSize:12, color:C.inkLight, fontStyle:"italic" }}>Nessuna settimana disponibile 🌿</span>}
              {monthWeeks.map(({weekNum, label, isCurrent})=>{
                const v = byWeek[weekNum]||0;
                const maxW = Math.max(...monthWeeks.map(w=>byWeek[w.weekNum]||0),1);
                return (
                  <div key={weekNum} style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:30,height:30,borderRadius:10,
                          background:isCurrent?C.navy:`${C.sky}55`,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:11,fontWeight:700,color:isCurrent?C.sky:C.navy,fontFamily:FONT_H }}>
                          {weekNum}
                        </div>
                        <div>
                          <div style={{ fontSize:12, color:C.ink, fontFamily:FONT_H, fontWeight:700, lineHeight:1.2 }}>
                            Sett. {weekNum}{isCurrent && <span style={{ marginLeft:6, fontSize:9, background:C.pink, color:"#fff", padding:"1px 7px", borderRadius:99, fontFamily:FONT_H }}>oggi</span>}
                          </div>
                          <div style={{ fontSize:10, color:C.inkLight, fontFamily:FONT_B, marginTop:1 }}>{label}</div>
                        </div>
                      </div>
                      <span style={{ fontSize:13, fontWeight:700, color:v>0?C.blue:C.inkLight, fontFamily:FONT_H }}>{fEur(v)}</span>
                    </div>
                    <div style={{ height:10, background:C.cream, borderRadius:99, overflow:"hidden", border:`1px solid ${C.border}` }}>
                      <div style={{ height:"100%", width:`${(v/maxW)*100}%`,
                        background:isCurrent?`linear-gradient(90deg,${C.peach},${C.pink})`:`linear-gradient(90deg,${C.sky},${C.blue})`,
                        borderRadius:99, transition:"width .5s" }}/>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>

          {/* Riepilogo + Cassaforte totale */}
          <div style={{ display:"grid", gridTemplateColumns:"3fr 2fr", gap:14 }}>
            <div style={{ background:`linear-gradient(120deg,${C.cream},${C.offwhite})`,
              border:`1.5px solid ${C.border}`, borderRadius:20, padding:"20px 24px",
              boxShadow:`0 4px 18px ${C.shadow}` }}>
              <div style={{ fontFamily:FONT_H, fontWeight:700, fontSize:13, color:C.navy, marginBottom:14 }}>💼 Riepilogo {month}</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
                {[
                  { lbl:"Entrate",      val:ms.totIn,        icon:"💰", c:C.green,  bg:C.greenBg },
                  { lbl:"Uscite fisse", val:ms.totFix,       icon:"🔒", c:C.salmon, bg:"#FDE8E8" },
                  { lbl:"Cassaforte",   val:md.cassaforte,   icon:"🐷", c:C.navy,   bg:`${C.sky}33` },
                  { lbl:"Variabili",    val:ms.totVar,       icon:"🛍️", c:C.pink,   bg:"#FDEAF1" },
                ].map(x=>(
                  <div key={x.lbl} style={{ background:x.bg, borderRadius:14, padding:"12px 16px", border:`1.5px solid ${C.border}` }}>
                    <div style={{ fontSize:10, color:C.inkMid, fontFamily:FONT_H, fontWeight:700 }}>{x.icon} {x.lbl}</div>
                    <div style={{ fontSize:17, fontWeight:700, color:x.c, marginTop:4, fontFamily:FONT_H }}>{fEur(x.val)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cassaforte cumulativa */}
            <Card style={{ padding:"20px 22px", background:`linear-gradient(135deg,${C.sky}33,${C.offwhite})` }}>
              <div style={{ fontFamily:FONT_H, fontWeight:700, fontSize:13, color:C.navy, marginBottom:6 }}>🐷 Salvadanaio totale</div>
              <div style={{ fontSize:10, color:C.inkLight, fontFamily:FONT_B, marginBottom:14 }}>
                Somma di tutti i mesi fino a {month}
              </div>
              <div style={{ fontSize:30, fontWeight:700, color:C.navy, fontFamily:FONT_H, marginBottom:14 }}>
                {fEur(ms.cumulativeCassa)}
              </div>
              {/* Add residuo to cassaforte widget */}
              {ms.residuo > 0 && (
                <div style={{ background:C.greenBg, borderRadius:12, padding:"12px 14px", border:`1px solid #B8E8CC` }}>
                  <div style={{ fontSize:11, color:C.green, fontFamily:FONT_H, fontWeight:700, marginBottom:8 }}>
                    🌱 Hai {fEur(ms.residuo)} di residuo!
                  </div>
                  <div style={{ fontSize:11, color:C.inkMid, fontFamily:FONT_B, marginBottom:10 }}>
                    Vuoi aggiungerne una parte al salvadanaio?
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <input type="number" placeholder="€" value={residuoToAdd}
                      onChange={e=>setResiduoToAdd(e.target.value)}
                      style={{ ...iStyle, flex:1, padding:"6px 10px", fontSize:12,
                        background:C.offwhite, border:`1.5px solid #B8E8CC` }}/>
                    <button onClick={addResiduoToCassa} style={{
                      background:C.green, border:"none", color:"#fff", padding:"7px 14px",
                      borderRadius:99, cursor:"pointer", fontFamily:FONT_H, fontWeight:700, fontSize:11,
                    }}>Aggiungi</button>
                  </div>
                  <div style={{ fontSize:10, color:C.inkLight, marginTop:6, fontFamily:FONT_B }}>
                    Max: {fEur(ms.residuo)}
                  </div>
                </div>
              )}
              {ms.residuo <= 0 && (
                <div style={{ fontSize:11, color:C.inkLight, fontStyle:"italic", fontFamily:FONT_B }}>
                  Nessun residuo disponibile questo mese.
                </div>
              )}
            </Card>
          </div>
        </>}

        {/* ══ TRANSAZIONI ══ */}
        {tab==="transazioni" && <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
            <span style={{ fontFamily:FONT_H, fontWeight:700, fontSize:20, color:C.navy }}>
              💸 Transazioni — {month}
            </span>
            <Btn onClick={()=>open("tx")} color={C.pink}>＋ Aggiungi spesa</Btn>
          </div>

          {CATEGORIES.map(cat=>{
            const conf=CAT[cat];
            const items=md.transazioni.filter(t=>t.categoria===cat);
            const tot=items.reduce((a,t)=>a+Number(t.importo),0);
            return (
              <div key={cat} style={{ marginBottom:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px",
                  background:conf.bg, borderRadius:14, border:`1.5px solid ${conf.color}55`, marginBottom:10 }}>
                  <div style={{ width:34,height:34,borderRadius:10,background:C.offwhite,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{conf.icon}</div>
                  <span style={{ fontFamily:FONT_H, fontWeight:700, fontSize:15, color:conf.color }}>{cat}</span>
                  <div style={{ flex:1 }}/>
                  <span style={{ fontSize:11, color:C.inkMid, background:C.offwhite,
                    padding:"2px 10px", borderRadius:99, fontFamily:FONT_H, fontWeight:700 }}>{items.length} voci</span>
                  <span style={{ fontFamily:FONT_H, fontWeight:700, fontSize:16, color:C.ink }}>{fEur(tot)}</span>
                </div>
                {items.length===0 && <div style={{ fontSize:12, color:C.inkLight, padding:"4px 16px", fontStyle:"italic" }}>Nessuna spesa qui 🌿</div>}
                {items.map(t=>(
                  <div key={t.id} style={{ display:"flex", alignItems:"center", background:C.offwhite,
                    border:`1.5px solid ${C.border}`, borderRadius:16, padding:"12px 16px", marginBottom:8,
                    gap:12, boxShadow:`0 2px 10px ${C.shadow}` }}>
                    <div style={{ width:36,height:36,borderRadius:12,background:conf.bg,
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>{conf.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:C.ink, fontFamily:FONT_H }}>{t.voce}</div>
                      <div style={{ fontSize:11, color:C.inkLight, marginTop:2 }}>
                        {t.data?`📅 ${t.data}  ·  `:""}Settimana {t.settimana}
                      </div>
                    </div>
                    <span style={{ fontFamily:FONT_H, fontWeight:700, fontSize:15, color:conf.color }}>{fEur(t.importo)}</span>
                    <button onClick={()=>delTx(t.id)} style={{ background:`${conf.color}22`,
                      border:`1.5px solid ${conf.color}55`, color:conf.color,
                      width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:15,
                      display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>×</button>
                  </div>
                ))}
              </div>
            );
          })}
        </>}

        {/* ══ IMPOSTAZIONI ══ */}
        {tab==="impostazioni" && <>
          <div style={{ fontFamily:FONT_H, fontWeight:700, fontSize:20, color:C.navy, marginBottom:22 }}>
            ⚙️ Impostazioni — {month}
          </div>

          {/* Entrate */}
          <Card style={{ padding:"20px 22px", marginBottom:18 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <span style={{ fontFamily:FONT_H, fontWeight:700, fontSize:15, color:C.green }}>💰 Entrate</span>
              <Btn onClick={()=>open("entrata")} color={C.green} small>＋ Aggiungi</Btn>
            </div>
            {md.entrate.length===0 && <div style={{ fontSize:12, color:C.inkLight, fontStyle:"italic" }}>Nessuna entrata</div>}
            {md.entrate.map(e=>(
              <div key={e.id} style={{ display:"flex", alignItems:"center", background:C.greenBg,
                border:"1.5px solid #B8E8CC", borderRadius:14, padding:"10px 14px", marginBottom:8, gap:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:FONT_H }}>{e.voce}</div>
                  {e.data&&<div style={{ fontSize:11, color:C.inkLight, marginTop:2 }}>{e.data}</div>}
                </div>
                <span style={{ fontFamily:FONT_H, fontWeight:700, color:C.green }}>{fEur(e.importo)}</span>
                <button onClick={()=>delIn(e.id)} style={{ background:"none",border:"none",color:C.inkLight,cursor:"pointer",fontSize:20,lineHeight:1 }}>×</button>
              </div>
            ))}
          </Card>

          {/* Cassaforte */}
          <Card style={{ padding:"20px 22px", marginBottom:18 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <div style={{ fontFamily:FONT_H, fontWeight:700, fontSize:15, color:C.navy }}>🐷 Salvadanaio mensile</div>
              <span style={{ fontFamily:FONT_H, fontWeight:700, fontSize:18, color:C.navy }}>{fEur(md.cassaforte)}</span>
            </div>
            <div style={{ fontSize:11, color:C.inkMid, fontFamily:FONT_B, marginBottom:14 }}>
              Puoi aggiungere solo il residuo disponibile ({fEur(Math.max(0,ms.residuo + md.cassaforte))}).
              Attenzione: ridurre il salvadanaio oltre la soglia attiva un avviso.
            </div>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <input type="number" value={md.cassaforte}
                onChange={e=>setCassaforte(e.target.value)}
                style={{ ...iStyle, flex:1, background:`${C.sky}33`, border:`1.5px solid ${C.blue}` }}/>
            </div>
            <div style={{ marginTop:12, display:"flex", gap:10, flexWrap:"wrap" }}>
              {[0,100,250,500].map(v=>(
                <button key={v} onClick={()=>setCassaforte(v)} style={{
                  background:md.cassaforte===v?C.navy:"transparent",
                  border:`1.5px solid ${md.cassaforte===v?C.navy:C.border}`,
                  color:md.cassaforte===v?C.sky:C.inkMid,
                  padding:"4px 12px", borderRadius:99, cursor:"pointer",
                  fontFamily:FONT_H, fontWeight:700, fontSize:11,
                }}>€{v}</button>
              ))}
            </div>
          </Card>

          {/* Uscite fisse */}
          <Card style={{ padding:"20px 22px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <span style={{ fontFamily:FONT_H, fontWeight:700, fontSize:15, color:C.salmon }}>🔒 Uscite fisse</span>
              <Btn onClick={()=>open("fissa")} color={C.salmon} small>＋ Aggiungi</Btn>
            </div>
            {md.usciteFisse.length===0&&<div style={{ fontSize:12,color:C.inkLight,fontStyle:"italic" }}>Nessuna uscita fissa</div>}
            {md.usciteFisse.map(u=>(
              <div key={u.id} style={{ display:"flex", alignItems:"center", background:"#FDE8E8",
                border:"1.5px solid #F4BDB8", borderRadius:14, padding:"10px 14px", marginBottom:8, gap:10 }}>
                <div style={{ fontSize:15 }}>🔒</div>
                <div style={{ flex:1, fontSize:13, fontWeight:700, color:C.ink, fontFamily:FONT_H }}>{u.voce}</div>
                <span style={{ fontFamily:FONT_H, fontWeight:700, color:C.salmon }}>{fEur(u.importo)}</span>
                <button onClick={()=>delFix(u.id)} style={{ background:"none",border:"none",color:C.inkLight,cursor:"pointer",fontSize:20,lineHeight:1 }}>×</button>
              </div>
            ))}
            <div style={{ marginTop:14, paddingTop:12, borderTop:`2px dashed ${C.border}`,
              display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontFamily:FONT_H, fontWeight:700, fontSize:12, color:C.inkMid }}>TOTALE USCITE FISSE</span>
              <span style={{ fontFamily:FONT_H, fontWeight:700, fontSize:16, color:C.salmon }}>{fEur(ms.totFix)}</span>
            </div>
          </Card>
        </>}
      </div>

      {/* ══ MODALS ══ */}
      {modal==="tx" && (
        <ModalBox title="✨ Nuova spesa" accent={C.pink} onClose={close}>
          <Inp label="Voce" placeholder="es. Spesa al supermercato" value={form.voce||""} onChange={ff("voce")}/>
          <Inp label="Importo (€)" type="number" placeholder="0,00" value={form.importo||""} onChange={ff("importo")}/>
          <Sel label="Categoria" options={CATEGORIES} value={form.categoria||CATEGORIES[0]} onChange={ff("categoria")}/>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:11, color:C.inkMid, marginBottom:5,
              fontFamily:FONT_H, letterSpacing:.5, fontWeight:700 }}>Data</label>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <input type="date" value={form.data||""} onChange={ff("data")} style={{...iStyle, flex:1}}/>
              {form.settimana && (
                <div style={{ background:`${C.sky}55`, border:`1.5px solid ${C.blue}`,
                  borderRadius:10, padding:"8px 12px", whiteSpace:"nowrap",
                  fontFamily:FONT_H, fontWeight:700, fontSize:12, color:C.navy }}>
                  📅 Settimana {form.settimana}
                </div>
              )}
            </div>
            {!form.data && <div style={{ fontSize:10, color:C.inkLight, marginTop:4, fontFamily:FONT_B }}>
              Inserisci la data per calcolare la settimana automaticamente
            </div>}
          </div>
          {form.importo && (ms.budgetDisp - ms.totVar - parseFloat(form.importo||0)) < 0 && (
            <div style={{ background:"#FDE8E8", border:`1.5px solid ${C.salmon}`, borderRadius:12,
              padding:"10px 14px", marginBottom:14, fontSize:12, color:C.salmon, fontFamily:FONT_H }}>
              ⚠️ Questa spesa supera il tuo budget disponibile. Stai attingendo al salvadanaio!
            </div>
          )}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
            <Btn ghost color={C.inkLight} onClick={close}>Annulla</Btn>
            <Btn color={C.pink} onClick={saveTx}>💾 Salva</Btn>
          </div>
        </ModalBox>
      )}
      {modal==="entrata" && (
        <ModalBox title="💰 Nuova entrata" accent={C.green} onClose={close}>
          <Inp label="Voce" placeholder="es. Stipendio" value={form.voce||""} onChange={ff("voce")}/>
          <Inp label="Importo (€)" type="number" value={form.importo||""} onChange={ff("importo")}/>
          <Inp label="Data" type="date" value={form.data||""} onChange={ff("data")}/>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
            <Btn ghost color={C.inkLight} onClick={close}>Annulla</Btn>
            <Btn color={C.green} onClick={saveEntrata}>💾 Salva</Btn>
          </div>
        </ModalBox>
      )}
      {modal==="fissa" && (
        <ModalBox title="🔒 Nuova uscita fissa" accent={C.salmon} onClose={close}>
          <Inp label="Voce" placeholder="es. Affitto" value={form.voce||""} onChange={ff("voce")}/>
          <Inp label="Importo (€)" type="number" value={form.importo||""} onChange={ff("importo")}/>
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:8 }}>
            <Btn ghost color={C.inkLight} onClick={close}>Annulla</Btn>
            <Btn color={C.salmon} onClick={saveFissa}>💾 Salva</Btn>
          </div>
        </ModalBox>
      )}
    </div>
  );
}
