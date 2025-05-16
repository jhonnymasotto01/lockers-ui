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

// Se manca il box, mostriamo subito l’errore
if (!box) {
  show("danger","Parametro ?box mancante");
} else {
  init();
}

bReg .onclick = onRegister;
bOpen.onclick = onOpen;

/* ───────────────────────────────────────────────── init ───────────────────────────────────────────────── */
async function init(){
  let stateResp;
  try {
    const res = await fetch(`${API}/state?box=${box}`);
    const data = await res.json();
    if (!res.ok) {
      // Errore custom dal Worker o 4xx/5xx
      return show("danger", data.msg || `Errore server (${res.status})`);
    }
    stateResp = data;
  } catch (e) {
    return show("danger","API non raggiungibile");
  }

  // Se non è prenotato, fermiamoci qui
  if (!stateResp.booked) {
    return show("warning","Box libero, nessuna prenotazione.");
  }

  // Altrimenti verifico subito se il device è già registrato (dry-run)
  const me = navigator.userAgent;
  try {
    const res = await fetch(
      `${API}/open?box=${box}&device=${encodeURIComponent(me)}&dry=1`
    );
    if (res.ok) {
      // già registrato
      show("success","Dispositivo riconosciuto");
      bOpen.hidden = false;
    } else if (res.status === 403) {
      // non registrato → mostro il campo PIN
      grp.hidden = false;
      show("info","Inserisci il PIN della prenotazione");
    } else {
      // ogni altro errore
      const err = await res.json().catch(()=>({msg:`Errore server (${res.status})`}));
      show("danger", err.msg);
    }
  } catch (e) {
    show("danger","API non raggiungibile");
  }
}

/* ─────────────────────────────────────────────── register ───────────────────────────────────────────── */
async function onRegister(){
  const pincode = elPin.value.trim();
  if (!pincode) {
    return alert("Inserisci il PIN");
  }

  const payload = {
    box: +box,
    pincode,
    device: navigator.userAgent
  };

  try {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      return show("danger", data.msg || `Errore server (${res.status})`);
    }
    // OK!
    show("success", data.msg);
    grp.hidden = true;
    bOpen.hidden = false;
  } catch (e) {
    show("danger","API non raggiungibile");
  }
}

/* ─────────────────────────────────────────────── open ──────────────────────────────────────────────── */
async function onOpen(){
  const me = navigator.userAgent;
  try {
    const res = await fetch(
      `${API}/open?box=${box}&device=${encodeURIComponent(me)}`
    );
    const data = await res.json();
    if (!res.ok) {
      return show("danger", data.msg || `Errore server (${res.status})`);
    }
    // porta aperta!
    show("success", data.msg);
  } catch (e) {
    show("danger","API non raggiungibile");
  }
}

/* ───────────────────────────────────────────────── helpers ───────────────────────────────────────────────── */
function show(type, txt){
  elMsg.className   = `alert alert-${type}`;
  elMsg.textContent = txt;
  elMsg.hidden      = false;
}
function id(x){ return document.getElementById(x); }
