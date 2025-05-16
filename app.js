// URL del tuo Worker
const API = "https://lockers-api.cqc2qfkwcw.workers.dev";

const url  = new URL(location.href);
const box  = url.searchParams.get("box");
id("titBox").textContent = box || "?";

const elMsg = id("msg"),
      elPin = id("pin"),
      grp   = id("pinGrp"),
      bReg  = id("btnReg"),
      bOpen = id("btnOpen");

if (!box){
  show("danger","Parametro ?box mancante");
}else{
  init();
}

bReg.onclick  = onRegister;
bOpen.onclick = onOpen;

/* ───────────────── init ─────────────────────────────── */
async function init(){
  /* stato box -------------------------------------------------------- */
  let r;
  try{ r = await (await fetch(`${API}/state?box=${box}`)).json(); }
  catch{ r = { ok:false, msg:"API non raggiungibile" }; }

  if(!r.ok)      return show("danger",r.msg);
  if(!r.booked)  return show("warning","Box libero, nessuna prenotazione.");

  /* device registrato?  --------------------------------------------- */
  const me   = navigator.userAgent;
  const res  = await fetch(`${API}/open?box=${box}&device=${encodeURIComponent(me)}&dry=1`);

  if (res.status === 200){
    // device già registrato
    show("success","Dispositivo riconosciuto");
    bOpen.hidden = false;
  }
  else if (res.status === 403){
    // non registrato
    show("info","Inserisci il PIN della prenotazione");
    grp.hidden = false;
  }
  else{
    // qualsiasi altro problema lato Worker
    show("danger","Errore server ("+res.status+")");
  }
}

/* ───────────────── register ─────────────────────────── */
async function onRegister(){
  const pincode = elPin.value.trim();
  if(!pincode) return alert("Inserisci il PIN");

  const body = { box:+box, pincode, device:navigator.userAgent };
  const res  = await fetch(`${API}/register`,post(body));

  if(res.status !== 200){
    const err = await res.json().catch(()=>({msg:"Errore server"}));
    return show("danger",err.msg);
  }

  const ok   = await res.json();
  show("success",ok.msg);
  grp.hidden  = true;
  bOpen.hidden = false;
}

/* ───────────────── open ─────────────────────────────── */
async function onOpen(){
  const me  = navigator.userAgent;
  const res = await fetch(`${API}/open?box=${box}&device=${encodeURIComponent(me)}`);
  if(res.status !== 200){
    const err = await res.json().catch(()=>({msg:"Errore server"}));
    return show("danger",err.msg);
  }
  const ok  = await res.json();
  show("success",ok.msg);
}

/* ───────────── helpers ───────────── */
const post = b=>({
  method :"POST",
  headers:{ "Content-Type":"application/json" },
  body   : JSON.stringify(b)
});
function show(type,txt){
  elMsg.className = `alert alert-${type}`;
  elMsg.textContent = txt;
  elMsg.hidden = false;
}
function id(x){ return document.getElementById(x); }
