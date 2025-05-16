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
  }
};

// lingua di default
let lang = localStorage.getItem("lang") || "it";

// ─── cambio lingua ──────────────────────────────────────────────────
function setLang(l) {
  lang = l;
  localStorage.setItem("lang", l);

  id("lang-it").classList.toggle("selected", l === "it");
  id("lang-en").classList.toggle("selected", l === "en");

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = translations[l][key] || el.textContent;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.placeholder = translations[l][key] || "";
  });
}
id("lang-it").addEventListener("click", () => setLang("it"));
id("lang-en").addEventListener("click", () => setLang("en"));
setLang(lang);

// ─── funzioni di UI ─────────────────────────────────────────────────
// mostra loader e nasconde contenuto
function showLoader() {
  id("loader").hidden  = false;
  id("content").hidden = true;
}
// nasconde loader e mostra contenuto
function hideLoader() {
  id("loader").hidden  = true;
  id("content").hidden = false;
}
// messaggi di stato
function show(type, keyOrMsg) {
  const el = id("msg");
  el.className   = `alert alert-${type} rounded-pill`;
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
