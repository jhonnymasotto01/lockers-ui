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
        // UUIDv4 semplice
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
        bReg  = id("btnReg"),
        bOpen = id("btnOpen");

  // ───────────────────────────────────────────────────────────────
  // BIND EVENTS
  // ───────────────────────────────────────────────────────────────
  bReg .onclick = onRegister;
  bOpen.onclick = onOpen;

  // ───────────────────────────────────────────────────────────────
  // START: genera o recupera deviceId
  // ───────────────────────────────────────────────────────────────
  if (!box) {
    show("danger", "Parametro ?box mancante");
    return;
  }
  const deviceId = await getDeviceId();
  init();

  // ───────────────────────────────────────────────────────────────
  // 1) INIT: STATE → REGISTERED? → INTERACTION UI
  // ───────────────────────────────────────────────────────────────
  async function init(){
    resetAlerts();
    showLoader();

    // a) /state
    let stateResp;
    try {
      const res = await fetch(`${API}/state?box=${box}`);
      stateResp = await res.json();
      if (!res.ok) throw new Error(stateResp.msg || `Errore ${res.status}`);
    } catch (e) {
      hideLoader();
      return show("danger", e.message === "Failed to fetch" ? "apiUnreachable" : e.message);
    }

    // b) update header dot/text
    updateStatusDot(stateResp.booked);
    window.currentBooked = stateResp.booked;

    // c) not booked?
    if (!stateResp.booked) {
      hideLoader();
      return showNotBooked();
    }

    // d) dry-run register?
    let dry;
    try {
      const resp = await fetch(
        `${API}/open?box=${box}&device=${encodeURIComponent(deviceId)}&dry=1`
      );
      dry = await resp.json();
    } catch (_) {
      hideLoader();
      return show("danger","apiUnreachable");
    }
    hideLoader();

    if (dry.ok) {
      show("success","deviceRecognized");
      showRegisteredUI();
    } else {
      show("info","enterPin");
      showInteraction();
    }
  }

  // ───────────────────────────────────────────────────────────────
  // 2) REGISTER
  // ───────────────────────────────────────────────────────────────
  async function onRegister(){
    resetAlerts();
    show("info", "loading");

    const pin = elPin.value.trim();
    if (!pin) return alert("Inserisci il PIN");

    let reg;
    try {
      reg = await (await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          box:+box,
          pincode:pin,
          device:deviceId
        })
      })).json();
    } catch (_) {
      return show("danger","apiUnreachable");
    }

    if (!reg.ok) {
      return show("danger", reg.msg || "Errore durante la registrazione");
    }
    show("success", reg.msg);
    showRegisteredUI();
  }

  // ───────────────────────────────────────────────────────────────
  // 3) OPEN
  // ───────────────────────────────────────────────────────────────
  async function onOpen(){
    resetAlerts();
    show("info", "loading");
    let op;
    try {
      op = await (await fetch(
        `${API}/open?box=${box}&device=${encodeURIComponent(deviceId)}`
      )).json();
    } catch (_) {
      return show("danger","apiUnreachable");
    }

    if (!op.ok) {
      return show("danger", op.msg || "Errore durante l’apertura");
    }
    show("success", op.msg);
  }

})();  // ← end IIFE
