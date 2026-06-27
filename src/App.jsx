import { useState, useEffect, useCallback, useRef } from "react";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbypspQj6p1pYQcholAe6Wdc1bkkDZbcGFceAYLaFw8WDlgsXgN19HDlLscqTUjtGa03vA/exec";
const ADMIN_WA = "6281234539872";

const C = {
  bg:"#f0f7f0",bgCard:"#ffffff",bgSub:"#e8f5e8",border:"#d1e8d1",
  green:"#16a34a",greenMid:"#22c55e",greenPale:"#dcfce7",greenDark:"#14532d",
  teal:"#0d9488",tealPale:"#ccfbf1",amber:"#d97706",amberPale:"#fef3c7",
  red:"#dc2626",redPale:"#fee2e2",text:"#1a2e1a",textMid:"#374f37",
  textSub:"#6b7f6b",textMuted:"#9baf9b",white:"#ffffff",
};

const fmt = (n) => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",minimumFractionDigits:0}).format(n||0);

const todayISO = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth()+1).padStart(2,"0");
  const d = String(now.getDate()).padStart(2,"0");
  return y+"-"+m+"-"+d;
};

const normTgl = (tgl) => {
  if(!tgl) return "";
  const s = String(tgl);
  if(/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0,10);
  const d = new Date(tgl);
  if(!isNaN(d.getTime())) {
    return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  }
  return s.slice(0,10);
};

const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,5);

async function apiCall(action, payload={}) {
  if(APPS_SCRIPT_URL.includes("GANTI")) return {success:false,demo:true};
  try {
    if(action==="getData"){
      const r = await fetch(APPS_SCRIPT_URL+"?action=getData",{method:"GET",redirect:"follow"});
      return JSON.parse(await r.text());
    } else {
      const r = await fetch(APPS_SCRIPT_URL,{method:"POST",redirect:"follow",headers:{"Content-Type":"text/plain"},body:JSON.stringify({action,...payload})});
      return JSON.parse(await r.text());
    }
  } catch(e){ return {success:false,error:e.message}; }
}

const Ic = ({n,sz=20}) => {
  const d = {
    home:"M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
    cart:"M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5.2 6H19l-1.68 8.39c-.16.81-.87 1.41-1.7 1.61H8.53c-.83-.2-1.53-.8-1.7-1.61L5.2 6zM1 1h3l.74 3H23l-3 8H7L4.27 4H1V1z",
    store:"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
    box:"M20 7H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-8 9l-4-4h2.5v-4h3v4H16l-4 4zM20 5H4V3h16v2z",
    chart:"M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z",
    plus:"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    sync:"M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z",
    close:"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
    send:"M2.01 21L23 12 2.01 3 2 10l15 2-15 2z",
    check:"M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
    wa:"M12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.43 1.27 4.88L2 22l5.27-1.24C8.61 21.57 10.27 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z",
    edit:"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
    trash:"M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z",
    spark:"M7 2v11h3v9l7-12h-4l4-8z",
    img:"M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z",
    warn:"M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
    arrow:"M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z",
  };
  return <svg width={sz} height={sz} viewBox="0 0 24 24" fill="currentColor" style={{flexShrink:0}}><path d={d[n]||d.close}/></svg>;
};

const css = {
  app:{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"'Inter',system-ui,sans-serif",maxWidth:480,margin:"0 auto",paddingBottom:88},
  hdr:{background:C.white,padding:"14px 18px 12px",borderBottom:"1px solid "+C.border,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 12px rgba(22,163,74,0.10)"},
  logo:{color:C.greenDark,fontWeight:900,fontSize:21,letterSpacing:2.5},
  nav:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:C.white,borderTop:"1px solid "+C.border,display:"flex",zIndex:200,boxShadow:"0 -2px 16px rgba(0,0,0,0.07)"},
  navB:(a)=>({flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 4px 8px",cursor:"pointer",color:a?C.green:C.textMuted,fontSize:10,fontWeight:a?700:500,gap:3,background:"transparent",border:"none",borderTop:a?"2px solid "+C.green:"2px solid transparent"}),
  card:{background:C.bgCard,borderRadius:16,padding:16,border:"1px solid "+C.border,marginBottom:12,boxShadow:"0 2px 12px rgba(22,163,74,0.10)"},
  hero:{background:"linear-gradient(135deg,"+C.greenDark+" 0%,"+C.green+" 100%)",borderRadius:20,padding:22,marginBottom:14,boxShadow:"0 4px 24px rgba(22,163,74,0.14)",color:C.white},
  lbl:{color:C.textSub,fontSize:12,marginBottom:5,fontWeight:600},
  bigN:{fontSize:34,fontWeight:900,color:C.white,lineHeight:1.1},
  g2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12},
  inp:{background:C.bgSub,border:"1.5px solid "+C.border,borderRadius:10,color:C.text,padding:"11px 13px",fontSize:14,width:"100%",boxSizing:"border-box",outline:"none",fontFamily:"inherit"},
  sel:{background:C.bgSub,border:"1.5px solid "+C.border,borderRadius:10,color:C.text,padding:"11px 13px",fontSize:14,width:"100%",boxSizing:"border-box",outline:"none",fontFamily:"inherit"},
  btn:(v="p")=>({background:v==="p"?C.green:v==="wa"?"#25d366":v==="g"?C.bgSub:v==="r"?C.red:C.border,color:v==="p"||v==="wa"||v==="r"?C.white:C.textMid,border:"none",borderRadius:12,padding:"13px 20px",fontWeight:700,fontSize:14,cursor:"pointer",width:"100%",marginTop:6,display:"flex",alignItems:"center",justifyContent:"center",gap:7,boxShadow:v==="p"?"0 2px 10px rgba(22,163,74,0.3)":v==="wa"?"0 2px 10px rgba(37,211,102,0.3)":"none"}),
  btnS:(v="p")=>({background:v==="p"?C.green:v==="g"?"transparent":v==="r"?C.red:C.bgSub,color:v==="p"?C.white:v==="g"?C.green:v==="r"?C.white:C.textMid,border:v==="g"?"1.5px solid "+C.green:"1.5px solid "+(v==="p"?C.green:v==="r"?C.red:C.border),borderRadius:9,padding:"7px 14px",fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5}),
  sec:{fontSize:11,fontWeight:800,color:C.textSub,marginBottom:10,letterSpacing:1.5,textTransform:"uppercase"},
  pill:(v="g")=>({background:v==="g"?C.greenPale:v==="a"?C.amberPale:v==="r"?C.redPale:C.tealPale,color:v==="g"?C.green:v==="a"?C.amber:v==="r"?C.red:C.teal,fontSize:10,padding:"3px 9px",borderRadius:20,fontWeight:700,display:"inline-flex",alignItems:"center",gap:3}),
};

function Toast({msg,type,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3200);return()=>clearTimeout(t);},[]);
  const bg=type==="ok"?C.green:type==="wa"?"#25d366":type==="err"?C.red:C.amber;
  return <div style={{position:"fixed",top:60,left:"50%",transform:"translateX(-50%)",background:bg,color:C.white,padding:"11px 22px",borderRadius:12,zIndex:9999,fontSize:13,fontWeight:700,boxShadow:"0 4px 24px rgba(22,163,74,0.14)",maxWidth:340,textAlign:"center",pointerEvents:"none"}}>{msg}</div>;
}

