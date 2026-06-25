import { useState, useEffect, useCallback, useRef } from "react";

// ── CONFIG ──────────────────────────────────────────────────────
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbypspQj6p1pYQcholAe6Wdc1bkkDZbcGFceAYLaFw8WDlgsXgN19HDlLscqTUjtGa03vA/exec";
const ADMIN_WA = "6281234539872"; // Ganti nomor WA admin
// ────────────────────────────────────────────────────────────────

// ── PALETTE (Light, fresh, pro) ─────────────────────────────────
const C = {
  bg:        "#f0f7f0",
  bgCard:    "#ffffff",
  bgSub:     "#e8f5e8",
  border:    "#d1e8d1",
  green:     "#16a34a",
  greenMid:  "#22c55e",
  greenPale: "#dcfce7",
  greenDark: "#14532d",
  teal:      "#0d9488",
  tealPale:  "#ccfbf1",
  amber:     "#d97706",
  amberPale: "#fef3c7",
  red:       "#dc2626",
  redPale:   "#fee2e2",
  text:      "#1a2e1a",
  textMid:   "#374f37",
  textSub:   "#6b7f6b",
  textMuted: "#9baf9b",
  white:     "#ffffff",
  shadow:    "0 2px 12px rgba(22,163,74,0.10)",
  shadowLg:  "0 4px 24px rgba(22,163,74,0.14)",
};

// ── UTILS ───────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(n||0);
const todayISO = () => new Date().toISOString().split("T")[0];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,5);

async function apiCall(action, payload={}) {
  if (APPS_SCRIPT_URL.includes("GANTI")) return { success: false, demo: true };
  try {
    if (action === "getData") {
      // GET request untuk hindari CORS preflight
      const url = APPS_SCRIPT_URL + "?action=getData";
      const r = await fetch(url, {method:"GET", redirect:"follow"});
      const text = await r.text();
      return JSON.parse(text);
    } else {
      // POST untuk write operations
      const r = await fetch(APPS_SCRIPT_URL, {
        method:"POST",
        redirect:"follow",
        headers:{"Content-Type":"text/plain"},
        body:JSON.stringify({action,...payload})
      });
      const text = await r.text();
      return JSON.parse(text);
    }
  } catch(e) { return {success:false,error:e.message}; }
}

// ── ICONS ───────────────────────────────────────────────────────
const Ic = ({n,sz=20,cl=""}) => {
  const d = {
    home:     "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
    cart:     "M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5.2 6H19l-1.68 8.39c-.16.81-.87 1.41-1.7 1.61H8.53c-.83-.2-1.53-.8-1.7-1.61L5.2 6zM1 1h3l.74 3H23l-3 8H7L4.27 4H1V1z",
    store:    "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    box:      "M20 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-8 9l-4-4h2.5v-4h3v4H16l-4 4zM20 5H4V3h16v2z",
    chart:    "M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z",
    plus:     "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    sync:     "M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z",
    close:    "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
    send:     "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z",
    check:    "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
    wa:       "M12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.43 1.27 4.88L2 22l5.27-1.24C8.61 21.57 10.27 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z",
    edit:     "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
    trash:    "M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z",
    spark:    "M7 2v11h3v9l7-12h-4l4-8z",
    arrow:    "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z",
    img:      "M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z",
    warn:     "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
    star:     "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
    gift:     "M20 6h-2.18c.07-.23.18-.45.18-.7C18 3.48 16.52 2 14.7 2c-.9 0-1.68.37-2.2.96L12 3.4l-.5-.44C11 2.37 10.2 2 9.3 2 7.48 2 6 3.48 6 5.3c0 .25.1.48.18.7H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5.3-2.5c.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3h-2.06c.35-.98 1.26-2.6 2.06-2.6zM9.3 3.5c.8 0 1.71 1.62 2.06 2.6H9.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3z",
  };
  return <svg width={sz} height={sz} viewBox="0 0 24 24" fill="currentColor" style={{flexShrink:0}}><path d={d[n]||d.close}/></svg>;
};

