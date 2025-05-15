// URL del Worker – modifica con il tuo sub-domain *.workers.dev
const API = "https://lockers-api.cqc2qfkwcw.workers.dev/";

const url = new URL(location.href);
const box = url.searchParams.get("box");

const elMsg     = id("msg");
const elPinGrp  = id("pinGrp");
const elPin     = id("pin");
const btnReg    = id("btnReg");
const btnOpen   = id("btnOpen");

if(!box) showMsg("danger","Parametro ?box mancante");
else     init();

btnReg.onclick  = register;
btnOpen.onclick = openBox;

// ─────────────────────────────────────────────────────────────────────────────
async function init(){
  try{
    const r = await fetch(`${API}/status?box=${box}`).then(r=>r.json());
    if(!r.ok){ showMsg("danger",r.msg); return; }

    if(!r.booked){
      showMsg("warning","Box libero, nessuna prenotazione.");
      return;
    }

    if(r.registered){
      showMsg("success","Dispositivo riconosciuto.");
      btnOpen.hidden = false;
    }else{
      showMsg("info","Inserisci il PIN della prenotazione.");
      elPinGrp.hidden = false;
    }
  }catch(e){
    showMsg("danger","API non raggiungibile");
    console.error(e);
  }
}

async function register(){
  const pin = elPin.value.trim();
  if(!pin){ alert("Inserisci PIN"); return; }

  const body = {box, pin, device: navigator.userAgent };
  const r = await fetch(`${API}/register`,req(body)).then(r=>r.json());
  if(!r.ok){ showMsg("danger",r.msg); return; }

  showMsg("success",r.msg);
  elPinGrp.hidden = true;
  btnOpen.hidden  = false;
}

async function openBox(){
  const body = {box, device:navigator.userAgent};
  const r = await fetch(`${API}/open`,req(body)).then(r=>r.json());
  if(!r.ok){ showMsg("danger",r.msg); return; }

  showMsg("success",r.msg);
}

// ─────────────────────────────────────────────────────────────────────────────
function req(body){
  return { method:"POST",
           headers:{ "Content-Type":"application/json" },
           body:JSON.stringify(body) };
}

function showMsg(type,txt){
  elMsg.className = `alert alert-${type}`;   // usa Bootstrap?
  elMsg.textContent = txt;
  elMsg.hidden = false;
}

function id(x){return document.getElementById(x);}
