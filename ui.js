// ui.js

// ─── helper per selezionare elementi ────────────────────────────────
function id(x) { return document.getElementById(x); }

// ─── inietto subito il numero armadietto in header ─────────────────
id("titBox").textContent = new URL(location.href).searchParams.get("box") || "?";

// ─── traduzioni ─────────────────────────────────────────────────────
const translations = {
  it: {
    appTitle:         "Locker App",
    boxLabel:         "Armadietto",
    statusBooked:     "Prenotato",
    statusNotBooked:  "Non prenotato",
    notBooked:        "Prenota ora il tuo armadietto, segui le linee guida riportate sul totem per l'acquisto e la prenotazione",
    pinPlaceholder:   "Inserisci PIN",
    registerBtn:      "Registra ora",
    openBtn:          "Apri ora",
    infoText:         "La registrazione avviene sul dispositivo attualmente connesso e quindi solo con tale dispositivo si potrà aprire.",
    apiUnreachable:   "API non raggiungibile",
    deviceRecognized: "Dispositivo riconosciuto",
    enterPin:         "Inserisci il PIN della prenotazione",
    // modale conferma apertura
    openConfirmTitle: "Conferma apertura",
    openConfirmBody:  "Sei sicuro di voler aprire l’armadietto adesso?",
    confirmBtn:       "Apri",
    cancelBtn:        "Annulla"
  },
  en: {
    appTitle:         "Locker App",
    boxLabel:         "Locker",
    statusBooked:     "Booked",
    statusNotBooked:  "Not booked",
    notBooked:        "Reserve now your locker – follow the guidelines on the kiosk for purchase and booking",
    pinPlaceholder:   "Enter PIN",
    registerBtn:      "Register now",
    openBtn:          "Open now",
    infoText:         "Registration occurs on the currently connected device, so only that device can open it.",
    apiUnreachable:   "API unreachable",
    deviceRecognized: "Device recognized",
    enterPin:         "Enter the booking PIN",
    // modal confirmation
    openConfirmTitle: "Confirm open",
    openConfirmBody:  "Are you sure you want to open the locker now?",
    confirmBtn:       "Open",
    cancelBtn:        "Cancel"
  }
};

// ─── lingua di default ────────────────────────────────────────────────
let lang = localStorage.getItem("lang") || "it";

// ─── funzione di cambio lingua ───────────────────────────────────────
function setLang(l) {
  lang = l;
  localStorage.setItem("lang", l);

  // evidenzio i pulsanti
  id("lang-it").classList.toggle("selected", l === "it");
  id("lang-en").classList.toggle("selected", l === "en");

  // traduci tutti gli elementi con data-i18n
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = translations[l][key] || el.textContent;
  });

  // traduci tutti i placeholder
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.placeholder = translations[l][key] || "";
  });

  // traduci il contenuto della modale
  id("confirmOpenLabel").textContent = translations[l].openConfirmTitle;
  id("confirmOpenModal").querySelector(".modal-body").textContent = translations[l].openConfirmBody;
  id("confirmOpenBtn").textContent = translations[l].confirmBtn;
  id("confirmOpenModal").querySelector(".btn-secondary").textContent = translations[l].cancelBtn;

  // se #msg ha un data-i18n, ritraslo
  const msgEl = id("msg");
  const msgKey = msgEl.getAttribute("data-i18n");
  if (msgKey) {
    msgEl.textContent = translations[l][msgKey] || msgEl.textContent;
  }

  // aggiorna anche "Prenotato/Non prenotato"
  if (typeof window.currentBooked !== "undefined") {
    window.ui.updateStatusDot(window.currentBooked);
  }
}

// bind dei pulsanti lingua e init
id("lang-it").addEventListener("click", () => setLang("it"));
id("lang-en").addEventListener("click", () => setLang("en"));
setLang(lang);

// ─── funzioni di UI esposte ad app.js ─────────────────────────────────
function showLoader() {
  id("loader").hidden      = false;
  id("statusDot").hidden   = true;
  id("statusText").hidden  = true;
}
function hideLoader() {
  id("loader").hidden      = true;
  id("statusDot").hidden   = false;
  id("statusText").hidden  = false;
}
function show(type, keyOrMsg) {
  const el = id("msg");
  if (translations[lang][keyOrMsg] !== undefined) {
    el.setAttribute("data-i18n", keyOrMsg);
    el.textContent = translations[lang][keyOrMsg];
  } else {
    el.removeAttribute("data-i18n");
    el.textContent = keyOrMsg;
  }
  el.className = `alert alert-${type} rounded-pill`;
  el.hidden    = false;
}
function updateStatusDot(booked) {
  const dot = id("statusDot");
  dot.style.background = booked ? "#28a745" : "#ffc107";
  id("statusText").textContent =
    booked
      ? translations[lang].statusBooked
      : translations[lang].statusNotBooked;
}
function showNotBooked() {
  id("notBookedMessage").hidden = false;
  id("pinGrp").hidden           = true;
  id("btnOpen").hidden          = true;
  id("infoText").hidden         = true;
}
function showInteraction() {
  id("notBookedMessage").hidden = true;
  id("pinGrp").hidden           = false;
  id("btnOpen").hidden          = true;
  id("infoText").hidden         = false;
}
function showRegisteredUI() {
  id("notBookedMessage").hidden = true;
  id("pinGrp").hidden           = true;
  id("btnOpen").hidden          = false;
  id("infoText").hidden         = false;
}
function resetAlerts() {
  id("msg").hidden = true;
}

// --- setup della modale di conferma apertura ---
(function setupModalHandlers(){
  const openBtn    = id("btnOpen");
  const confirmBtn = id("confirmOpenBtn");
  const modalEl    = id("confirmOpenModal");

  openBtn.addEventListener("click", e => {
    e.preventDefault();
    setLang(lang);
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  });

  confirmBtn.addEventListener("click", () => {
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
    window.ui.confirmOpen();
  });
})();

// espongo tutto in window.ui prima di caricare app.js
window.ui = {
  show,
  updateStatusDot,
  showLoader,
  hideLoader,
  showNotBooked,
  showInteraction,
  showRegisteredUI,
  resetAlerts,
  // placeholder, sovrascritto in app.js
  confirmOpen: () => {}
};