// ── DUMMY DATA ──────────────────────────────────────────────────
const D_OUTLETS = [
  {id:"O1",nama:"Toko Maju Jaya",alamat:"Jl. Pasar Baru No. 12",kontak:"081234567890",aktif:true},
  {id:"O2",nama:"UD Sumber Rejeki",alamat:"Jl. Raya Timur No. 45",kontak:"082345678901",aktif:true},
  {id:"O3",nama:"Toko Berkah Abadi",alamat:"Jl. Pelabuhan No. 7",kontak:"083456789012",aktif:false},
];
const D_PRODUK = [
  {id:"P1",nama:"Kompas 25kg",satuan:"Sak",harga:185000,stok:120,foto:"",emoji:"🌾"},
  {id:"P2",nama:"Kompas 10kg",satuan:"Sak",harga:78000,stok:85,foto:"",emoji:"🌾"},
  {id:"P3",nama:"Gatotkaca 25kg",satuan:"Sak",harga:175000,stok:60,foto:"",emoji:"🏔️"},
  {id:"P4",nama:"Gatotkaca 10kg",satuan:"Sak",harga:72000,stok:40,foto:"",emoji:"🏔️"},
  {id:"P5",nama:"Gerbang 25kg",satuan:"Sak",harga:180000,stok:95,foto:"",emoji:"🚪"},
  {id:"P6",nama:"Gerbang 10kg",satuan:"Sak",harga:75000,stok:50,foto:"",emoji:"🚪"},
];
const D_TX = [
  {id:"T001",tanggal:todayISO(),outlet:"Toko Maju Jaya",outletKontak:"081234567890",items:[{produk:"Kompas 25kg",qty:10,satuan:"Sak",harga:185000,subtotal:1850000}],total:1850000,kirimWA:true,kirimWAAt:"07:45"},
  {id:"T002",tanggal:todayISO(),outlet:"UD Sumber Rejeki",outletKontak:"082345678901",items:[{produk:"Gatotkaca 25kg",qty:5,satuan:"Sak",harga:175000,subtotal:875000},{produk:"Gerbang 10kg",qty:8,satuan:"Sak",harga:75000,subtotal:600000}],total:1475000,kirimWA:false},
];

