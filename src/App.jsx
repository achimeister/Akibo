import { useState, useMemo, useEffect, useCallback } from "react";

// ─── Costanti ────────────────────────────────────────────────────────────────
const MONTHS = [
  "Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
  "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre",
];
const CATEGORIES = ["Sopravvivenza","Optional","Cultura","Extra"];
const RIMANENZA_LABEL = "Rimanenza mese precedente";

const CAT = {
  Sopravvivenza: { color:"#B8860B", bg:"#FEF9E7", border:"#FADA7A", fill:"#FADA7A", icon:"🍝" },
  Optional:      { color:"#C0392B", bg:"#FDECEA", border:"#FA6868", fill:"#FA6868", icon:"🍸" },
  Cultura:       { color:"#4A7A3A", bg:"#EEF7EC", border:"#84B179", fill:"#84B179", icon:"📚" },
  Extra:         { color:"#2E7A96", bg:"#E8F4F8", border:"#5A9CB5", fill:"#5A9CB5", icon:"🎲" },
};

const C = {
  cream:"#FFF7CD", offwhite:"#F7F8F0",
  navy:"#355872",  sky:"#9CD5FF",
  ink:"#2C3E50",   inkMid:"#567085", inkLight:"#92ABBE",
  border:"#D9EBF7",
};

const TABS = [
  { id:"home",  label:"🏠 Home" },
  { id:"spese", label:"💸 Spese" },
  { id:"mese",  label:"📅 Mese" },
  { id:"anno",  label:"📈 Anno" },
];

