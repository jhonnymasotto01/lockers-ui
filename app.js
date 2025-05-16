// app.js

// ─── destrutturiamo le funzioni UI importate da ui.js ────────────────
const {
  show,
  updateStatusDot,
  showLoader,
  hideLoader,
  showNotBooked,
  showInteraction,
  showRegisteredUI,
  resetAlerts
} = window.ui;

// ─── URL del Worker e helper per id() ───────────────────────────────
const API = "https://lockers-api.cqc2qfkwcw.workers.dev";
function id(x){ return document.getElementById(x); }

// ─── riferimenti DOM e box param ────────────────────────────────────
const url   = new URL(location.href);
const box   = url.searchParams.get("box");
id("titBox").textContent = box || "?";

const elMsg = id("msg"),
      elPin = id("pin"),
      grp   = id("pinGrp"),
      bReg  = id("btnReg"),
      bOpen = id("btnOpen");

// ─── event handler ─────────────────────────────────────────────────
bReg .onclick = onRegister;
bOpen.onclick = onOpen;

// ─── se manca ?box mostriamo errore, altrimenti iniziamo ────────────
if (!box) {
  show("danger", "Parametro ?box mancante");
} else {
  init();
}

// ─────────────────────────────────────────── init ────────────────────
async function init(){
  resetAlerts();
  showLoader();

  // 1) /state
  let stateResp;
  try {
    const res       = await fetch(`${API}/state?box=${box}`);
    stateResp       = await res.json();
    if (!res.ok) throw new Error(stateResp.msg || `Errore ${res.status}`);
  } catch (e) {
    hideLoader();
    return show("danger", e.message === "Failed to fetch" ? "apiUnreachable" : e.message);
  }

  // aggiorno bollino + testo
  updateStatusDot(stateResp.booked);

  // 2) se non è prenotato → messaggio centrale
  if (!stateResp.booked) {
    hideLoader();
    return showNotBooked();
  }

  // 3) dry-run per vedere se il device è già registrato
  let dry;
  try {
    const resp = await fetch(
      `${API}/open?box=${box}&device=${encodeURIComponent(navigator.userAgent)}&dry=1`
    );
    dry = await resp.json();
  } catch (_) {
    hideLoader();
    return show("danger", "apiUnreachable");
  }
  hideLoader();

  if (dry.ok) {
    show("success", "deviceRecognized");
    return showRegisteredUI();
  } else {
    show("info", "enterPin");
    return showInteraction();
  }
}

// ─────────────────────────────────────── register ────────────────────
async function onRegister(){
  const pin = elPin.value.trim();
  if (!pin) return alert("Inserisci il PIN");

  let reg;
  try {
    const resp = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({
        box:+box,
        pincode:pin,
        device:navigator.userAgent
      })
    });
    reg = await resp.json();
  } catch (_) {
    return show("danger","apiUnreachable");
  }

  if (!reg.ok) {
    return show("danger", reg.msg || "Errore durante la registrazione");
  }
  show("success", reg.msg);
  showRegisteredUI();
}

// ───────────────────────────────────────── open ───────────────────────
async function onOpen(){
  let op;
  try {
    const resp = await fetch(
      `${API}/open?box=${box}&device=${encodeURIComponent(navigator.userAgent)}`
    );
    op = await resp.json();
  } catch (_) {
    return show("danger","apiUnreachable");
  }

  if (!op.ok) {
    return show("danger", op.msg || "Errore durante l’apertura");
  }
  show("success", op.msg);
}
