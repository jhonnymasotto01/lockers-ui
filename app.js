const {
  show, updateStatusDot,
  showLoader, hideLoader,
  showNotBooked, showInteraction, showRegisteredUI,
  resetAlerts
} = window.ui;

// URL del tuo Worker
const API = "https://lockers-api.cqc2qfkwcw.workers.dev";

// helper per id()
function id(x){ return document.getElementById(x); }

// ... (il resto di app.js rimane identico fino a init)


// ------------------------------ NON TOCCARE ----------------------------

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

/* ───────────────────────────────────────── init ───────────────────────────────────────── */
async function init(){
  // 1) /state
  let stateResp;
  try {
    const res  = await fetch(`${API}/state?box=${box}`);
    stateResp = await res.json();
    if (!res.ok) throw new Error(stateResp.msg || `Errore ${res.status}`);
  } catch (e) {
    return show("danger", e.message === "Failed to fetch" ? "API non raggiungibile" : e.message);
  }

  // 2) Se non è prenotato
  if (!stateResp.booked) {
    return show("warning","Box libero, nessuna prenotazione.");
  }

  // 3) Dry-run per vedere se il device è già registrato
  let dry;
  try {
    const resp = await fetch(
      `${API}/open?box=${box}&device=${encodeURIComponent(navigator.userAgent)}&dry=1`
    );
    dry = await resp.json();
  } catch (_) {
    return show("danger","API non raggiungibile");
  }

  if (dry.ok) {
    // già registrato
    show("success","Dispositivo riconosciuto");
    bOpen.hidden = false;
  } else {
    // non registrato → mostro il PIN
    grp.hidden = false;
    show("info", dry.msg || "Inserisci il PIN della prenotazione");
  }
}

/* ──────────────────────────────────────── register ──────────────────────────────────────── */
async function onRegister(){
  const pin = elPin.value.trim();
  if (!pin) return alert("Inserisci il PIN");

  let reg;
  try {
    const resp = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        box: +box,
        pincode: pin,
        device: navigator.userAgent
      })
    });
    reg = await resp.json();
  } catch (_) {
    return show("danger","API non raggiungibile");
  }

  if (!reg.ok) {
    // PIN errato o altro
    return show("danger", reg.msg || "Errore durante la registrazione");
  }

  // OK!
  show("success", reg.msg);
  grp.hidden  = true;
  bOpen.hidden = false;
}

/* ────────────────────────────────────────── open ───────────────────────────────────────── */
async function onOpen(){
  let op;
  try {
    const resp = await fetch(
      `${API}/open?box=${box}&device=${encodeURIComponent(navigator.userAgent)}`
    );
    op = await resp.json();
  } catch (_) {
    return show("danger","API non raggiungibile");
  }

  if (!op.ok) {
    return show("danger", op.msg || "Errore durante l’apertura");
  }

  show("success", op.msg);
}

/* ───────────────────────────────────────── helpers ───────────────────────────────────────── */
function show(type, txt){
  elMsg.className   = `alert alert-${type}`;
  elMsg.textContent = txt;
  elMsg.hidden      = false;
}
function id(x){ return document.getElementById(x); }
