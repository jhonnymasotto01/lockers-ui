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

if (!box){ show("danger","Parametro ?box mancante"); }
else      { init(); }

bReg.onclick  = onRegister;
bOpen.onclick = onOpen;

/* ───────────────── init ─────────────────────────────── */
async function init(){
  const r = await fetch(`${API}/state?box=${box}`)
                     .then(r=>r.json())
                     .catch(()=>({ok:false,msg:"API non raggiungibile"}));

  if(!r.ok)        return show("danger",r.msg);
  if(!r.booked)    return show("warning","Box libero, nessuna prenotazione.");

  /* test di registrazione */
  const me   = navigator.userAgent;
  const chk  = await fetch(`${API}/open?box=${box}&device=${encodeURIComponent(me)}&dry=1`)
                      .then(r=>r.json())
                      .catch(()=>({ok:false}));

  if(chk.ok){
    show("success","Dispositivo riconosciuto");
    bOpen.hidden = false;
  }else{
    show("info","Inserisci il PIN della prenotazione");
    grp.hidden = false;
  }
}

/* ───────────────── register ─────────────────────────── */
async function onRegister(){
  const pincode = elPin.value.trim();
  if(!pincode) return alert("Inserisci il PIN");

  const body = { box:+box, pincode, device:navigator.userAgent };
  const r    = await fetch(`${API}/register`,post(body)).then(r=>r.json());

  if(!r.ok)  return show("danger",r.msg);
  show("success",r.msg);
  grp.hidden = true; bOpen.hidden = false;
}

/* ───────────────── open ─────────────────────────────── */
async function onOpen(){
  const me = navigator.userAgent;
  const r  = await fetch(`${API}/open?box=${box}&device=${encodeURIComponent(me)}`)
            .then(r=>r.json());
  if(!r.ok) return show("danger",r.msg);
  show("success",r.msg);
}

/* ───────────── helpers ───────────── */
const post = b=>({method:"POST",
                  headers:{'Content-Type':'application/json'},
                  body:JSON.stringify(b)});
function show(type,txt){
  elMsg.className=`alert alert-${type}`;
  elMsg.textContent=txt;
  elMsg.hidden=false;
}
function id(x){return document.getElementById(x);}
