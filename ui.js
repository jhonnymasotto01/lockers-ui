// ui.js

// ───── DOM references ─────────────────────────────────────
const loader            = id("loader");
const notBookedMessage  = id("notBookedMessage");
const interaction       = id("interaction");
const msgEl             = id("msg");
const pinGrp            = id("pinGrp");
const boxTitleEl        = id("titBox");
const statusDot         = document.querySelector(".status-dot");
const statusText        = id("statusText");
const langButtons       = {
  it: id("lang-it"),
  en: id("lang-en")
};

// ───── traduzioni ────────────────────────────────────────
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

// lingua di default (salvata in localStorage)
let lang = localStorage.getItem("lang") || "it";

// ───── all'avvio pagina ─────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // setta la lingua
  setLang(lang);
  // nascondi loader e sezioni
  loader.hidden           = true;
  interaction.hidden      = true;
  notBookedMessage.hidden = true;
});

// ───── language switcher events ─────────────────────────
langButtons.it.addEventListener("click", ()=> setLang("it"));
langButtons.en.addEventListener("click", ()=> setLang("en"));

// ───── funzioni di supporto ─────────────────────────────
function setLang(l) {
  lang = l;
  localStorage.setItem("lang", l);
  // evidenzia il selezionato
  Object.values(langButtons).forEach(b => b.classList.remove("selected"));
  langButtons[l].classList.add("selected");
  // aggiorna tutti i testi
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = translations[lang][key] || el.textContent;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.placeholder = translations[lang][key] || "";
  });
}

function getText(key) {
  return translations[lang][key];
}

function updateStatus(booked) {
  if (booked == null) return;
  if (booked) {
    statusDot.style.backgroundColor = "var(--green-dot)";
    statusText.textContent = getText("statusBooked");
  } else {
    statusDot.style.backgroundColor = "var(--yellow-dot)";
    statusText.textContent = getText("statusNotBooked");
  }
}

function showLoader() {
  loader.hidden = false;
  interaction.hidden      = true;
  notBookedMessage.hidden = true;
  msgEl.hidden            = true;
}

function hideLoader() {
  loader.hidden = true;
}

function showNotBooked() {
  notBookedMessage.hidden = false;
  interaction.hidden      = true;
}

function showInteraction() {
  interaction.hidden      = false;
  notBookedMessage.hidden = true;
}

function showDanger(keyOrMsg) {
  msgEl.className   = "alert alert-danger rounded-pill";
  msgEl.textContent = translations[lang][keyOrMsg] || keyOrMsg;
  msgEl.hidden      = false;
}

function showSuccess(keyOrMsg) {
  msgEl.className   = "alert alert-success rounded-pill";
  msgEl.textContent = translations[lang][keyOrMsg] || keyOrMsg;
  msgEl.hidden      = false;
}

function showInfo(keyOrMsg) {
  msgEl.className   = "alert alert-info rounded-pill";
  msgEl.textContent = translations[lang][keyOrMsg] || keyOrMsg;
  msgEl.hidden      = false;
}

function id(x) {
  return document.getElementById(x);
}