export default function OrderKuNBX() {
  const [tab,setTab] = useState("home");
  const [synced,setSynced] = useState(false);
  const [outlets,setOutlets] = useState([]);
  const [produk,setProduk] = useState([]);
  const [transaksi,setTransaksi] = useState([]);
  const [toast,setToast] = useState(null);
  const [aiInsight,setAiInsight] = useState(null);
  const [loadingAI,setLoadingAI] = useState(false);

  const showToast = (msg,type="ok") => setToast({msg,type});

  const syncData = useCallback(async()=>{
    if(APPS_SCRIPT_URL.includes("GANTI")){showToast("Mode demo","a");return;}
    const r = await apiCall("getData");
    if(r.success){
      if(r.outlets) setOutlets(r.outlets);
      if(r.produk) setProduk(r.produk);
      if(r.transaksi) setTransaksi(r.transaksi);
      setSynced(true); showToast("Data tersinkron!");
    } else showToast("Gagal sinkron","err");
  },[]);

  useEffect(()=>{ syncData(); },[]);

  const fetchAI = useCallback(async()=>{
    setLoadingAI(true);
    const totalBulan = transaksi.reduce((s,t)=>s+t.total,0);
    const totalHari = transaksi.filter(t=>normTgl(t.tanggal)===todayISO()).reduce((s,t)=>s+t.total,0);
    const pMap = {};
    transaksi.forEach(tx=>tx.items.forEach(i=>{ pMap[i.produk]=(pMap[i.produk]||0)+i.qty; }));
    const topProduk = Object.entries(pMap).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([n,q])=>n+"("+q+")").join(", ");
    const stokRendah = produk.filter(p=>p.stok<25).map(p=>p.nama).join(", ");
    const outletAktif = outlets.filter(o=>o.aktif).length;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-6",
          max_tokens:1000,
          system:"Kamu konsultan sales distributor tepung terigu Nabire Papua. Jawab Bahasa Indonesia informal. Format JSON saja tanpa markdown: {\"situasi\":\"...\",\"promo\":[\"...\"],\"event\":[\"...\"],\"push_produk\":\"...\",\"target_minggu\":\"...\"}",
          messages:[{role:"user",content:"Data: bulan Rp"+totalBulan+", hari Rp"+totalHari+", "+transaksi.length+" tx, "+outletAktif+" outlet, top: "+(topProduk||"belum ada")+", tipis: "+(stokRendah||"aman")+". Beri strategi."}],
        }),
      });
      const data = await res.json();
      const txt = data.content?.find(b=>b.type==="text")?.text||"{}";
      const clean = txt.replace(/[`]{3}json/g,"").replace(/[`]{3}/g,"").trim();
      try{ setAiInsight(JSON.parse(clean)); }
      catch(pe){ setAiInsight({situasi:clean.slice(0,300),promo:[],event:[],push_produk:"",target_minggu:""}); }
    } catch(e){ setAiInsight({situasi:"Gagal memuat insight AI.",promo:[],event:[],push_produk:"",target_minggu:""}); }
    setLoadingAI(false);
  },[transaksi,produk,outlets]);

  useEffect(()=>{ fetchAI(); },[]);

  const today = todayISO();
  const bulanIni = today.slice(0,7);
  const totalBulan = transaksi.reduce((s,t)=>s+t.total,0);
  const totalHari = transaksi.filter(t=>normTgl(t.tanggal)===today).reduce((s,t)=>s+t.total,0);
  const txHari = transaksi.filter(t=>normTgl(t.tanggal)===today).length;
  const outletTxBulan = new Set(transaksi.filter(t=>normTgl(t.tanggal).slice(0,7)===bulanIni).map(t=>t.outlet));
  const totalOutlet = outlets.filter(o=>o.aktif).length;
  const outAktifPct = totalOutlet>0 ? Math.round(outletTxBulan.size/totalOutlet*100) : 0;
  const totalQty = transaksi.flatMap(t=>t.items).reduce((s,i)=>s+i.qty,0);

  return (
    <div style={css.app}>
      {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
      <div style={css.hdr}>
        <span style={css.logo}>ORDERKU NBX</span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={syncData} style={{background:"none",border:"none",color:C.textSub,cursor:"pointer",padding:4}}><Ic n="sync" sz={17}/></button>
          <span style={{background:synced?C.greenPale:C.amberPale,color:synced?C.green:C.amber,fontSize:11,padding:"4px 11px",borderRadius:20,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"currentColor",display:"inline-block"}}/>
            {synced?"Tersinkron":"Demo"}
          </span>
        </div>
      </div>
      <div style={{padding:"16px 14px 0"}}>
        {tab==="home"&&<Home {...{totalBulan,totalHari,txHari,outAktifPct,outletTxBulan,totalOutlet,totalQty,transaksi,setTab,aiInsight,loadingAI,fetchAI}}/>}
        {tab==="transaksi"&&<Transaksi {...{outlets,produk,transaksi,setTransaksi,showToast}}/>}
        {tab==="outlet"&&<Outlet {...{outlets,setOutlets,showToast}}/>}
        {tab==="barang"&&<Barang {...{produk,setProduk,showToast}}/>}
        {tab==="laporan"&&<Laporan {...{transaksi}}/>}
      </div>
      <nav style={css.nav}>
        {[{k:"home",i:"home",l:"Beranda"},{k:"transaksi",i:"cart",l:"Transaksi"},{k:"outlet",i:"store",l:"Outlet"},{k:"barang",i:"box",l:"Barang"},{k:"laporan",i:"chart",l:"Laporan"}].map(({k,i,l})=>(
          <button key={k} onClick={()=>setTab(k)} style={css.navB(tab===k)}><Ic n={i} sz={22}/>{l}</button>
        ))}
      </nav>
    </div>
  );
}