// ── STYLES ──────────────────────────────────────────────────────
const css = {
  app:   { background:C.bg, minHeight:"100vh", color:C.text, fontFamily:"'Inter',system-ui,sans-serif", maxWidth:480, margin:"0 auto", paddingBottom:88 },
  hdr:   { background:C.white, padding:"14px 18px 12px", borderBottom:"1px solid "+C.border, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 12px rgba(22,163,74,0.10)" },
  logo:  { color:C.greenDark, fontWeight:900, fontSize:21, letterSpacing:2.5 },
  nav:   { position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:C.white, borderTop:"1px solid "+C.border, display:"flex", zIndex:200, boxShadow:"0 -2px 16px rgba(0,0,0,0.07)" },
  navB:  (a) => ({ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"10px 4px 8px", cursor:"pointer", color:a?C.green:C.textMuted, fontSize:10, fontWeight:a?700:500, gap:3, background:"transparent", border:"none", transition:"color 0.2s", borderTop: a?"2px solid "+C.green:"2px solid transparent" }),
  card:  { background:C.bgCard, borderRadius:16, padding:16, border:"1px solid "+C.border, marginBottom:12, boxShadow:"0 2px 12px rgba(22,163,74,0.10)" },
  hero:  { background:"linear-gradient(135deg,"+C.greenDark+" 0%,"+C.green+" 100%)", borderRadius:20, padding:22, marginBottom:14, boxShadow:"0 4px 24px rgba(22,163,74,0.14)", color:C.white },
  lbl:   { color:C.textSub, fontSize:12, marginBottom:5, fontWeight:600, letterSpacing:0.3 },
  bigN:  { fontSize:34, fontWeight:900, color:C.white, lineHeight:1.1 },
  g2:    { display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 },
  inp:   { background:C.bgSub, border:"1.5px solid "+C.border, borderRadius:10, color:C.text, padding:"11px 13px", fontSize:14, width:"100%", boxSizing:"border-box", outline:"none", fontFamily:"inherit" },
  sel:   { background:C.bgSub, border:"1.5px solid "+C.border, borderRadius:10, color:C.text, padding:"11px 13px", fontSize:14, width:"100%", boxSizing:"border-box", outline:"none", fontFamily:"inherit" },
  btn:   (v="p") => ({
    background: v==="p"?C.green : v==="wa"?"#25d366" : v==="g"?C.bgSub : v==="r"?C.red : C.border,
    color: v==="p"||v==="wa"||v==="r" ? C.white : C.textMid,
    border:"none", borderRadius:12, padding:"13px 20px", fontWeight:700, fontSize:14,
    cursor:"pointer", width:"100%", marginTop:6, display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow: v==="p"?"0 2px 10px rgba(22,163,74,0.3)":v==="wa"?"0 2px 10px rgba(37,211,102,0.3)":"none",
  }),
  btnS:  (v="p") => ({
    background: v==="p"?C.green : v==="g"?"transparent" : v==="r"?C.red : C.bgSub,
    color: v==="p"?C.white : v==="g"?C.green : v==="r"?C.white : C.textMid,
    border: v==="g"?"1.5px solid "+C.green:"1.5px solid "+(v==="p"?C.green:v==="r"?C.red:C.border),
    borderRadius:9, padding:"7px 14px", fontWeight:700, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:5,
  }),
  sec:   { fontSize:11, fontWeight:800, color:C.textSub, marginBottom:10, letterSpacing:1.5, textTransform:"uppercase" },
  pill:  (v="g") => ({ background: v==="g"?C.greenPale:v==="a"?C.amberPale:v==="r"?C.redPale:C.tealPale, color: v==="g"?C.green:v==="a"?C.amber:v==="r"?C.red:C.teal, fontSize:10, padding:"3px 9px", borderRadius:20, fontWeight:700, display:"inline-flex", alignItems:"center", gap:3 }),
};

// ── TOAST ───────────────────────────────────────────────────────
function Toast({msg,type,onDone}) {
  useEffect(()=>{const t=setTimeout(onDone,3200);return()=>clearTimeout(t);},[]);
  const bg = type==="ok"?C.green:type==="wa"?"#25d366":type==="err"?C.red:C.amber;
  return <div style={{position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",background:bg,color:C.white,padding:"11px 22px",borderRadius:12,zIndex:9999,fontSize:13,fontWeight:700,boxShadow:"0 4px 24px rgba(22,163,74,0.14)",maxWidth:320,textAlign:"center",pointerEvents:"none"}}>{msg}</div>;
}

// ── ROOT APP ─────────────────────────────────────────────────────
export default function OrderKuNBX() {
  const [tab,setTab]       = useState("home");
  const [synced,setSynced] = useState(false);
  const [outlets,setOutlets]     = useState(D_OUTLETS);
  const [produk,setProduk]       = useState(D_PRODUK);
  const [transaksi,setTransaksi] = useState(D_TX);
  const [toast,setToast]         = useState(null);
  const [aiInsight,setAiInsight] = useState(null);
  const [loadingAI,setLoadingAI] = useState(false);

  const showToast = (msg,type="ok") => setToast({msg,type});

  const syncData = useCallback(async()=>{
    if(APPS_SCRIPT_URL.includes("GANTI")){ showToast("Mode demo aktif","a"); return; }
    const r = await apiCall("getData");
    if(r.success){
      if(r.outlets)setOutlets(r.outlets);
      if(r.produk)setProduk(r.produk);
      if(r.transaksi)setTransaksi(r.transaksi);
      setSynced(true); showToast("Data tersinkron!");
    } else showToast("Gagal sinkron","err");
  },[]);

  useEffect(()=>{ syncData(); },[]);

  // AI Insight
  const fetchAI = useCallback(async()=>{
    setLoadingAI(true);
    const totalBulan = transaksi.reduce((s,t)=>s+t.total,0);
    const totalHari  = transaksi.filter(t=>t.tanggal===todayISO()).reduce((s,t)=>s+t.total,0);
    const produkTerjual = {};
    transaksi.forEach(tx=>tx.items.forEach(i=>{
      produkTerjual[i.produk]=(produkTerjual[i.produk]||0)+i.qty;
    }));
    const topProduk = Object.entries(produkTerjual).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([n,q])=>""+n+"("+q+"sak)").join(", ");
    const stokRendah = produk.filter(p=>p.stok<25).map(p=>""+p.nama+"("+p.stok+"sak)").join(", ");
    const outletAktif = outlets.filter(o=>o.aktif).length;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:1000,
          system:"Kamu adalah konsultan sales & marketing berpengalaman untuk distributor tepung terigu di wilayah Indonesia Timur. Berikan analisis singkat dan actionable dalam Bahasa Indonesia non-formal. Fokus pada: 1) situasi penjualan saat ini, 2) rekomendasi promo spesifik, 3) ide event atau program yang bisa meningkatkan omset, 4) produk mana yang perlu didorong. Jawab dengan format JSON: {\"situasi\":\"...\",\"promo\":[\"...\",\"...\"],\"event\":[\"...\",\"...\"],\"push_produk\":\"...\",\"target_minggu\":\"...\"} JSON saja tanpa markdown.",
          messages:[{role:"user",content:"Data penjualan SPR Nabire: Total bulan ini Rp"+totalBulan.toLocaleString("id-ID")+", hari ini Rp"+totalHari.toLocaleString("id-ID")+", total transaksi "+transaksi.length+", outlet aktif "+outletAktif+", top produk: "+(topProduk||"belum ada data")+", stok hampir habis: "+(stokRendah||"tidak ada")+", produk tersedia: "+produk.map(p=>p.nama).join(", ")+". Berikan insight dan strategi konkret untuk meningkatkan omset minggu ini."}],
        }),
      });
      const data = await res.json();
      const txt = data.content?.find(b=>b.type==="text")?.text||"{}";
      const clean = txt.replace(/[]{3}json/g,"").replace(/[]{3}/g,"").trim();
      try{ setAiInsight(JSON.parse(clean)); } catch(pe){ setAiInsight({situasi:"Format AI tidak valid, coba refresh.",promo:[],event:[],push_produk:"",target_minggu:""}); }
    } catch(e){ setAiInsight({situasi:"Gagal memuat insight AI. Coba lagi.",promo:[],event:[],push_produk:"",target_minggu:""}); }
    setLoadingAI(false);
  },[transaksi,produk,outlets]);

  useEffect(()=>{ fetchAI(); },[]);

  const totalBulan = transaksi.reduce((s,t)=>s+t.total,0);
  const totalHari  = transaksi.filter(t=>t.tanggal===todayISO()).reduce((s,t)=>s+t.total,0);
  const txHari     = transaksi.filter(t=>t.tanggal===todayISO()).length;
  const outAktif   = outlets.filter(o=>o.aktif).length;
  const totalQty   = transaksi.flatMap(t=>t.items).reduce((s,i)=>s+i.qty,0);

  return (
    <div style={css.app}>
      {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}

      {/* HEADER */}
      <div style={css.hdr}>
        <span style={css.logo}>ORDERKU NBX</span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={syncData} style={{background:"none",border:"none",color:C.textSub,cursor:"pointer",padding:4,borderRadius:8}}><Ic n="sync" sz={17}/></button>
          <span style={{background:synced?C.greenPale:C.amberPale,color:synced?C.green:C.amber,fontSize:11,padding:"4px 11px",borderRadius:20,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"currentColor",display:"inline-block"}}/>
            {synced?"Tersinkron":"Demo"}
          </span>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div style={{padding:"16px 14px 0"}}>
        {tab==="home"&&<Home {...{totalBulan,totalHari,txHari,outAktif,totalQty,transaksi,setTab,aiInsight,loadingAI,fetchAI}}/>}
        {tab==="transaksi"&&<Transaksi {...{outlets,produk,transaksi,setTransaksi,showToast}}/>}
        {tab==="outlet"&&<Outlet {...{outlets,setOutlets,showToast}}/>}
        {tab==="barang"&&<Barang {...{produk,setProduk,showToast}}/>}
        {tab==="laporan"&&<Laporan {...{transaksi}}/>}
      </div>

      {/* NAV */}
      <nav style={css.nav}>
        {[{k:"home",i:"home",l:"Beranda"},{k:"transaksi",i:"cart",l:"Transaksi"},{k:"outlet",i:"store",l:"Outlet"},{k:"barang",i:"box",l:"Barang"},{k:"laporan",i:"chart",l:"Laporan"}].map(({k,i,l})=>(
          <button key={k} onClick={()=>setTab(k)} style={css.navB(tab===k)}><Ic n={i} sz={22}/>{l}</button>
        ))}
      </nav>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// HOME
// ════════════════════════════════════════════════════════════════
function Home({totalBulan,totalHari,txHari,outAktif,totalQty,transaksi,setTab,aiInsight,loadingAI,fetchAI}){
  const recent=[...transaksi].reverse().slice(0,3);
  return(
    <div>
      {/* HERO */}
      <div style={css.hero}>
        <div style={{fontSize:12,fontWeight:700,opacity:0.75,letterSpacing:1,marginBottom:6}}>PENJUALAN BULAN INI</div>
        <div style={css.bigN}>{fmt(totalBulan)}</div>
        <div style={{fontSize:12,opacity:0.8,marginTop:6}}>{transaksi.length} transaksi total</div>
        <div style={{display:"flex",gap:8,marginTop:14}}>
          <div style={{background:"rgba(255,255,255,0.15)",borderRadius:12,padding:"10px 16px",flex:1}}>
            <div style={{fontSize:11,opacity:0.75}}>Hari Ini</div>
            <div style={{fontWeight:800,fontSize:18}}>{fmt(totalHari)}</div>
            <div style={{fontSize:11,opacity:0.7}}>{txHari} transaksi</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.15)",borderRadius:12,padding:"10px 16px",flex:1}}>
            <div style={{fontSize:11,opacity:0.75}}>Outlet Aktif</div>
            <div style={{fontWeight:800,fontSize:18}}>{outAktif}</div>
            <div style={{fontSize:11,opacity:0.7}}>{totalQty} item terjual</div>
          </div>
        </div>
      </div>

      {/* QUICK NAV */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
        {[{i:"cart",l:"Order",k:"transaksi",bg:C.greenPale,cl:C.green},{i:"box",l:"Produk",k:"barang",bg:C.tealPale,cl:C.teal},{i:"store",l:"Outlet",k:"outlet",bg:C.amberPale,cl:C.amber},{i:"chart",l:"Laporan",k:"laporan",bg:"#ede9fe",cl:"#7c3aed"}].map(({i,l,k,bg,cl})=>(
          <button key={k} onClick={()=>setTab(k)} style={{background:bg,border:"none",borderRadius:14,padding:"14px 4px 10px",display:"flex",flexDirection:"column",alignItems:"center",gap:7,cursor:"pointer",color:cl,fontSize:11,fontWeight:700,boxShadow:"0 2px 12px rgba(22,163,74,0.10)"}}>
            <Ic n={i} sz={24}/>{l}
          </button>
        ))}
      </div>

      {/* AI INSIGHT PANEL */}
      <div style={{...css.card,border:"1.5px solid "+C.greenMid,background:"linear-gradient(135deg,#f0fdf4,#ffffff)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{background:C.green,borderRadius:10,padding:7,display:"flex"}}><Ic n="spark" sz={14} cl="#fff"/></div>
            <div>
              <div style={{fontWeight:800,fontSize:14,color:C.greenDark}}>Insight Pasar AI</div>
              <div style={{fontSize:11,color:C.textSub}}>Rekomendasi untuk Nabire</div>
            </div>
          </div>
          <button onClick={fetchAI} style={{background:"none",border:"none",cursor:"pointer",color:C.green,padding:4,borderRadius:8}} title="Refresh AI"><Ic n="sync" sz={16}/></button>
        </div>

        {loadingAI?(
          <div style={{textAlign:"center",padding:"20px 0",color:C.textSub,fontSize:13}}>
            <div style={{marginBottom:8}}>🤖 Memuat analisis AI...</div>
            <div style={{height:4,background:C.bgSub,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:"60%",background:C.green,borderRadius:4,animation:"pulse 1.5s infinite"}}/></div>
          </div>
        ):aiInsight?(
          <div>
            {/* Situasi */}
            {aiInsight.situasi&&<div style={{background:C.bgSub,borderRadius:10,padding:"10px 13px",marginBottom:10,fontSize:13,color:C.textMid,lineHeight:1.6}}>📊 {aiInsight.situasi}</div>}

            {/* Promo */}
            {aiInsight.promo?.length>0&&(
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:800,co