const INITIAL_DATA = {
  Febbraio: {
    entrate:     [{ id:1, data:"2024-02-01", voce:"Stipendio", importo:3314.07 }],
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fe = n => "€ " + Number(n || 0).toFixed(2).replace(".", ",");

function weekOfYear(dateStr) {
  if (!dateStr) return 1;
  const dt = new Date(dateStr);
  const start = new Date(dt.getFullYear(), 0, 1);
  return Math.ceil(((dt - start) / 86400000 + start.getDay() + 1) / 7);
}

function loadData() {
  try {
    const saved = localStorage.getItem("akibo_data");
    if (saved) {
      const d = JSON.parse(saved);
      MONTHS.forEach(m => { if (!d[m]) d[m] = emptyMonth(); });
      return d;
    }
  } catch {}
  const d = { ...INITIAL_DATA };
  MONTHS.forEach(m => { if (!d[m]) d[m] = emptyMonth(); });
  return d;
}

function saveData(data) {
  try { localStorage.setItem("akibo_data", JSON.stringify(data)); } catch {}
}

// ─── Calcoli ─────────────────────────────────────────────────────────────────
function propagateRimanenza(data) {
  const result = { ...data };
  MONTHS.forEach((m, i) => {
    if (i === MONTHS.length - 1) return;
    const mNext = MONTHS[i + 1];
    const md = result[m];
    const totIn  = md.entrate.filter(e => e.voce !== RIMANENZA_LABEL).reduce((a,t) => a + Number(t.importo||0), 0);
    const totFix = md.usciteFisse.reduce((a,t) => a + Number(t.importo||0), 0);
    const totVar = md.transazioni.reduce((a,t) => a + Number(t.importo||0), 0);
    const residuo = parseFloat((totIn - totFix - md.cassaforte - totVar).toFixed(2));

    result[mNext] = {
      ...result[mNext],
      entrate: [
        ...(residuo > 0 ? [{ id:`rim_${i}`, data:"", voce:RIMANENZA_LABEL, importo:residuo, auto:true }] : []),
        ...result[mNext].entrate.filter(e => e.voce !== RIMANENZA_LABEL),
      ],
    };
  });
  return result;
}

function getStats(data) {
  const withRim = propagateRimanenza(data);
  const stats = {};
  MONTHS.forEach(m => {
    const md = withRim[m];
    const totIn  = md.entrate.reduce((a,t) => a + Number(t.importo||0), 0);
    const totFix = md.usciteFisse.reduce((a,t) => a + Number(t.importo||0), 0);
    const totVar = md.transazioni.reduce((a,t) => a + Number(t.importo||0), 0);
    const budgetDisp = totIn - totFix - md.cassaforte;
    stats[m] = { totIn, totFix, totVar, budgetDisp, residuo: budgetDisp - totVar };
  });
  return { stats, withRim };
}

function getCassaInfo(data, month) {
  const idx = MONTHS.indexOf(month);
  let prec = 0;
  for (let i = 0; i < idx; i++) prec += Number(data[MONTHS[i]].cassaforte || 0);
  return { prec, totale: prec + Number(data[month].cassaforte || 0) };
}

// ─── Componenti UI ───────────────────────────────────────────────────────────

function PigLogo() {
  return (
    <svg width="44" height="44" viewBox="0 0 100 100" fill="none">
      <ellipse cx="50" cy="60" rx="32" ry="28" fill="#FDBCB4"/>
      <ellipse cx="50" cy="62" rx="26" ry="22" fill="#FFD0C8" opacity=".4"/>
      <circle cx="50" cy="34" r="22" fill="#FDBCB4"/>
      <ellipse cx="30" cy="20" rx="8" ry="11" fill="#FDBCB4"/>
      <ellipse cx="30" cy="20" rx="5" ry="7" fill="#F4A0A0" opacity=".7"/>
      <ellipse cx="70" cy="20" rx="8" ry="11" fill="#FDBCB4"/>
      <ellipse cx="70" cy="20" rx="5" ry="7" fill="#F4A0A0" opacity=".7"/>
      <circle cx="42" cy="30" r="4" fill="#fff"/>
      <circle cx="58" cy="30" r="4" fill="#fff"/>
      <circle cx="43" cy="31" r="2.2" fill="#355872"/>
      <circle cx="59" cy="31" r="2.2" fill="#355872"/>
      <circle cx="44" cy="30" r=".8" fill="#fff"/>
      <circle cx="60" cy="30" r=".8" fill="#fff"/>
      <ellipse cx="50" cy="40" rx="7" ry="5" fill="#F4A0A0"/>
      <circle cx="47" cy="40" r="1.5" fill="#E07080" opacity=".7"/>
      <circle cx="53" cy="40" r="1.5" fill="#E07080" opacity=".7"/>
      <path d="M43 45 Q50 51 57 45" stroke="#E07080" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <circle cx="78" cy="28" r="10" fill="#FFD700" stroke="#E8B800" strokeWidth="1.5"/>
      <text x="78" y="33" textAnchor="middle" fontSize="11" fontWeight="900" fill="#B07A00" fontFamily="Nunito,sans-serif">¥</text>
      <ellipse cx="22" cy="82" rx="7" ry="5" fill="#FDBCB4"/>
      <ellipse cx="36" cy="88" rx="7" ry="5" fill="#FDBCB4"/>
      <ellipse cx="64" cy="88" rx="7" ry="5" fill="#FDBCB4"/>
      <ellipse cx="78" cy="82" rx="7" ry="5" fill="#FDBCB4"/>
      <path d="M82 58 Q92 52 88 44 Q84 36 90 32" stroke="#FDBCB4" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function PieTorta({ vals, size = 100 }) {
  const tot = vals.reduce((a, b) => a + b, 0);
  const fills = ["#FADA7A","#FA6868","#84B179","#5A9CB5"];
  if (!tot) return <svg width={size} height={size}><circle cx={size/2} cy={size/2} r={size/2-1} fill="#E8EEF4"/></svg>;

  let angle = -Math.PI / 2;
  const paths = vals.map((v, i) => {
    if (!v) return null;
    const slice = (v / tot) * 2 * Math.PI;
    const r = size / 2 - 2;
    const x1 = size/2 + r * Math.cos(angle);
    const y1 = size/2 + r * Math.sin(angle);
    angle += slice;
    const x2 = size/2 + r * Math.cos(angle);
    const y2 = size/2 + r * Math.sin(angle);
    const large = slice > Math.PI ? 1 : 0;
    return (
      <path key={i}
        d={`M${size/2},${size/2} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2}Z`}
        fill={fills[i]} stroke="white" strokeWidth="1.5"
      />
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={size/2} fill="#E8EEF4"/>
      {paths}
      <circle cx={size/2} cy={size/2} r={size*0.3} fill="white"/>
    </svg>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.offwhite,
      border: `1.5px solid ${C.border}`,
      borderRadius: 18,
      boxShadow: "0 3px 14px rgba(53,88,114,.07)",
      marginBottom: 14,
      padding: "16px 18px",
      ...style,
    }}>
      {children}
    </div>
  );
}

function KpiBox({ icon, label, value, bg, col }) {
  return (
    <div style={{ background: bg, borderRadius: 12, padding: "8px 8px", textAlign: "center" }}>
      <div style={{ fontSize: 15, marginBottom: 2 }}>{icon}</div>
      <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", color: col, letterSpacing: ".3px" }}>{label}</div>
      <div style={{ fontWeight: 900, fontSize: 12, color: C.navy, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function CatRow({ cat, val, max }) {
  const c = CAT[cat];
  const pct = Math.round((val / (max || 1)) * 100);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:9 }}>
      <div style={{ width:30, height:30, borderRadius:9, background:c.bg, border:`1.5px solid ${c.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{c.icon}</div>
      <span style={{ fontSize:11, fontWeight:700, color:c.color, minWidth:90 }}>{cat}</span>
      <div style={{ flex:1, background:C.border, borderRadius:99, height:9 }}>
        <div style={{ width:`${pct}%`, height:9, borderRadius:99, background:c.fill }}/>
      </div>
      <span style={{ fontWeight:800, fontSize:12, color:c.color, minWidth:76, textAlign:"right" }}>{fe(val)}</span>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position:"fixed", bottom:20, left:"50%", transform:"translateX(-50%)",
      background:C.navy, color:"#fff", borderRadius:14, padding:"11px 20px",
      fontWeight:700, fontSize:12, display:"flex", alignItems:"center", gap:9, zIndex:100,
    }}>
      <span>🐷</span><span>{msg}</span>
    </div>
  );
}

// ─── Modale ──────────────────────────────────────────────────────────────────
function Modal({ type, presetCat, confirmPrelievo, budgetDisp, totVar, cassaTotale, onClose, onSaveTx, onConfirmPrelievo, onSaveEntrata, onSaveFissa }) {
  const [form, setForm] = useState({ categoria: presetCat || "Sopravvivenza", voce:"", importo:"", data:"", settimana:null });
  const set = k => v => setForm(f => ({ ...f, [k]:v }));

  const warn = form.importo && (budgetDisp - totVar - parseFloat(form.importo || 0)) < 0;

  if (confirmPrelievo) {
    return (
      <ModalShell onClose={onClose} title="🐷 Prelievo dal salvadanaio">
        <div style={{ background:"#FDECEA", border:`1.5px solid #FA6868`, borderRadius:13, padding:"14px 16px", marginBottom:15 }}>
          <div style={{ fontWeight:800, fontSize:13, color:"#C0392B", marginBottom:8 }}>⚠️ Budget superato!</div>
          <div style={{ fontSize:12, lineHeight:1.9 }}>
            Spesa: <b>{fe(confirmPrelievo.importoSpesa)}</b><br/>
            Prelievo: <b style={{ color:"#C0392B" }}>{fe(confirmPrelievo.mancante)}</b><br/>
            Salvadanaio: {fe(cassaTotale)} → <b>{fe(Math.max(0, cassaTotale - confirmPrelievo.mancante))}</b>
          </div>
        </div>
        <div style={{ display:"flex", gap:9, justifyContent:"flex-end" }}>
          <Btn ghost onClick={onClose}>✕ Annulla</Btn>
          <Btn bg="#C0392B" col="#fff" onClick={onConfirmPrelievo}>🐷 Sì, preleva</Btn>
        </div>
      </ModalShell>
    );
  }

  if (type === "tx") {
    return (
      <ModalShell onClose={onClose} title="✨ Nuova spesa">
        <Field label="Cosa hai comprato?" placeholder="es. Supermercato" value={form.voce} onChange={set("voce")}/>
        <Field label="Quanto?" type="number" placeholder="0,00" value={form.importo} onChange={set("importo")}/>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:C.inkMid, fontWeight:700, textTransform:"uppercase", letterSpacing:".5px" }}>Categoria</div>
          <select style={inpStyle} value={form.categoria} onChange={e => set("categoria")(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:C.inkMid, fontWeight:700, textTransform:"uppercase", letterSpacing:".5px" }}>Quando?</div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <input style={{ ...inpStyle, flex:1 }} type="date" value={form.data}
              onChange={e => setForm(f => ({ ...f, data:e.target.value, settimana:weekOfYear(e.target.value) }))}/>
            {form.settimana && (
              <div style={{ background:"#E8F4F8", border:`1.5px solid #5A9CB5`, borderRadius:9, padding:"5px 10px", fontWeight:700, fontSize:11, color:"#2E7A96", whiteSpace:"nowrap" }}>
                Sett. {form.settimana}
              </div>
            )}
          </div>
        </div>
        {warn && <div style={{ background:"#FDECEA", border:`1.5px solid #FA6868`, borderRadius:10, padding:"8px 12px", marginBottom:12, fontSize:12, color:"#C0392B", fontWeight:700 }}>⚠️ Supera il budget! Dovrai prelevare dal salvadanaio.</div>}
        <div style={{ display:"flex", gap:9, justifyContent:"flex-end", marginTop:6 }}>
          <Btn ghost onClick={onClose}>Annulla</Btn>
          <Btn bg={C.navy} col="#fff" onClick={() => onSaveTx(form)}>💾 Salva</Btn>
        </div>
      </ModalShell>
    );
  }

  if (type === "entrata") {
    return (
      <ModalShell onClose={onClose} title="💰 Nuova entrata">
        <Field label="Voce" placeholder="es. Stipendio" value={form.voce} onChange={set("voce")}/>
        <Field label="Importo" type="number" placeholder="0,00" value={form.importo} onChange={set("importo")}/>
        <Field label="Data" type="date" value={form.data} onChange={set("data")}/>
        <div style={{ display:"flex", gap:9, justifyContent:"flex-end", marginTop:6 }}>
          <Btn ghost onClick={onClose}>Annulla</Btn>
          <Btn bg="#4A7A3A" col="#fff" onClick={() => onSaveEntrata(form)}>💾 Salva</Btn>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose} title="📌 Uscita fissa">
      <Field label="Voce" placeholder="es. Affitto" value={form.voce} onChange={set("voce")}/>
      <Field label="Importo" type="number" placeholder="0,00" value={form.importo} onChange={set("importo")}/>
      <div style={{ display:"flex", gap:9, justifyContent:"flex-end", marginTop:6 }}>
        <Btn ghost onClick={onClose}>Annulla</Btn>
        <Btn bg="#C0392B" col="#fff" onClick={() => onSaveFissa(form)}>💾 Salva</Btn>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(44,62,80,.35)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:C.offwhite, borderRadius:20, padding:22, width:"100%", maxWidth:400, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <b style={{ fontSize:15 }}>{title}</b>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:C.inkLight }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inpStyle = {
  width:"100%", background:C.cream, border:`1.5px solid ${C.border}`, borderRadius:10,
  color:C.ink, padding:"8px 12px", fontSize:13, outline:"none", marginTop:4,
  fontFamily:"'Nunito', sans-serif",
};

function Field({ label, ...props }) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontSize:10, color:C.inkMid, fontWeight:700, textTransform:"uppercase", letterSpacing:".5px" }}>{label}</div>
      <input style={inpStyle} {...props} onChange={e => props.onChange(e.target.value)}/>
    </div>
  );
}

function Btn({ children, bg, col, ghost, onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{
      borderRadius:99, padding:"8px 18px", cursor:"pointer",
      fontFamily:"'Nunito', sans-serif", fontWeight:800, fontSize:12,
      border: ghost ? `2px solid ${C.inkLight}` : "none",
      background: ghost ? "transparent" : bg,
      color: ghost ? C.inkLight : col,
      ...style,
    }}>
      {children}
    </button>
  );
}