function Home({totalBulan,totalHari,txHari,outAktifPct,outletTxBulan,totalOutlet,totalQty,transaksi,setTab,aiInsight,loadingAI,fetchAI}){
  const recent = [...transaksi].reverse().slice(0,3);
  return(
    <div>
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
            <div style={{fontSize:11,opacity:0.75}}>Outlet Transaksi</div>
            <div style={{fontWeight:800,fontSize:18}}>{outAktifPct}%</div>
            <div style={{fontSize:11,opacity:0.7}}>{outletTxBulan.size}/{totalOutlet} outlet</div>
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
        {[{i:"cart",l:"Order",k:"transaksi",bg:C.greenPale,cl:C.green},{i:"box",l:"Produk",k:"barang",bg:C.tealPale,cl:C.teal},{i:"store",l:"Outlet",k:"outlet",bg:C.amberPale,cl:C.amber},{i:"chart",l:"Laporan",k:"laporan",bg:"#ede9fe",cl:"#7c3aed"}].map(({i,l,k,bg,cl})=>(
          <button key={k} onClick={()=>setTab(k)} style={{background:bg,border:"none",borderRadius:14,padding:"14px 4px 10px",display:"flex",flexDirection:"column",alignItems:"center",gap:7,cursor:"pointer",color:cl,fontSize:11,fontWeight:700,boxShadow:"0 2px 12px rgba(22,163,74,0.10)"}}>
            <Ic n={i} sz={24}/>{l}
          </button>
        ))}
      </div>

      <div style={{...css.card,border:"1.5px solid "+C.greenMid,background:"linear-gradient(135deg,#f0fdf4,#ffffff)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{background:C.green,borderRadius:10,padding:7,display:"flex"}}><Ic n="spark" sz={14}/></div>
            <div>
              <div style={{fontWeight:800,fontSize:14,color:C.greenDark}}>Insight Pasar AI</div>
              <div style={{fontSize:11,color:C.textSub}}>Rekomendasi untuk Nabire</div>
            </div>
          </div>
          <button onClick={fetchAI} style={{background:"none",border:"none",cursor:"pointer",color:C.green,padding:4}}><Ic n="sync" sz={16}/></button>
        </div>
        {loadingAI?(
          <div style={{textAlign:"center",padding:"20px 0",color:C.textSub,fontSize:13}}>🤖 Memuat analisis AI...</div>
        ):aiInsight?(
          <div>
            {aiInsight.situasi&&<div style={{background:C.bgSub,borderRadius:10,padding:"10px 13px",marginBottom:10,fontSize:13,color:C.textMid,lineHeight:1.6}}>📊 {aiInsight.situasi}</div>}
            {aiInsight.promo&&aiInsight.promo.length>0&&(
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:800,color:C.amber,letterSpacing:1,marginBottom:6}}>🎯 REKOMENDASI PROMO</div>
                {aiInsight.promo.map((p,i)=>(
                  <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
                    <div style={{background:C.amberPale,color:C.amber,borderRadius:6,padding:"2px 7px",fontWeight:700,fontSize:11,whiteSpace:"nowrap"}}>Promo {i+1}</div>
                    <div style={{fontSize:12,color:C.textMid,lineHeight:1.5}}>{p}</div>
                  </div>
                ))}
              </div>
            )}
            {aiInsight.event&&aiInsight.event.length>0&&(
              <div style={{marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:800,color:"#7c3aed",letterSpacing:1,marginBottom:6}}>🎪 IDE EVENT</div>
                {aiInsight.event.map((e,i)=>(
                  <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
                    <div style={{background:"#ede9fe",color:"#7c3aed",borderRadius:6,padding:"2px 7px",fontWeight:700,fontSize:11,whiteSpace:"nowrap"}}>Ide {i+1}</div>
                    <div style={{fontSize:12,color:C.textMid,lineHeight:1.5}}>{e}</div>
                  </div>
                ))}
              </div>
            )}
            {aiInsight.push_produk&&<div style={{background:C.tealPale,borderRadius:10,padding:"8px 12px",marginBottom:8,fontSize:12,color:C.textMid}}>📦 <strong>Dorong:</strong> {aiInsight.push_produk}</div>}
            {aiInsight.target_minggu&&<div style={{background:C.greenPale,borderRadius:10,padding:"8px 12px",fontSize:12,color:C.textMid}}>🎯 <strong>Target:</strong> {aiInsight.target_minggu}</div>}
          </div>
        ):(
          <div style={{textAlign:"center",color:C.textSub,fontSize:13,padding:"16px 0"}}>Klik refresh untuk muat insight AI</div>
        )}
      </div>

      {recent.length>0&&(
        <div>
          <div style={css.sec}>Transaksi Terbaru</div>
          {recent.map(tx=>(
            <div key={tx.id} style={{...css.card,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:700,fontSize:13}}>{tx.outlet}</div>
                <div style={{fontSize:11,color:C.textSub,marginTop:2}}>{normTgl(tx.tanggal)} · {tx.items.length} item</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:C.green,fontWeight:800,fontSize:14}}>{fmt(tx.total)}</div>
                {tx.kirimWA&&<span style={css.pill("g")}><Ic n="check" sz={9}/>WA</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function buildPesanWA(tx, produkList) {
  const tglNorm = normTgl(tx.tanggal);
  const tglObj = new Date(tglNorm+"T00:00:00");
  const tglFmt = tglObj.toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"});
  const kontak = (tx.outletKontak||"-").replace(/^62/,"0").replace(/([0-9]{4})([0-9]{4})([0-9]+)/,"$1-$2-$3");
  const lines = tx.items.map(i=>{
    const p = produkList.find(p=>p.nama===i.produk);
    return (p&&p.emoji?p.emoji:"📦")+" "+i.produk+" x "+i.qty+" "+i.satuan+(i.diskon?" (paket)":"");
  }).join("\n");
  const rekapSatuan = {};
  tx.items.forEach(i=>{ rekapSatuan[i.satuan]=(rekapSatuan[i.satuan]||0)+i.qty; });
  const totalLine = Object.entries(rekapSatuan).map(([sat,qty])=>qty+" "+sat).join(", ");
  return [
    "*📝 ORDER BARU*","",
    "📅 "+tglFmt,
    "🏪 "+tx.outlet,
    "📞 "+kontak,
    "#"+tx.id,"",
    "*📦 Pesanan:*",
    lines,"",
    "📊 Total: "+totalLine,
    "⚡ Mohon siapkan barang ya"
  ].join("\n");
}

function Transaksi({outlets,produk,transaksi,setTransaksi,showToast}){
  const [step,setStep] = useState("outlet");
  const [outletId,setOutletId] = useState("");
  const [keranjang,setKeranjang] = useState({});
  const [saving,setSaving] = useState(false);
  const [showHistory,setShowHistory] = useState(false);
  const [paketModal,setPaketModal] = useState(null); // produk yang dilihat paketnya

  const outlet = outlets.find(o=>o.id===outletId);

  const getHarga = (id, qty) => {
    const p = produk.find(p=>p.id===id);
    if(!p) return 0;
    if(p.pakets&&p.pakets.length>0){
      const cocok = p.pakets.filter(pk=>qty>=pk.minQty).sort((a,b)=>b.minQty-a.minQty)[0];
      if(cocok) return cocok.harga;
    }
    return p.harga;
  };

  const totalItem = Object.values(keranjang).reduce((s,q)=>s+q,0);
  const totalHarga = Object.entries(keranjang).reduce((s,[id,qty])=>s+getHarga(id,qty)*qty,0);

  const add = (id) => setKeranjang(prev=>({...prev,[id]:(prev[id]||0)+1}));
  const kurang = (id) => setKeranjang(prev=>{
    const n={...prev};
    if(n[id]>1) n[id]--;
    else delete n[id];
    return n;
  });
  const hapusItem = (id) => setKeranjang(prev=>{const n={...prev};delete n[id];return n;});

  const kirimWA = (tx, isAdmin=true) => {
    const nomor = isAdmin ? ADMIN_WA : (tx.outletKontak||"").replace(/[^0-9]/g,"").replace(/^0/,"62");
    const pesan = buildPesanWA(tx, produk);
    window.open("https://wa.me/"+nomor+"?text="+encodeURIComponent(pesan),"_blank");
    setTransaksi(prev=>prev.map(t=>t.id===tx.id?{...t,kirimWA:true,kirimWAAt:normTgl(tx.tanggal)}:t));
    showToast("WhatsApp terbuka!","wa");
  };

  const checkout = async() => {
    const valid = Object.entries(keranjang).filter(([,q])=>q>0);
    if(!valid.length) return showToast("Keranjang kosong!","err");
    setSaving(true);
    const txItems = valid.map(([id,qty])=>{
      const p = produk.find(p=>p.id===id);
      const h = getHarga(id,qty);
      return {produk:p.nama,qty,satuan:p.satuan,harga:h,subtotal:h*qty,diskon:h<p.harga};
    });
    const tx = {
      id:"T"+uid(),
      tanggal:todayISO(),
      outlet:outlet.nama,
      outletKontak:outlet.kontak,
      items:txItems,
      total:txItems.reduce((s,i)=>s+i.subtotal,0),
      kirimWA:false
    };
    if(!APPS_SCRIPT_URL.includes("GANTI")) await apiCall("addTransaksi",{transaksi:tx});
    setTransaksi(prev=>[...prev,tx]);
    setKeranjang({}); setOutletId(""); setStep("outlet");
    showToast("Order tersimpan ke rekapan!");
    setSaving(false);
  };

  // Paket Modal
  const PaketModal = paketModal ? (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.5)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setPaketModal(null)}>
      <div style={{background:C.white,borderRadius:"20px 20px 0 0",padding:24,width:"100%",maxWidth:480,boxSizing:"border-box"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <div style={{fontWeight:800,fontSize:16,color:C.greenDark}}>{paketModal.nama}</div>
            <div style={{fontSize:12,color:C.textSub}}>Strata Harga</div>
          </div>
          <button onClick={()=>setPaketModal(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.textSub}}><Ic n="close" sz={22}/></button>
        </div>
        <div style={{...css.card,background:C.bgSub,marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:700,color:C.textSub,marginBottom:8}}>
            <span>Qty</span><span>Harga per {paketModal.satuan}</span>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid "+C.border}}>
            <span style={{fontSize:13,color:C.textMid}}>1 - {paketModal.pakets&&paketModal.pakets.length>0?paketModal.pakets.sort((a,b)=>a.minQty-b.minQty)[0].minQty-1:"∞"} {paketModal.satuan}</span>
            <span style={{fontSize:13,fontWeight:800,color:C.green}}>{fmt(paketModal.harga)}</span>
          </div>
          {paketModal.pakets&&paketModal.pakets.sort((a,b)=>a.minQty-b.minQty).map((pk,i)=>{
            const next = paketModal.pakets.sort((a,b)=>a.minQty-b.minQty)[i+1];
            return(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:"1px solid "+C.border}}>
                <span style={{fontSize:13,color:C.textMid}}>≥ {pk.minQty}{next?" - "+(next.minQty-1):""+" ↑"} {paketModal.satuan}</span>
                <div style={{textAlign:"right"}}>
                  <span style={{fontSize:13,fontWeight:800,color:C.amber}}>{fmt(pk.harga)}</span>
                  <div style={{fontSize:10,color:C.textMuted}}>hemat {fmt(paketModal.harga-pk.harga)}/sak</div>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={()=>setPaketModal(null)} style={css.btn()}>Tutup</button>
      </div>
    </div>
  ) : null;

  if(showHistory) return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={css.sec}>Riwayat ({transaksi.length})</div>
        <button onClick={()=>setShowHistory(false)} style={css.btnS("g")}><Ic n="close" sz={12}/>Tutup</button>
      </div>
      {[...transaksi].reverse().map(tx=>(
        <div key={tx.id} style={{...css.card,border:tx.kirimWA?"1.5px solid "+C.green:undefined}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div>
              <div style={{fontWeight:800,fontSize:14}}>{tx.outlet}</div>
              <div style={{fontSize:11,color:C.textSub}}>{normTgl(tx.tanggal)} · #{tx.id}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{color:C.green,fontWeight:900}}>{fmt(tx.total)}</div>
              {tx.kirimWA?<span style={css.pill("g")}><Ic n="check" sz={9}/>Terkirim</span>:<span style={css.pill("a")}><Ic n="warn" sz={9}/>Belum</span>}
            </div>
          </div>
          {tx.items.map((it,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textSub,padding:"3px 0",borderTop:"1px solid "+C.bgSub}}>
              <span>{it.produk} x{it.qty}{it.diskon?" 🏷️":""}</span>
              <span style={{fontWeight:600}}>{fmt(it.subtotal)}</span>
            </div>
          ))}
          {!tx.kirimWA?(
            <div style={{marginTop:10}}>
              <div style={{background:C.amberPale,borderRadius:8,padding:"7px 10px",marginBottom:8,fontSize:11,color:C.amber,fontWeight:600}}>
                ⚠️ Pastikan order ini BELUM dikirim ke admin sebelumnya untuk hindari dobel order!
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{if(window.confirm("Yakin kirim ke Admin WA? Pastikan belum pernah dikirim!"))kirimWA(tx,true);}} style={{...css.btn("wa"),flex:2,marginTop:0,fontSize:12,padding:"10px 12px"}}><Ic n="wa" sz={15}/>Kirim ke Admin</button>
                <button onClick={()=>{if(window.confirm("Kirim ke WA Outlet?"))kirimWA(tx,false);}} style={{...css.btn("g"),flex:1,marginTop:0,fontSize:11,padding:"10px",color:C.textMid}}>Outlet</button>
              </div>
            </div>
          ):(
            <div style={{marginTop:10,background:C.greenPale,borderRadius:8,padding:"7px 10px",fontSize:11,color:C.green,fontWeight:600,textAlign:"center"}}>
              ✅ Sudah dikirim ke Admin WA
            </div>
          )}
        </div>
      ))}
      {transaksi.length===0&&<div style={{textAlign:"center",color:C.textSub,padding:40}}>Belum ada transaksi</div>}
    </div>
  );

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:14}}>
        {["outlet","katalog","keranjang"].map((s,i)=>(
          <div key={s} style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:(step===s||(i===0&&step!=="outlet")||(i===1&&step==="keranjang"))?C.green:C.bgSub,color:(step===s||(i===0&&step!=="outlet")||(i===1&&step==="keranjang"))?C.white:C.textMuted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800}}>{i+1}</div>
            <span style={{fontSize:10,color:step===s?C.green:C.textMuted,fontWeight:step===s?700:400}}>{s==="outlet"?"Outlet":s==="katalog"?"Katalog":"Keranjang"}</span>
            {i<2&&<div style={{width:14,height:2,background:C.border}}/>}
          </div>
        ))}
      </div>

      {step==="outlet"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={css.sec}>Pilih Outlet</div>
            <button onClick={()=>setShowHistory(true)} style={css.btnS("g")}><Ic n="chart" sz={12}/>Riwayat</button>
          </div>
          {outlets.filter(o=>o.aktif).map(o=>(
            <div key={o.id} onClick={()=>{setOutletId(o.id);setStep("katalog");}} style={{...css.card,cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:46,height:46,borderRadius:10,background:C.greenPale,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:C.green}}><Ic n="store" sz={24}/></div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:14}}>{o.nama}</div>
                  <div style={{fontSize:12,color:C.textSub}}>{o.alamat}</div>
                  <div style={{fontSize:11,color:C.textMuted}}>📞 {o.kontak}</div>
                </div>
                <div style={{color:C.green}}><Ic n="arrow" sz={20}/></div>
              </div>
            </div>
          ))}
          {outlets.filter(o=>o.aktif).length===0&&<div style={{textAlign:"center",color:C.textSub,padding:40,fontSize:13}}>Tambah outlet dulu di menu Outlet!</div>}
        </div>
      )}

      {PaketModal}
      {step==="katalog"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <div style={css.sec}>Katalog Produk</div>
              <div style={{fontSize:12,color:C.green,fontWeight:700,marginTop:-6}}>🏪 {outlet&&outlet.nama}</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setStep("outlet")} style={css.btnS("g")}><Ic n="close" sz={12}/>Ganti</button>
            </div>
          </div>
          {totalItem>0&&(
            <button onClick={()=>setStep("keranjang")} style={{...css.btn(),marginBottom:14,marginTop:0}}>
              <Ic n="cart" sz={16}/>Keranjang ({totalItem} item) — {fmt(totalHarga)}
            </button>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {produk.map(p=>{
              const qty = keranjang[p.id]||0;
              const harga = getHarga(p.id, qty>0?qty:1);
              const adaDiskon = qty>0&&harga<p.harga;
              const adaPaket = p.pakets&&p.pakets.length>0;
              return(
                <div key={p.id} style={{background:C.bgCard,borderRadius:14,border:qty>0?"1.5px solid "+C.green:"1px solid "+C.border,overflow:"hidden",boxShadow:"0 2px 8px rgba(22,163,74,0.08)"}}>
                  <div style={{width:"100%",height:110,background:C.bgSub,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",position:"relative"}}>
                    {p.foto?<img src={p.foto} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={p.nama} onError={e=>{e.target.style.display="none";}}/>:null}
                    {!p.foto&&<span style={{fontSize:44}}>{p.emoji||"📦"}</span>}
                    {qty>0&&<div style={{position:"absolute",top:6,right:6,background:C.green,color:C.white,borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13}}>{qty}</div>}
                    {p.stok<20&&<div style={{position:"absolute",top:6,left:6,background:C.red,color:C.white,borderRadius:6,padding:"2px 5px",fontSize:9,fontWeight:700}}>Tipis!</div>}
                    {adaPaket&&<div onClick={(e)=>{e.stopPropagation();setPaketModal(p);}} style={{position:"absolute",bottom:6,left:6,background:C.amber,color:C.white,borderRadius:6,padding:"2px 5px",fontSize:9,fontWeight:700,cursor:"pointer"}}>🏷️ Paket</div>}
                  </div>
                  <div style={{padding:"8px 10px 10px"}}>
                    <div style={{fontWeight:700,fontSize:12,marginBottom:1,lineHeight:1.3}}>{p.nama}</div>
                    <div style={{fontSize:10,color:C.textSub}}>Stok: {p.stok} {p.satuan}</div>
                    <div style={{margin:"4px 0 8px"}}>
                      <span style={{color:adaDiskon?C.red:C.green,fontWeight:800,fontSize:13}}>{fmt(qty>0?harga:p.harga)}</span>
                      {adaDiskon&&<span style={{color:C.textMuted,fontSize:10,textDecoration:"line-through",marginLeft:4}}>{fmt(p.harga)}</span>}
                    </div>
                    {adaPaket&&qty===0&&(
                      <div style={{fontSize:9,color:C.amber,marginBottom:4}}>
                        {p.pakets.sort((a,b)=>a.minQty-b.minQty).map((pk,i)=>(
                          <div key={i}>Min {pk.minQty} → {fmt(pk.harga)}</div>
                        ))}
                      </div>
                    )}
                    {qty===0
                      ?<button onClick={()=>add(p.id)} style={{background:C.green,color:C.white,border:"none",borderRadius:8,padding:"7px 0",fontWeight:700,fontSize:12,cursor:"pointer",width:"100%"}}>+ Keranjang</button>
                      :<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:C.greenPale,borderRadius:8,padding:"4px 8px"}}>
                        <button onClick={()=>kurang(p.id)} style={{background:C.green,color:C.white,border:"none",borderRadius:6,width:28,height:28,fontWeight:800,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>-</button>
                        <span style={{fontWeight:800,color:C.greenDark,fontSize:15}}>{qty}</span>
                        <button onClick={()=>add(p.id)} style={{background:C.green,color:C.white,border:"none",borderRadius:6,width:28,height:28,fontWeight:800,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                      </div>
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step==="keranjang"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={css.sec}>Keranjang</div>
            <button onClick={()=>setStep("katalog")} style={css.btnS("g")}><Ic n="arrow" sz={12}/>+ Produk</button>
          </div>
          <div style={{...css.card,background:C.greenPale,border:"1.5px solid "+C.green,marginBottom:14}}>
            <div style={{fontSize:12,color:C.textSub}}>Outlet</div>
            <div style={{fontWeight:800,fontSize:15,color:C.greenDark}}>🏪 {outlet&&outlet.nama}</div>
          </div>
          {Object.entries(keranjang).map(([id,qty])=>{
            const p = produk.find(p=>p.id===id);
            if(!p) return null;
            const h = getHarga(id,qty);
            const diskon = h<p.harga;
            return(
              <div key={id} style={{...css.card,display:"flex",gap:10,alignItems:"center",padding:12}}>
                <div style={{width:50,height:50,borderRadius:10,background:C.bgSub,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
                  {p.foto?<img src={p.foto} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={p.nama} onError={e=>{e.target.style.display="none";}}/>:<span style={{fontSize:26}}>{p.emoji||"📦"}</span>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13}}>{p.nama}</div>
                  <div style={{fontSize:11,color:C.textSub}}>
                    <span style={{color:diskon?C.red:C.textSub}}>{fmt(h)}</span>
                    {diskon&&<span style={{textDecoration:"line-through",marginLeft:4,color:C.textMuted}}>{fmt(p.harga)}</span>}
                    <span style={{marginLeft:4}}>/ {p.satuan}</span>
                    {diskon&&<span style={css.pill("a")} > 🏷️ Paket</span>}
                  </div>
                  <div style={{color:C.green,fontWeight:800}}>{fmt(h*qty)}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,background:C.greenPale,borderRadius:8,padding:"4px 8px"}}>
                    <button onClick={()=>kurang(id)} style={{background:C.green,color:C.white,border:"none",borderRadius:5,width:24,height:24,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>-</button>
                    <span style={{fontWeight:800,minWidth:20,textAlign:"center"}}>{qty}</span>
                    <button onClick={()=>add(id)} style={{background:C.green,color:C.white,border:"none",borderRadius:5,width:24,height:24,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                  </div>
                  <button onClick={()=>hapusItem(id)} style={{background:"none",border:"none",cursor:"pointer",color:C.red}}><Ic n="trash" sz={16}/></button>
                </div>
              </div>
            );
          })}
          <div style={{...css.card,background:"linear-gradient(135deg,"+C.greenPale+",#f0fdf4)",border:"1.5px solid "+C.green}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{color:C.textMid}}>Total Item</span><span style={{fontWeight:700}}>{totalItem} item</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontWeight:800,fontSize:15}}>Total Bayar</span>
              <span style={{fontSize:24,fontWeight:900,color:C.green}}>{fmt(totalHarga)}</span>
            </div>
          </div>
          <button onClick={checkout} disabled={saving} style={{...css.btn(),marginTop:12}}>
            <Ic n="send" sz={16}/>{saving?"Memproses...":"Simpan ke Rekapan"}
          </button>
          <div style={{textAlign:"center",fontSize:11,color:C.textSub,marginTop:6}}>Kirim WA ke admin bisa dilakukan dari menu Riwayat</div>
        </div>
      )}
    </div>
  );
}

function Outlet({outlets,setOutlets,showToast}){
  const [form,setForm] = useState({nama:"",alamat:"",kontak:""});
  const [showForm,setShowForm] = useState(false);

  const save = async() => {
    if(!form.nama) return showToast("Nama outlet wajib!","err");
    const o = {id:"O"+uid(),...form,aktif:true};
    if(!APPS_SCRIPT_URL.includes("GANTI")) await apiCall("addOutlet",{outlet:o});
    setOutlets(prev=>[...prev,o]);
    setForm({nama:"",alamat:"",kontak:""}); setShowForm(false);
    showToast("Outlet ditambahkan!");
  };

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={css.sec}>Daftar Outlet ({outlets.length})</div>
        <button onClick={()=>setShowForm(!showForm)} style={css.btnS(showForm?"r":"p")}>
          {showForm?<><Ic n="close" sz={12}/>Batal</>:<><Ic n="plus" sz={12}/>Tambah</>}
        </button>
      </div>
      {showForm&&(
        <div style={{...css.card,border:"1.5px solid "+C.green,marginBottom:16}}>
          <div style={{fontWeight:800,color:C.greenDark,marginBottom:12}}>Outlet Baru</div>
          {[{l:"Nama Outlet *",k:"nama",p:"cth: Toko Maju Jaya"},{l:"Alamat",k:"alamat",p:"Jl. ..."},{l:"No. HP / WA",k:"kontak",p:"08xxxxxxxxxx"}].map(({l,k,p})=>(
            <div key={k} style={{marginBottom:10}}><div style={css.lbl}>{l}</div><input style={css.inp} placeholder={p} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>
          ))}
          <button onClick={save} style={css.btn()}><Ic n="check" sz={15}/>Simpan Outlet</button>
        </div>
      )}
      {outlets.map(o=>(
        <div key={o.id} style={{...css.card,opacity:o.aktif?1:0.65}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                <div style={{background:o.aktif?C.green:C.textMuted,width:8,height:8,borderRadius:"50%"}}/>
                <div style={{fontWeight:800,fontSize:14}}>{o.nama}</div>
              </div>
              <div style={{fontSize:12,color:C.textSub,paddingLeft:16}}>{o.alamat}</div>
              <div style={{fontSize:12,color:C.textSub,paddingLeft:16}}>📞 {o.kontak}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
              <span style={css.pill(o.aktif?"g":"a")}>{o.aktif?"Aktif":"Nonaktif"}</span>
              <button onClick={()=>setOutlets(prev=>prev.map(x=>x.id===o.id?{...x,aktif:!x.aktif}:x))} style={css.btnS("g")}>{o.aktif?"Nonaktifkan":"Aktifkan"}</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Barang({produk,setProduk,showToast}){
  const [editId,setEditId] = useState(null);
  const [showForm,setShowForm] = useState(false);
  const [form,setForm] = useState({nama:"",satuan:"Sak",harga:"",stok:"",emoji:"🌾",foto:"",pakets:[]});
  const fileRef = useRef();
  const emojis = ["🌾","🏔️","🚪","📦","⚡","🏗️","🧱","🔶"];

  const handlePhoto = (e) => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f=>({...f,foto:ev.target.result}));
    reader.readAsDataURL(file);
  };

  const openEdit = (p) => {
    setEditId(p.id); setShowForm(true);
    setForm({nama:p.nama,satuan:p.satuan,harga:String(p.harga),stok:String(p.stok),emoji:p.emoji||"🌾",foto:p.foto||"",pakets:p.pakets||[]});
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const resetForm = () => { setEditId(null); setShowForm(false); setForm({nama:"",satuan:"Sak",harga:"",stok:"",emoji:"🌾",foto:"",pakets:[]}); };

  const tambahPaket = () => {
    const min = window.prompt("Minimum qty (contoh: 100):");
    if(!min) return;
    const harga = window.prompt("Harga khusus per "+form.satuan+" (contoh: 235000):");
    if(!harga) return;
    setForm(f=>({...f,pakets:[...(f.pakets||[]),{minQty:Number(min),harga:Number(harga)}]}));
  };

  const save = async() => {
    if(!form.nama||!form.harga) return showToast("Nama dan harga wajib!","err");
    const data = {...form,harga:Number(form.harga),stok:Number(form.stok),pakets:form.pakets||[]};
    if(editId){
      setProduk(prev=>prev.map(p=>p.id===editId?{...p,...data}:p));
      if(!APPS_SCRIPT_URL.includes("GANTI")) await apiCall("updateProduk",{produk:{id:editId,...data}});
      showToast("Produk diperbarui!");
    } else {
      const p = {id:"P"+uid(),...data};
      if(!APPS_SCRIPT_URL.includes("GANTI")) await apiCall("addProduk",{produk:p});
      setProduk(prev=>[...prev,p]);
      showToast("Produk ditambahkan!");
    }
    resetForm();
  };

  const hapus = async(id) => {
    if(!window.confirm("Hapus produk ini?")) return;
    setProduk(prev=>prev.filter(p=>p.id!==id));
    if(!APPS_SCRIPT_URL.includes("GANTI")) await apiCall("deleteProduk",{id});
    showToast("Produk dihapus!");
  };

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={css.sec}>Daftar Barang ({produk.length})</div>
        {!editId&&<button onClick={()=>{setShowForm(true);setEditId(null);}} style={css.btnS()}><Ic n="plus" sz={12}/>Tambah</button>}
      </div>

      {showForm&&(
        <div style={{...css.card,border:"1.5px solid "+(editId?C.teal:C.green),marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontWeight:800,color:editId?C.teal:C.greenDark,fontSize:14}}>{editId?"✏️ Edit Produk":"➕ Produk Baru"}</div>
            <button onClick={resetForm} style={{background:"none",border:"none",cursor:"pointer",color:C.textSub}}><Ic n="close" sz={18}/></button>
          </div>

          <div style={{marginBottom:12}}>
            <div style={css.lbl}>Foto Produk</div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <div onClick={()=>fileRef.current.click()} style={{width:72,height:72,borderRadius:12,border:"2px dashed "+C.green,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",background:C.bgSub,flexShrink:0}}>
                {form.foto?<img src={form.foto} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="foto" onError={e=>{e.target.style.display="none";}}/>:<Ic n="img" sz={28}/>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto}/>
              <div>
                <div style={{fontSize:12,color:C.textSub,marginBottom:6}}>atau pilih emoji:</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {emojis.map(e=>(
                    <button key={e} onClick={()=>setForm(f=>({...f,emoji:e,foto:""}))} style={{fontSize:18,background:form.emoji===e&&!form.foto?C.greenPale:C.bgSub,border:"1.5px solid "+(form.emoji===e&&!form.foto?C.green:C.border),borderRadius:7,padding:"4px 8px",cursor:"pointer"}}>{e}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {[{l:"Nama Produk *",k:"nama",p:"cth: Kompas 25kg"},{l:"Harga Normal (Rp) *",k:"harga",p:"185000",t:"number"},{l:"Stok",k:"stok",p:"100",t:"number"}].map(({l,k,p,t="text"})=>(
            <div key={k} style={{marginBottom:10}}><div style={css.lbl}>{l}</div><input type={t} style={css.inp} placeholder={p} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>
          ))}

          <div style={css.lbl}>Satuan</div>
          <select style={{...css.sel,marginBottom:12}} value={form.satuan} onChange={e=>setForm({...form,satuan:e.target.value})}>
            {["Sak","Kg","Karton","Pcs"].map(x=><option key={x}>{x}</option>)}
          </select>

          <div style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={css.lbl}>Paket Harga Khusus</div>
              <button onClick={tambahPaket} style={{...css.btnS("g"),fontSize:11,padding:"4px 10px"}}><Ic n="plus" sz={11}/>Paket</button>
            </div>
            {(form.pakets||[]).length===0
              ?<div style={{fontSize:12,color:C.textMuted,fontStyle:"italic",padding:"8px 0"}}>Belum ada. Contoh: beli 100 sak → Rp 235.000/sak</div>
              :(form.pakets||[]).sort((a,b)=>a.minQty-b.minQty).map((pk,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.amberPale,borderRadius:8,padding:"7px 10px",marginBottom:4}}>
                  <span style={{fontSize:12,color:C.amber,fontWeight:700}}>🏷️ Min {pk.minQty} {form.satuan} → {fmt(pk.harga)}/{form.satuan}</span>
                  <button onClick={()=>setForm(f=>({...f,pakets:f.pakets.filter((_,j)=>j!==i)}))} style={{background:"none",border:"none",color:C.red,cursor:"pointer",fontWeight:700,fontSize:16,lineHeight:1}}>×</button>
                </div>
              ))
            }
          </div>

          <button onClick={save} style={css.btn()}><Ic n="check" sz={15}/>{editId?"Simpan Perubahan":"Tambah Produk"}</button>
        </div>
      )}

      {produk.map(p=>(
        <div key={p.id} style={{...css.card,padding:12}}>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:60,height:60,borderRadius:12,background:C.bgSub,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,border:"1px solid "+C.border}}>
              {p.foto?<img src={p.foto} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={p.nama} onError={e=>{e.target.style.display="none";}}/>:<span style={{fontSize:34}}>{p.emoji||"📦"}</span>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:800,fontSize:14,marginBottom:2}}>{p.nama}</div>
              <div style={{fontSize:12,color:C.textSub}}>per {p.satuan}</div>
              <div style={{color:C.green,fontWeight:800,fontSize:14,marginTop:3}}>{fmt(p.harga)}</div>
              {p.pakets&&p.pakets.length>0&&(
                <div style={{fontSize:10,color:C.amber,fontWeight:600,marginTop:2}}>
                  🏷️ {p.pakets.sort((a,b)=>a.minQty-b.minQty).map(pk=>"≥"+pk.minQty+" → "+fmt(pk.harga)).join(" | ")}
                </div>
              )}
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:22,fontWeight:900,color:p.stok<20?C.red:C.greenDark}}>{p.stok}</div>
              <div style={{fontSize:10,color:C.textMuted}}>stok</div>
              {p.stok<20&&<span style={css.pill("r")}><Ic n="warn" sz={9}/>Tipis</span>}
            </div>
          </div>
          <div style={{display:"flex",gap:7,marginTop:10,paddingTop:8,borderTop:"1px solid "+C.bgSub}}>
            <button onClick={()=>openEdit(p)} style={{...css.btnS("g"),flex:1,justifyContent:"center",fontSize:12}}><Ic n="edit" sz={13}/>Edit</button>
            <button onClick={()=>hapus(p.id)} style={{...css.btnS("r"),justifyContent:"center",padding:"7px 14px"}}><Ic n="trash" sz={14}/></button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Laporan({transaksi}){
  const [mode,setMode] = useState("harian");
  const [tgl,setTgl] = useState(todayISO());

  const txHari = transaksi.filter(t=>normTgl(t.tanggal)===tgl);
  const totalHari = txHari.reduce((s,t)=>s+t.total,0);
  const rekapHari = {};
  txHari.forEach(tx=>tx.items.forEach(it=>{
    if(!rekapHari[it.produk]) rekapHari[it.produk]={qty:0,total:0,satuan:it.satuan};
    rekapHari[it.produk].qty+=it.qty; rekapHari[it.produk].total+=it.subtotal;
  }));
  const listHari = Object.entries(rekapHari).map(([nama,d])=>({nama,...d})).sort((a,b)=>b.total-a.total);
  const maxHari = listHari[0]?.total||1;

  const bulanMap = {};
  transaksi.forEach(tx=>{
    const b = normTgl(tx.tanggal).slice(0,7);
    if(b) bulanMap[b]=(bulanMap[b]||0)+tx.total;
  });
  const bulanList = Object.entries(bulanMap).sort((a,b)=>a[0].localeCompare(b[0])).slice(-6);
  const maxBulan = Math.max(...bulanList.map(([,v])=>v),1);

  const produkMap = {};
  transaksi.forEach(tx=>tx.items.forEach(it=>{
    if(!produkMap[it.produk]) produkMap[it.produk]={qty:0,total:0};
    produkMap[it.produk].qty+=it.qty; produkMap[it.produk].total+=it.subtotal;
  }));
  const produkList = Object.entries(produkMap).map(([nama,d])=>({nama,...d})).sort((a,b)=>b.total-a.total).slice(0,6);
  const maxProduk = produkList[0]?.total||1;

  const fmtBulan = (b) => {
    const [y,m] = b.split("-");
    const names = ["","Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    return names[parseInt(m)]+" "+y.slice(2);
  };

  const totalAllTime = transaksi.reduce((s,t)=>s+t.total,0);

  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[{k:"harian",l:"Harian"},{k:"bulanan",l:"Tren & Produk"}].map(({k,l})=>(
          <button key={k} onClick={()=>setMode(k)} style={{...css.btnS(mode===k?"p":"g"),flex:1,justifyContent:"center"}}>{l}</button>
        ))}
      </div>

      {mode==="harian"&&(
        <div>
          <div style={{...css.card,marginBottom:12}}>
            <div style={css.lbl}>Pilih Tanggal</div>
            <input type="date" style={css.inp} value={tgl} onChange={e=>setTgl(e.target.value)}/>
          </div>
          <div style={css.hero}>
            <div style={{fontSize:12,fontWeight:700,opacity:0.8,letterSpacing:1}}>TOTAL PENJUALAN</div>
            <div style={css.bigN}>{fmt(totalHari)}</div>
            <div style={{display:"flex",gap:16,marginTop:10,fontSize:13,opacity:0.85}}>
              <span>{txHari.length} transaksi</span><span>·</span>
              <span>{listHari.reduce((s,r)=>s+r.qty,0)} item</span>
            </div>
          </div>
          {listHari.length===0?(
            <div style={{textAlign:"center",color:C.textSub,padding:"40px 0"}}>
              <div style={{fontSize:40,marginBottom:12}}>📋</div>
              Tidak ada transaksi
            </div>
          ):(
            <>
              <div style={css.sec}>Produk Terjual</div>
              {listHari.map((r,i)=>(
                <div key={r.nama} style={css.card}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{background:i===0?C.green:i===1?C.teal:C.textMuted,borderRadius:8,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:C.white,fontSize:13}}>{i+1}</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:13}}>{r.nama}</div>
                        <div style={{fontSize:11,color:C.textSub}}>{r.qty} {r.satuan}</div>
                      </div>
                    </div>
                    <div style={{color:C.green,fontWeight:900,fontSize:14}}>{fmt(r.total)}</div>
                  </div>
                  <div style={{height:8,background:C.bgSub,borderRadius:4}}>
                    <div style={{height:"100%",width:""+(r.total/maxHari*100)+"%",background:i===0?C.green:i===1?C.teal:"#94a3b8",borderRadius:4}}/>
                  </div>
                </div>
              ))}
              <div style={css.sec}>Detail Transaksi</div>
              {txHari.map(tx=>(
                <div key={tx.id} style={css.card}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    <div><div style={{fontWeight:800}}>{tx.outlet}</div><div style={{fontSize:11,color:C.textSub}}>#{tx.id}</div></div>
                    <div style={{color:C.green,fontWeight:900}}>{fmt(tx.total)}</div>
                  </div>
                  {tx.items.map((it,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textSub,padding:"3px 0",borderTop:"1px solid "+C.bgSub}}>
                      <span>{it.produk} x{it.qty}{it.diskon?" 🏷️":""}</span>
                      <span style={{fontWeight:600}}>{fmt(it.subtotal)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {mode==="bulanan"&&(
        <div>
          <div style={css.hero}>
            <div style={{fontSize:12,fontWeight:700,opacity:0.8}}>TOTAL OMSET ALL TIME</div>
            <div style={css.bigN}>{fmt(totalAllTime)}</div>
            <div style={{fontSize:13,opacity:0.85,marginTop:8}}>{transaksi.length} transaksi total</div>
          </div>

          <div style={css.sec}>Penjualan per Bulan</div>
          <div style={css.card}>
            {bulanList.length===0?(
              <div style={{textAlign:"center",color:C.textSub,padding:20}}>Belum ada data</div>
            ):(
              bulanList.map(([b,v])=>(
                <div key={b} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:13,fontWeight:700,color:C.textMid}}>{fmtBulan(b)}</span>
                    <span style={{fontSize:13,fontWeight:800,color:C.green}}>{fmt(v)}</span>
                  </div>
                  <div style={{height:12,background:C.bgSub,borderRadius:6}}>
                    <div style={{height:"100%",width:""+(v/maxBulan*100)+"%",background:"linear-gradient(90deg,"+C.greenDark+","+C.green+")",borderRadius:6}}/>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={css.sec}>Top Produk All Time</div>
          <div style={css.card}>
            {produkList.length===0?(
              <div style={{textAlign:"center",color:C.textSub,padding:20}}>Belum ada data</div>
            ):(
              produkList.map((r,i)=>{
                const colors = [C.green,C.teal,C.amber,"#7c3aed","#db2777","#ea580c"];
                return(
                  <div key={r.nama} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:7}}>
                        <div style={{background:colors[i]||C.textMuted,borderRadius:6,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:C.white,fontSize:11}}>{i+1}</div>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:C.textMid}}>{r.nama}</div>
                          <div style={{fontSize:10,color:C.textMuted}}>{r.qty} item terjual</div>
                        </div>
                      </div>
                      <span style={{fontSize:12,fontWeight:800,color:colors[i]||C.green}}>{fmt(r.total)}</span>
                    </div>
                    <div style={{height:10,background:C.bgSub,borderRadius:6}}>
                      <div style={{height:"100%",width:""+(r.total/maxProduk*100)+"%",background:colors[i]||C.green,borderRadius:6}}/>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
