// app.js

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
    const tx    = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const get   = store.get('deviceId');
    get.onsuccess = () => {
      let id = get.result;
      if (!id) {
        // Genera UUIDv4
        id = ([1e7]+-1e3+-4e3+-8e3+-1e11)
          .replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c/4)
              .toString(16)
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
  // IMPORT UI FUNCTIONS (from ui.js)
  const {
    show,
    updateStatusDot,
    showNotBooked,
    showInteraction,
    showRegisteredUI,
    resetAlerts
  } = window.ui;

  const API = "https://lockers-api.cqc2qfkwcw.workers.dev";
  const id  = x => document.getElementById(x);

  // header loader toggles
  function showHeaderLoader() {
    id("loader").hidden     = false;
    id("statusDot").hidden  = true;
    id("statusText").hidden = true;
  }
  function hideHeaderLoader() {
    id("loader").hidden     = true;
    id("statusDot").hidden  = false;
    id("statusText").hidden = false;
  }

  // DOM refs
  const url = new URL(location.href);
  const box = url.searchParams.get("box");
  id("titBox").textContent = box || "?";

  const elPin = id("pin");
  const bReg  = id("btnReg");
  const bOpen = id("btnOpen"); // via modal

  bReg.onclick = onRegister;

  if (!box) {
    show("danger", "Parametro ?box mancante");
    return;
  }

  const deviceId = await getDeviceId();
  init();

  async function init() {
    resetAlerts();
    // mostra body
    id("content").hidden = false;

    showHeaderLoader();
    show("info", "loading");

    let stateResp;
    try {
      const res = await fetch(`${API}/state?box=${box}`);
      stateResp = await res.json();
      if (!res.ok) throw new Error(stateResp.msg || `Errore ${res.status}`);
    } catch (e) {
      hideHeaderLoader();
      return show("danger", e.message === "Failed to fetch" ? "apiUnreachable" : e.message);
    }

    hideHeaderLoader();
    updateStatusDot(stateResp.booked);
    window.currentBooked = stateResp.booked;

    if (!stateResp.booked) {
      return showNotBooked();
    }

    // dry-run
    resetAlerts();
    show("info", "loading");

    let dry;
    try {
      const resp = await fetch(
        `${API}/open?box=${box}&device=${encodeURIComponent(deviceId)}&dry=1`
      );
      dry = await resp.json();
    } catch (_) {
      return show("danger", "apiUnreachable");
    }

    if (dry.ok) {
      show("success", "deviceRecognized");
      showRegisteredUI();
    } else {
      show("danger", "pinError");
      showInteraction();
    }
  }

  async function onRegister() {
    resetAlerts();
    show("info", "loading");

    const pin = elPin.value.trim();
    if (!pin) {
      return show("danger", "pinError");
    }

    let reg;
    try {
      const r = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ box:+box, pincode:pin, device:deviceId })
      });
      reg = await r.json();
    } catch (_) {
      return show("danger", "apiUnreachable");
    }

    if (!reg.ok) {
      return show("danger", reg.msg === translations.it.pinError ? "pinError" : reg.msg);
    }
    show("success", "deviceRegistered");
    showRegisteredUI();
  }

  async function onOpen() {
    resetAlerts();
    show("info", "loading");

    let op;
    try {
      const r = await fetch(
        `${API}/open?box=${box}&device=${encodeURIComponent(deviceId)}`
      );
      op = await r.json();
    } catch (_) {
      return show("danger", "apiUnreachable");
    }

    if (!op.ok) {
      return show("danger", op.msg);
    }
    show("success", "openSuccess");
  }

  window.ui.confirmOpen = onOpen;
})();