// ─── App Principale ───────────────────────────────────────────────────────────
export default function App() {
  const [data, setData]   = useState(() => loadData());
  const [month, setMonth] = useState(() => MONTHS[new Date().getMonth()] || "Gennaio");
  const [tab, setTab]     = useState("home");
  const [modal, setModal] = useState(null); // { type, presetCat }
  const [confirmPrelievo, setConfirmPrelievo] = useState(null);
  const [pendingTxForm, setPendingTxForm]     = useState(null);
  const [toast, setToast] = useState("");
  const [quickOpen, setQuickOpen] = useState(false);

  // Salva su localStorage ad ogni modifica
  useEffect(() => { saveData(data); }, [data]);

  const showToast = useCallback(msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  }, []);

  // Calcoli derivati
  const { stats, withRim } = useMemo(() => getStats(data), [data]);
  const ms = stats[month];
  const md = withRim[month];  // usa i dati con rimanenza propagata per display
  const mdRaw = data[month];  // dati "grezzi" per modifiche
  const { prec: cassaPrec, totale: cassaTotale } = useMemo(() => getCassaInfo(data, month), [data, month]);

  const disponibili   = Math.max(0, parseFloat((ms.budgetDisp - ms.totVar).toFixed(2)));
  const cassaMese     = Number(mdRaw.cassaforte || 0);

  // ─── Barre categoria ──
  const byCat = useMemo(() => {
    const bc = { Sopravvivenza:0, Optional:0, Cultura:0, Extra:0 };
    mdRaw.transazioni.forEach(t => { bc[t.categoria] = (bc[t.categoria] || 0) + Number(t.importo || 0); });
    return bc;
  }, [mdRaw]);
  const maxCat = Math.max(...Object.values(byCat), 1);

  // ─── Barre settimana ──
  const byWeek = useMemo(() => {
    const bw = {};
    mdRaw.transazioni.forEach(t => { bw[t.settimana] = (bw[t.settimana] || 0) + Number(t.importo || 0); });
    return bw;
  }, [mdRaw]);
  const maxWeek = Math.max(...Object.values(byWeek), 1);

  // ─── Dati Anno ──
  const annoData = useMemo(() => {
    const am = MONTHS.filter(m => data[m].entrate.filter(e => !e.auto).length || data[m].transazioni.length || data[m].cassaforte);
    const cTot = { Sopravvivenza:0, Optional:0, Cultura:0, Extra:0 };
    let tSp = 0;
    am.forEach(m => {
      tSp += stats[m].totVar;
      data[m].transazioni.forEach(t => { cTot[t.categoria] = (cTot[t.categoria] || 0) + Number(t.importo || 0); });
    });
    return { am, cTot, tSp };
  }, [data, stats]);

  // ─── Handlers dati ──
  function updateData(fn) {
    setData(prev => {
      const next = { ...prev, [month]: { ...prev[month] } };
      fn(next);
      return next;
    });
  }

  function handleSaveTx(form) {
    const importo = parseFloat(parseFloat(form.importo).toFixed(2));
    const nr = parseFloat((ms.budgetDisp - ms.totVar - importo).toFixed(2));
    if (nr < 0) {
      const mancante = Math.abs(nr);
      if (cassaTotale < mancante) { showToast("Fondi insufficienti!"); return; }
      setConfirmPrelievo({ importoSpesa: importo, mancante: parseFloat(mancante.toFixed(2)) });
      setPendingTxForm(form);
      return;
    }
    updateData(d => {
      d[month].transazioni.push({
        id: Date.now(), data: form.data || "", voce: form.voce, importo,
        categoria: form.categoria || "Sopravvivenza", settimana: form.settimana || 1,
      });
    });
    setModal(null);
  }

  function handleConfirmPrelievo() {
    if (!confirmPrelievo || !pendingTxForm) return;
    updateData(d => {
      d[month].transazioni.push({
        id: Date.now(), data: pendingTxForm.data || "", voce: pendingTxForm.voce,
        importo: confirmPrelievo.importoSpesa,
        categoria: pendingTxForm.categoria || "Sopravvivenza",
        settimana: pendingTxForm.settimana || 1,
      });
      d[month].cassaforte = parseFloat(Math.max(0, Number(d[month].cassaforte || 0) - confirmPrelievo.mancante).toFixed(2));
    });
    setConfirmPrelievo(null); setPendingTxForm(null); setModal(null);
    showToast("Prelevato dal salvadanaio 🐷");
  }

  function handleSaveEntrata(form) {
    if (!form.voce || !form.importo) return;
    updateData(d => { d[month].entrate.push({ id:Date.now(), data:form.data||"", voce:form.voce, importo:parseFloat(form.importo) }); });
    setModal(null);
  }

  function handleSaveFissa(form) {
    if (!form.voce || !form.importo) return;
    updateData(d => { d[month].usciteFisse.push({ id:Date.now(), voce:form.voce, importo:parseFloat(form.importo) }); });
    setModal(null);
  }

  function handleDelTx(id)  { updateData(d => { d[month].transazioni = d[month].transazioni.filter(t => t.id !== id); }); }
  function handleDelIn(id)  {
    const e = mdRaw.entrate.find(e => e.id === id);
    if (e?.auto) { showToast("La rimanenza è automatica"); return; }
    updateData(d => { d[month].entrate = d[month].entrate.filter(t => t.id !== id); });
  }
  function handleDelFix(id) { updateData(d => { d[month].usciteFisse = d[month].usciteFisse.filter(t => t.id !== id); }); }

  function handleCassaInput(e) {
    if (e.key !== "Enter") return;
    const v = parseFloat(e.target.value);
    if (isNaN(v)) { showToast("Inserisci un numero (es. 200 o -50)"); return; }
    const max = parseFloat((ms.budgetDisp + Number(mdRaw.cassaforte || 0)).toFixed(2));
    const nuovo = parseFloat((Number(mdRaw.cassaforte || 0) + v).toFixed(2));
    if (nuovo < 0) { showToast("Il salvadanaio non può essere negativo!"); return; }
    if (nuovo > max) { showToast("Superi il massimo: " + fe(max)); return; }
    updateData(d => { d[month].cassaforte = nuovo; });
    e.target.value = "";
    showToast(v > 0 ? "Aggiunto 🐷" : "Prelevato 🐷");
  }

  // ─── Backup ──
  function esportaBackup() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:"application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `akibo_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    showToast("Backup esportato! 🎉");
  }
  function importaBackup(e) {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        MONTHS.forEach(m => { if (!d[m]) d[m] = emptyMonth(); });
        setData(d); saveData(d); showToast("Backup importato! 🎉");
      } catch { showToast("File non valido"); }
    };
    r.readAsText(f);
    e.target.value = "";
  }

  // ─── MonthCard (comune a tutte le tab) ──
  const MonthCard = (
    <Card style={{ marginBottom:8, padding:"12px 16px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <select value={month} onChange={e => setMonth(e.target.value)}
          style={{ background:C.navy, color:C.sky, border:"none", borderRadius:12, padding:"6px 12px", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, cursor:"pointer", outline:"none" }}>
          {MONTHS.map(m => <option key={m}>{m}</option>)}
        </select>
        <span style={{ fontSize:10, color:C.inkLight, fontWeight:600 }}>
          Budget mensile <b style={{ color:C.navy }}>{fe(ms.budgetDisp)}</b>
        </span>
      </div>
    </Card>
  );

  // ─── KPI Card (solo Home) ──
  const pct = ms.budgetDisp > 0 ? Math.min(100, (ms.totVar / ms.budgetDisp) * 100) : 0;
  const KpiCard = (
    <Card style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
        <span style={{ fontSize:11, fontWeight:700, color:C.inkMid }}>{fe(ms.totVar)} spesi su {fe(ms.budgetDisp)}</span>
        <span style={{ fontSize:11, fontWeight:800, color:C.navy }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ background:C.border, borderRadius:99, height:10, marginBottom:14 }}>
        <div style={{ width:`${pct}%`, height:10, borderRadius:99, background:"linear-gradient(90deg,#84B179,#FADA7A,#FA6868)" }}/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
        <KpiBox icon="💳" label="Disponibile" value={fe(disponibili)} bg="#FEF9E7" col="#B8860B"/>
        <KpiBox icon="💸" label="Spese mese"  value={fe(ms.totVar)}   bg="#FDECEA" col="#C0392B"/>
        <KpiBox icon="📅" label="Budget"       value={fe(ms.budgetDisp)} bg="#EEF7EC" col="#4A7A3A"/>
        <KpiBox icon="🐷" label="Salvadanaio"  value={fe(cassaMese)}   bg="#EEF1F7" col="#576A8F"/>
      </div>
    </Card>
  );

  // ─── Render tab ──────────────────────────────────────────────────────────
  function renderHome() {
    return (
      <>
        {MonthCard}
        {KpiCard}
        <Card>
          <div style={{ fontWeight:800, fontSize:14, color:C.navy, marginBottom:12 }}>Per categoria</div>
          {CATEGORIES.map(c => <CatRow key={c} cat={c} val={byCat[c] || 0} max={maxCat}/>)}
        </Card>
        <Card>
          <div style={{ fontWeight:800, fontSize:14, color:C.navy, marginBottom:12 }}>Per settimana</div>
          {Object.keys(byWeek).sort((a,b) => +a-+b).map(w => (
            <div key={w} style={{ display:"flex", alignItems:"center", gap:9, marginBottom:9 }}>
              <span style={{ fontWeight:800, fontSize:11, color:C.navy, minWidth:42 }}>Sett. {w}</span>
              <div style={{ flex:1, background:C.border, borderRadius:99, height:9 }}>
                <div style={{ width:`${Math.round((byWeek[w]/maxWeek)*100)}%`, height:9, borderRadius:99, background:"#576A8F" }}/>
              </div>
              <span style={{ fontWeight:800, fontSize:12, color:"#576A8F", minWidth:76, textAlign:"right" }}>{fe(byWeek[w])}</span>
            </div>
          ))}
        </Card>
      </>
    );
  }

  function renderSpese() {
    const byCat2 = {};
    mdRaw.transazioni.forEach(t => { if (!byCat2[t.categoria]) byCat2[t.categoria] = []; byCat2[t.categoria].push(t); });
    return (
      <>
        {MonthCard}
        {CATEGORIES.map(cat => {
          const txs = byCat2[cat] || [];
          const tot = txs.reduce((a,t) => a + Number(t.importo), 0);
          const c = CAT[cat];
          return (
            <Card key={cat}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: txs.length ? 10 : 0 }}>
                <span style={{ fontWeight:800, fontSize:13, color:c.color, display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ width:26, height:26, borderRadius:7, background:c.bg, border:`1.5px solid ${c.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>{c.icon}</span>
                  {cat}
                </span>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {txs.length > 0 && <span style={{ fontWeight:800, color:c.color }}>{fe(tot)}</span>}
                  <button onClick={() => { setModal({ type:"tx", presetCat:cat }); }}
                    style={{ width:28, height:28, background:c.bg, border:`1.5px solid ${c.border}`, color:c.color, borderRadius:8, cursor:"pointer", fontWeight:900, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>＋</button>
                </div>
              </div>
              {txs.length === 0 && <div style={{ fontSize:11, color:C.inkLight, fontStyle:"italic", padding:"6px 0" }}>Nessuna spesa</div>}
              {txs.map(t => (
                <div key={t.id} style={{ display:"flex", alignItems:"center", borderRadius:12, padding:"9px 12px", marginBottom:7, gap:9, background:c.bg, border:`1.5px solid ${c.border}` }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>{t.voce}</div>
                    <div style={{ fontSize:10, color:C.inkLight, marginTop:1 }}>{t.data || ""} · Sett. {t.settimana}</div>
                  </div>
                  <span style={{ fontWeight:800, fontSize:13, color:c.color }}>{fe(t.importo)}</span>
                  <button onClick={() => handleDelTx(t.id)} style={{ background:"none", border:"none", color:C.inkLight, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", width:24, height:24, flexShrink:0, padding:0 }}>×</button>
                </div>
              ))}
            </Card>
          );
        })}
      </>
    );
  }

  function renderMese() {
    const rimanenza   = md.entrate.find(e => e.auto);
    const entrateNorm = mdRaw.entrate.filter(e => !e.auto);

    return (
      <>
        {MonthCard}
        {rimanenza && (
          <div style={{ background:"rgba(132,177,121,.2)", border:`1.5px solid #84B179`, borderRadius:13, padding:"10px 14px", marginBottom:13, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
            <div>
              <span style={{ fontSize:12, color:C.navy, fontWeight:800 }}>↩ Rimanenza mese precedente</span><br/>
              <span style={{ fontSize:10, color:C.inkLight }}>Aggiunta automaticamente alle entrate</span>
            </div>
            <span style={{ fontWeight:900, fontSize:15, color:"#4A7A3A" }}>{fe(rimanenza.importo)}</span>
          </div>
        )}

        {/* Entrate */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <span style={{ fontWeight:800, fontSize:13, color:"#4A7A3A" }}>💰 Entrate</span>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:13, fontWeight:900, color:"#4A7A3A" }}>{fe(ms.totIn)}</span>
              <button onClick={() => setModal({ type:"entrata" })} style={{ width:28, height:28, background:"#F0FAF0", border:`1.5px solid #84B179`, color:"#4A7A3A", borderRadius:8, cursor:"pointer", fontWeight:900, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>＋</button>
            </div>
          </div>
          {entrateNorm.length === 0 && <div style={{ fontSize:11, color:C.inkLight, fontStyle:"italic" }}>Nessuna entrata</div>}
          {entrateNorm.map(e => (
            <div key={e.id} style={{ display:"flex", alignItems:"center", borderRadius:12, padding:"9px 12px", marginBottom:7, gap:9, background:"#EEF7EC", border:`1.5px solid #84B179` }}>
              <div style={{ flex:1, fontSize:12, fontWeight:700, color:C.ink }}>{e.voce}</div>
              {e.data && <span style={{ fontSize:10, color:C.inkLight }}>{e.data}</span>}
              <span style={{ fontWeight:800, color:"#4A7A3A" }}>{fe(e.importo)}</span>
              <button onClick={() => handleDelIn(e.id)} style={{ background:"none", border:"none", color:C.inkLight, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", width:24, height:24 }}>×</button>
            </div>
          ))}
        </Card>

        {/* Salvadanaio */}
        <Card>
          <div style={{ fontWeight:800, fontSize:13, color:C.navy, marginBottom:12 }}>🐷 Salvadanaio</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:10 }}>
            <div style={{ background:"#EEF1F7", border:`1.5px solid #B0BFDA`, borderRadius:12, padding:"9px 12px", textAlign:"center" }}>
              <div style={{ fontSize:9, color:"#576A8F", fontWeight:700, textTransform:"uppercase" }}>Mesi prec.</div>
              <div style={{ fontWeight:900, fontSize:14, color:C.navy, marginTop:3 }}>{fe(cassaPrec)}</div>
            </div>
            <div style={{ background:"#FEF9E7", border:`1.5px solid #FADA7A`, borderRadius:12, padding:"9px 12px", textAlign:"center" }}>
              <div style={{ fontSize:9, color:"#B8860B", fontWeight:700, textTransform:"uppercase" }}>Questo mese</div>
              <div style={{ fontWeight:900, fontSize:14, color:"#B8860B", marginTop:3 }}>{fe(mdRaw.cassaforte)}</div>
            </div>
            <div style={{ background:C.navy, borderRadius:12, padding:"9px 12px", textAlign:"center" }}>
              <div style={{ fontSize:9, color:"rgba(255,255,255,.6)", fontWeight:700, textTransform:"uppercase" }}>Totale 🐷</div>
              <div style={{ fontWeight:900, fontSize:14, color:"#fff", marginTop:3 }}>{fe(cassaTotale)}</div>
            </div>
          </div>
          <div style={{ fontSize:10, color:C.inkMid, fontWeight:700, marginBottom:6 }}>
            <b style={{ color:C.navy }}>{fe(disponibili)}</b> disponibili
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <input type="number" placeholder="es. +200 o -50 · invio per confermare"
              onKeyDown={handleCassaInput}
              style={{ ...inpStyle, flex:1, marginTop:0, background:"#E8F4F8", border:`1.5px solid #5A9CB5` }}/>
            <Btn bg={C.navy} col="#84B179" onClick={() => {
              const inp = document.querySelector("#cassa-input");
              if (inp) handleCassaInput({ key:"Enter", target:inp });
            }}>↵</Btn>
          </div>
        </Card>

        {/* Uscite fisse */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <span style={{ fontWeight:800, fontSize:13, color:"#C0392B" }}>📌 Uscite fisse</span>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:13, fontWeight:900, color:"#C0392B" }}>{fe(ms.totFix)}</span>
              <button onClick={() => setModal({ type:"fissa" })} style={{ width:28, height:28, background:"#FDECEA", border:`1.5px solid #FA6868`, color:"#C0392B", borderRadius:8, cursor:"pointer", fontWeight:900, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1 }}>＋</button>
            </div>
          </div>
          {mdRaw.usciteFisse.map(u => (
            <div key={u.id} style={{ display:"flex", alignItems:"center", borderRadius:12, padding:"9px 12px", marginBottom:7, gap:9, background:"#FDECEA", border:`1.5px solid #FA6868` }}>
              <div style={{ flex:1, fontSize:12, fontWeight:700, color:C.ink }}>{u.voce}</div>
              <span style={{ fontWeight:800, color:"#C0392B" }}>{fe(u.importo)}</span>
              <button onClick={() => handleDelFix(u.id)} style={{ background:"none", border:"none", color:C.inkLight, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", width:24, height:24 }}>×</button>
            </div>
          ))}
        </Card>
      </>
    );
  }

  function renderAnno() {
    const { am, cTot, tSp } = annoData;
    const mcxA = Math.max(...Object.values(cTot), 1);

    return (
      <>
        {/* Torta */}
        <Card>
          <div style={{ fontWeight:800, fontSize:14, color:C.navy, marginBottom:12 }}>Spese annuali per categoria</div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <PieTorta vals={[cTot.Sopravvivenza, cTot.Optional, cTot.Cultura, cTot.Extra]} size={100}/>
            <div style={{ flex:1 }}>
              {CATEGORIES.map((c, i) => (
                <div key={c} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:CAT[c].fill, flexShrink:0 }}/>
                  <span style={{ fontSize:11, fontWeight:700, color:CAT[c].color, minWidth:95 }}>{CAT[c].icon} {c}</span>
                  <span style={{ fontSize:11, fontWeight:800, color:C.ink }}>{fe(cTot[c])}</span>
                  <span style={{ fontSize:10, color:C.inkLight }}>{tSp > 0 ? Math.round((cTot[c]/tSp)*100) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Barre */}
        <Card>
          <div style={{ fontWeight:800, fontSize:14, color:C.navy, marginBottom:12 }}>Dettaglio annuale categorie</div>
          {CATEGORIES.map(c => <CatRow key={c} cat={c} val={cTot[c] || 0} max={mcxA}/>)}
        </Card>

        {/* Mese per mese */}
        <div style={{ fontWeight:800, fontSize:14, color:C.navy, marginBottom:10 }}>Mese per mese</div>
        {am.length === 0 && <div style={{ textAlign:"center", padding:20, color:C.inkLight, fontStyle:"italic" }}>Nessun dato</div>}
        {am.map(m => {
          const ms2 = stats[m];
          const md2 = data[m];
          const bc3 = { Sopravvivenza:0, Optional:0, Cultura:0, Extra:0 };
          md2.transazioni.forEach(t => { bc3[t.categoria] = (bc3[t.categoria] || 0) + Number(t.importo || 0); });
          return (
            <Card key={m}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:13, color:C.navy }}>{m}</div>
                  <div style={{ fontSize:10, color:C.inkLight, marginTop:3, display:"flex", gap:10, flexWrap:"wrap" }}>
                    <span>💰 <b style={{ color:"#4A7A3A" }}>{fe(ms2.totIn)}</b></span>
                    <span>📌 <b style={{ color:"#C0392B" }}>{fe(ms2.totFix)}</b></span>
                    <span>🐷 <b style={{ color:"#B8860B" }}>{fe(md2.cassaforte)}</b></span>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontWeight:900, fontSize:14, color:"#C0392B" }}>{fe(ms2.totVar)}</div>
                  <div style={{ fontSize:10, color:C.inkLight }}>spese variabili</div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <PieTorta vals={[bc3.Sopravvivenza, bc3.Optional, bc3.Cultura, bc3.Extra]} size={68}/>
                <div style={{ flex:1 }}>
                  {CATEGORIES.filter(c => bc3[c] > 0).map(c => (
                    <div key={c} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:CAT[c].fill, flexShrink:0 }}/>
                      <span style={{ fontSize:10, fontWeight:700, color:CAT[c].color, minWidth:85 }}>{c}</span>
                      <span style={{ fontSize:11, fontWeight:800, color:C.ink }}>{fe(bc3[c])}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </>
    );
  }

  // ─── Render Principale ────────────────────────────────────────────────────
  return (
    <div style={{ background:C.cream, minHeight:"100vh", fontFamily:"'Nunito', sans-serif" }}>

      {/* Navbar */}
      <div style={{ background:C.offwhite, borderBottom:`2px solid ${C.border}`, padding:"0 16px", display:"flex", alignItems:"center", gap:8, height:62, boxShadow:"0 2px 12px rgba(53,88,114,.09)", position:"sticky", top:0, zIndex:30 }}>
        <PigLogo/>
        <span style={{ fontWeight:900, fontSize:22, color:C.navy, letterSpacing:1 }}>AKIBO</span>

        {/* Bottone Aggiungi */}
        <div style={{ position:"relative", marginLeft:8 }}>
          <button onClick={() => setQuickOpen(o => !o)}
            style={{ display:"flex", alignItems:"center", gap:6, background:"linear-gradient(135deg,#FADA7A,#FA6868)", border:"none", borderRadius:99, padding:"8px 16px", cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13, color:"#fff" }}>
            ＋ Aggiungi
          </button>
          {quickOpen && (
            <div style={{ position:"absolute", top:"calc(100% + 8px)", left:0, background:C.offwhite, border:`2px solid ${C.border}`, borderRadius:16, overflow:"hidden", zIndex:40, boxShadow:"0 8px 28px rgba(53,88,114,.12)", minWidth:200 }}>
              {[
                { type:"tx",      icon:"🍝", label:"Nuova spesa",        sub:"Sopravvivenza, Optional…", bg:"#FEF9E7" },
                { type:"entrata", icon:"💰", label:"Nuova entrata",       sub:"",                          bg:"#F0FAF0" },
                { type:"fissa",   icon:"📌", label:"Uscita fissa mensile",sub:"",                          bg:"#FDECEA" },
              ].map(({ type, icon, label, sub, bg }) => (
                <button key={type} onClick={() => { setModal({ type }); setQuickOpen(false); }}
                  style={{ width:"100%", padding:"11px 16px", background:"none", border:"none", borderBottom:`1px solid ${C.border}`, cursor:"pointer", display:"flex", alignItems:"center", gap:10, fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:13, color:C.ink, textAlign:"left" }}>
                  <span style={{ width:28, height:28, borderRadius:8, background:bg, display:"flex", alignItems:"center", justifyContent:"center" }}>{icon}</span>
                  <div><div>{label}</div>{sub && <div style={{ fontSize:10, color:C.inkLight }}>{sub}</div>}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display:"flex", gap:5, marginLeft:"auto" }}>
          <button onClick={esportaBackup} style={{ background:"#fff", border:`1.5px solid ${C.border}`, borderRadius:10, padding:"6px 11px", cursor:"pointer", fontSize:12, color:C.navy, fontFamily:"'Nunito',sans-serif", fontWeight:800 }}>💾 Salva</button>
          <label style={{ background:"#fff", border:`1.5px solid ${C.border}`, borderRadius:10, padding:"6px 11px", cursor:"pointer", fontSize:12, color:C.navy, fontFamily:"'Nunito',sans-serif", fontWeight:800 }}>
            📂 Carica<input type="file" accept=".json" style={{ display:"none" }} onChange={importaBackup}/>
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:C.offwhite, borderBottom:`2px solid ${C.border}`, padding:"8px 12px", display:"flex", gap:6 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              display:"inline-flex", alignItems:"center", gap:5, padding:"9px 15px",
              border: t.id === tab ? `2px solid ${C.navy}` : `2px solid #C8D8E8`,
              background: t.id === tab ? C.navy : "#FFFFFF",
              cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:13,
              color: t.id === tab ? "#ffffff" : C.navy,
              borderRadius:12, whiteSpace:"nowrap",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenuto */}
      <div style={{ padding:16, maxWidth:780, margin:"0 auto" }}>
        {tab === "home"  && renderHome()}
        {tab === "spese" && renderSpese()}
        {tab === "mese"  && renderMese()}
        {tab === "anno"  && renderAnno()}
      </div>

      {/* Modale */}
      {(modal || confirmPrelievo) && (
        <Modal
          type={modal?.type}
          presetCat={modal?.presetCat}
          confirmPrelievo={confirmPrelievo}
          budgetDisp={ms.budgetDisp}
          totVar={ms.totVar}
          cassaTotale={cassaTotale}
          onClose={() => { setModal(null); setConfirmPrelievo(null); setPendingTxForm(null); }}
          onSaveTx={handleSaveTx}
          onConfirmPrelievo={handleConfirmPrelievo}
          onSaveEntrata={handleSaveEntrata}
          onSaveFissa={handleSaveFissa}
        />
      )}

      <Toast msg={toast}/>
    </div>
  );
}
