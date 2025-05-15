// URL del tuo Worker – sostituisci se diverso
const API = "https://lockers-api.cqc2qfkwcw.workers.dev";

const url  = new URL(location.href);
const box  = url.searchParams.get("box");
id("titBox").textContent = box || "?";

const elMsg = id("msg"),
      elPin = id("pin"),
      grp   = id("pinGrp"),
      bReg  = id("btnReg"),
      bOpen = id("btnOpen");

if (!box) {
  show("danger","Parametro ?box mancante");
} else {
  init();
}

bReg.onclick  = onRegister;
bOpen.onclick = onOpen;

/* ---------- init ----------------------------------------------------- */
async function init(){
  const r = await fetch(`${API}/state?box=${box}`)
             .then(r=>r.json())
             .catch(()=>({ok:false,msg:"API non raggiungibile"}));

  if(!r.ok){       show("danger",r.msg); return; }
  if(!r.booked){   show("warning","Box libero, nessuna prenotazione."); return; }

  /* c’è una prenotazione → verifichiamo se il device è già registrato */
  const me  = navigator.userAgent;
  const chk = await fetch(`${API}/open?box=${box}&device=${encodeURIComponent(me)}&dry=1`);

  if(chk.status === 403){        // NON registrato
    grp.hidden = false;
    show("info","Inserisci il PIN della prenotazione");
  }else{                         // Già registrato
    show("success","Dispositivo riconosciuto");
    bOpen.hidden = false;
  }
}

/* ---------- registra dispositivo ------------------------------------ */
async function onRegister(){
  const pincode = elPin.value.trim();
  if(!pincode){ alert("Inserisci il PIN"); return; }

  const body = { box:+box, pincode, device:navigator.userAgent };
  const r    = await fetch(`${API}/register`,post(body)).then(r=>r.json());

  if(!r.ok){ show("danger",r.msg); return; }

  show("success",r.msg);
  grp.hidden = true;
  bOpen.hidden = false;
}

/* ---------- apri ----------------------------------------------------- */
async function onOpen(){
  const me = navigator.userAgent;
  const r  = await fetch(`${API}/open?box=${box}&device=${encodeURIComponent(me)}`)
              .then(r=>r.json());

  if(!r.ok){ show("danger",r.msg); return; }
  show("success",r.msg);
}

/* ---------- helpers -------------------------------------------------- */
const post = b=>({ method:"POST",
                   headers:{'Content-Type':'application/json'},
                   body:JSON.stringify(b) });

function show(type,txt){
  elMsg.className = `alert alert-${type}`;
  elMsg.textContent = txt;
  elMsg.hidden = false;
}
function id(x){ return document.getElementById(x); }
