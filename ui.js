// ui.js

// ─── helper per selezionare elementi ─────────────────────────────────
function id(x){ return document.getElementById(x); }

// ─── inietto subito il numero armadietto in header ──────────────────
const boxParam = new URL(location.href).searchParams.get("box") || "?";
id("titBox").textContent = boxParam;

// ─── traduzioni ──────────────────────────────────────────────────────
const translations = {
  it: {
    appTitle:        "Locker App",
    boxLabel:        "Armadietto",
    statusBooked:    "Prenotato",
    statusNotBooked: "Non prenotato",
    notBooked:       "Prenota ora il tuo armadietto, segui le linee guida riportate sul totem per l'acquisto e la prenotazione",
    pinPlaceholder:  "Inserisci PIN",
    registerBtn:     "Registra ora",
    openBtn:         "Apri ora",
    infoText:        "La registrazione avviene sul dispositivo attualmente connesso e quindi solo con tale dispositivo si potrà aprire.",
    apiUnreachable:  "API non raggiungibile",
    deviceRecognized:"Dispositivo riconosciuto",
    enterPin:        "Inserisci il PIN della prenotazione"
    loading:         "Caricamento in corso\u2026"
  },
  en: {
    appTitle:        "Locker App",
    boxLabel:        "Locker",
    statusBooked:    "Booked",
    statusNotBooked: "Not booked",
    notBooked:       "Reserve now your locker – follow the guidelines on the kiosk for purchase and booking",
    pinPlaceholder:  "Enter PIN",
    registerBtn:     "Register now",
    openBtn:         "Open now",
    infoText:        "Registration occurs on the currently connected device, so only that device can open it.",
    apiUnreachable:  "API unreachable",
    deviceRecognized:"Device recognized",
    enterPin:        "Enter the booking PIN"
    loading:         "Loading\u2026"
  }
};

// lingua di default
let lang = localStorage.getItem("lang") || "it";

// ─── cambio lingua ──────────────────────────────────────────────────
// ─── cambio lingua ──────────────────────────────────────────────────
function setLang(l) {
  lang = l;
  localStorage.setItem("lang", l);

  // 1) toggle pulsanti
  id("lang-it").classList.toggle("selected", l === "it");
  id("lang-en").classList.toggle("selected", l === "en");

  // 2) traduci tutti gli elementi con data-i18n
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = translations[lang][key] || el.textContent;
  });

  // 3) traduci tutti i placeholder
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.placeholder = translations[lang][key] || "";
  });

  // 4) se #msg ha una data-i18n, ritraducilo
  const msgEl = id("msg");
  const msgKey = msgEl.getAttribute("data-i18n");
  if (msgKey) {
    msgEl.textContent = translations[lang][msgKey];
  }

  // 5) ritraduco anche lo stato Prenotato/Non prenotato
  if (typeof window.currentBooked !== "undefined") {
    updateStatusDot(window.currentBooked);
  }
}

// bind degli eventi e avvio
id("lang-it").addEventListener("click", () => setLang("it"));
id("lang-en").addEventListener("click", () => setLang("en"));
setLang(lang);

// ─── funzioni di UI ─────────────────────────────────────────────────
// mostra loader e nasconde contenuto
// ─── mostra loader e nasconde tutte le altre aree ────────────────────
function showLoader() {
  id("loader").hidden      = false;
  id("statusDot").hidden   = true;
  id("statusText").hidden  = true;
  id("content").hidden     = true;
}

// ─── nasconde loader e mostra di nuovo tutto ───────────────────────
function hideLoader() {
  id("loader").hidden      = true;
  id("statusDot").hidden   = false;
  id("statusText").hidden  = false;
  id("content").hidden     = false;
}

// ─── messaggi di stato ─────────────────────────────────────────────────
function show(type, keyOrMsg) {
  const el = id("msg");
  // css
  el.className   = `alert alert-${type} rounded-pill`;
  // se è una nostra chiave di traduzione la metto come data-i18n,
  // altrimenti la tolgo (es. messaggi dall'API)
  if (translations[lang][keyOrMsg] !== undefined) {
    el.setAttribute("data-i18n", keyOrMsg);
  } else {
    el.removeAttribute("data-i18n");
  }
  // testo (sia tradotto che letterale)
  el.textContent = translations[lang][keyOrMsg] || keyOrMsg;
  el.hidden      = false;
}

// aggiorna bollino + testo "Prenotato"/"Non prenotato"
function updateStatusDot(booked) {
  const dot = id("statusDot");
  dot.style.background = booked ? "#28a745" : "#ffc107";
  id("statusText").textContent =
    booked
      ? translations[lang].statusBooked
      : translations[lang].statusNotBooked;
}
// UI per i vari stati
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
// reset di ogni alert
function resetAlerts() {
  id("msg").hidden = true;
}

// esportazione per app.js
window.ui = {
  show,
  updateStatusDot,
  showLoader,
  hideLoader,
  showNotBooked,
  showInteraction,
  showRegisteredUI,
  resetAlerts
};
