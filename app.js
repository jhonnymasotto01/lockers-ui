// --- IndexedDB helper per deviceId ---
const DB_NAME = 'locker-app';
const STORE_NAME = 'meta';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess    = () => resolve(req.result);
    req.onerror      = () => reject(req.error);
  });
}

async function getDeviceId() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const get = store.get('deviceId');
    get.onsuccess = () => {
      let id = get.result;
      if (!id) {
        id = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
        store.put(id, 'deviceId');
      }
      resolve(id);
    };
    get.onerror = () => reject(get.error);
  });
}
// --- fine IndexedDB helper ---

;(async function(){
  // ───────────────────────────────────────────────────────────────
  // IMPORT UI FUNCTIONS (from ui.js)
  // ───────────────────────────────────────────────────────────────
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

  // ───────────────────────────────────────────────────────────────
  // CONFIG & HELPERS
  // ───────────────────────────────────────────────────────────────
  const API = "https://lockers-api.cqc2qfkwcw.workers.dev";
  function id(x){ return document.getElementById(x); }

  // ───────────────────────────────────────────────────────────────
  // DOM REFS & PARAMS
  // ───────────────────────────────────────────────────────────────
  const url   = new URL(location.href);
  const box   = url.searchParams.get("box");
  id("titBox").textContent = box || "?";

  const elMsg = id("msg"),
        elPin = id("pin"),
        grp   = id("pinGrp"),       // riferimento gruppo PIN (non più usato direttamente ma mantenuto)
        bReg  = id("btnReg"),
        bOpen = id("btnOpen");      // riferimento bottone Apri (handler gestito via modal)

  // bind register only; open è gestito dalla modale in ui.js
  bReg.onclick = onRegister;

  // START: verifica parametro box
  if (!box) {
    show("danger", "Parametro ?box mancante");
    return;
  }

  // genera o recupera deviceId e avvia INIT
  const deviceId = await getDeviceId();
  init();

  // ───────────────────────────────────────────────────────────────
  // 1) INIT: STATE → REGISTERED? → INTERACTION UI
  // ───────────────────────────────────────────────────────────────
  async function init(){
    resetAlerts();
    showLoader();

    let stateResp;
    try {
      const res = await fetch(`${API}/state?box=${box}`);
      stateResp = await res.json();
      if (!res.ok) throw new Error(stateResp.msg || `Errore ${res.status}`);
    } catch (e) {
      hideLoader();
      return show("danger", e.message === "Failed to fetch" ? "apiUnreachable" : e.message);
    }

    updateStatusDot(stateResp.booked);
    window.currentBooked = stateResp.booked;

    if (!stateResp.booked) {
      hideLoader();
      return showNotBooked();
    }

    // dry-run per verificare registrazione dispositivo
    let dry;
    try {
      const resp = await fetch(
        `${API}/open?box=${box}&device=${encodeURIComponent(deviceId)}&dry=1`
      );
      dry = await resp.json();
    } catch (_) {
      hideLoader();
      return show("danger", "apiUnreachable");
    }
    hideLoader();

    if (dry.ok) {
      show("success", "deviceRecognized");
      showRegisteredUI();
    } else {
      show("info", "enterPin");
      showInteraction();
    }
  }

  // ───────────────────────────────────────────────────────────────
  // 2) REGISTER
  // ───────────────────────────────────────────────────────────────
  async function onRegister(){
    resetAlerts();
    showLoader();

    const pin = elPin.value.trim();
    if (!pin) {
      hideLoader();
      return alert("Inserisci il PIN");
    }

    let reg;
    try {
      const response = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ box: +box, pincode: pin, device: deviceId })
      });
      reg = await response.json();
    } catch (_) {
      hideLoader();
      return show("danger", "apiUnreachable");
    }
    hideLoader();

    if (!reg.ok) {
      return show("danger", reg.msg || "Errore durante la registrazione");
    }
    show("success", "deviceRegistered");
    showRegisteredUI();
  }

  // ───────────────────────────────────────────────────────────────
  // 3) OPEN
  // ───────────────────────────────────────────────────────────────
  async function onOpen(){
    resetAlerts();
    showLoader();

    let op;
    try {
      const response = await fetch(
        `${API}/open?box=${box}&device=${encodeURIComponent(deviceId)}`
      );
      op = await response.json();
    } catch (_) {
      hideLoader();
      return show("danger", "apiUnreachable");
    }
    hideLoader();

    if (!op.ok) {
      return show("danger", op.msg || "Errore durante l’apertura");
    }
    show("success", "openSuccess");
  }

  // esponi onOpen per il bottone Apri della modale
  window.ui.confirmOpen = onOpen;
})();
