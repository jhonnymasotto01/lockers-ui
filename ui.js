// ui.js

// ─── helper per selezionare elementi ────────────────────────────────
function id(x) { return document.getElementById(x); }

// ─── inietto subito il numero armadietto in header ─────────────────
id("titBox").textContent = new URL(location.href).searchParams.get("box") || "?";

// ─── nascondo di default l’avviso incognito ─────────────────────────
id("incognitoWarning").hidden = true;

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
    infoText:         "La registrazione viene memorizzata esclusivamente su questo dispositivo; l’apertura dell’armadietto è consentita soltanto da questo browser.",
    apiUnreachable:   "API non raggiungibile",
    deviceRecognized: "Dispositivo riconosciuto",
    enterPin:         "Inserisci il PIN della prenotazione",
    pinError:         "PIN errato o scaduto",
    loading:          "loading",
    deviceRegistered: "Dispositivo registrato",
    openSuccess:      "Armadietto Aperto",
    incognitoWarn:    "Si raccomanda di non utilizzare la navigazione in incognito o privata, perché i dati non vengono memorizzati.",
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
    infoText:         "Registration is stored exclusively on this device; the locker can only be opened from this browser",
    apiUnreachable:   "API unreachable",
    deviceRecognized: "Device recognized",
    enterPin:         "Enter booking PIN",
    pinError:         "PIN incorrect or expired",
    loading:          "loading",
    deviceRegistered: "Device registered",
    openSuccess:      "Locker Opened",
    incognitoWarn:    "Please avoid using incognito or private browsing, as data will not be persisted.",
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

  // traduci testo e placeholder
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = translations[l][key] || el.textContent;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.placeholder = translations[l][key] || "";
  });

  // modale
  id("confirmOpenLabel").textContent = translations[l].openConfirmTitle;
  id("confirmOpenModal").querySelector(".modal-body").textContent = translations[l].openConfirmBody;
  id("confirmOpenBtn").textContent = translations[l].confirmBtn;
  id("confirmOpenModal").querySelector(".btn-secondary").textContent = translations[l].cancelBtn;

  // aggiorna testo incognito (ma non la visibilità)
  id("incognitoWarning").textContent = translations[l].incognitoWarn;

  // eventuale messaggio già mostrato (eccetto loading)
  const msgEl = id("msg");
  const msgKey = msgEl.getAttribute("data-i18n");
  if (msgKey && msgKey !== "loading") {
    msgEl.textContent = translations[l][msgKey] || msgEl.textContent;
  }

  // aggiorna dot header
  if (typeof window.currentBooked !== "undefined") {
    window.ui.updateStatusDot(window.currentBooked);
  }
}

// bind dei pulsanti lingua e init
id("lang-it").addEventListener("click", () => setLang("it"));
id("lang-en").addEventListener("click", () => setLang("en"));
setLang(lang);

// ─── loader a puntini dentro #msg ────────────────────────────────────
function showLoaderInMsg() {
  const el = id("msg");
  el.className = "alert alert-info rounded-pill text-center";
  el.innerHTML = `
    <div class="dots">
      <div></div><div></div><div></div>
    </div>
  `;
  el.hidden = false;
}

function hideLoaderInMsg() {
  const el = id("msg");
  el.hidden    = true;
  el.innerHTML = "";
}

// ─── mostra messaggi (incluso loading) ───────────────────────────────
function show(type, keyOrMsg) {
  if (keyOrMsg === "loading") {
    showLoaderInMsg();
    return;
  }
  hideLoaderInMsg();
  const el = id("msg");
  if (translations[lang][keyOrMsg] !== undefined) {
    el.setAttribute("data-i18n", keyOrMsg);
    el.textContent = translations[lang][keyOrMsg];
  } else {
    el.removeAttribute("data-i18n");
    el.textContent = keyOrMsg;
  }
  el.className = `alert alert-${type} rounded-pill text-center`;
  el.hidden    = false;
}

// ─── stato header ───────────────────────────────────────────────────
function updateStatusDot(booked) {
  const dot = id("statusDot");
  dot.style.background = booked ? "#28a745" : "#ffc107";
  id("statusText").textContent =
    booked
      ? translations[lang].statusBooked
      : translations[lang].statusNotBooked;
}

// ─── interazione UI ─────────────────────────────────────────────────
function showNotBooked() {
  id("notBookedMessage").hidden  = false;
  id("pinGrp").hidden            = true;
  id("btnOpen").hidden           = true;
  id("infoText").hidden          = true;
  id("incognitoWarning").hidden  = true;
}

function showInteraction() {
  id("notBookedMessage").hidden  = true;
  id("pinGrp").hidden            = false;
  id("btnOpen").hidden           = true;
  id("infoText").hidden          = false;
  id("incognitoWarning").hidden  = false;
}

function showRegisteredUI() {
  id("notBookedMessage").hidden  = true;
  id("pinGrp").hidden            = true;
  id("btnOpen").hidden           = false;
  id("infoText").hidden          = false;
  id("incognitoWarning").hidden  = false;
}

function resetAlerts() {
  hideLoaderInMsg();
}

// ─── setup della modale di conferma apertura ─────────────────────────
(function setupModalHandlers(){
  const openBtn    = id("btnOpen");
  const confirmBtn = id("confirmOpenBtn");
  const modalEl    = id("confirmOpenModal");

  openBtn.addEventListener("click", e => {
    e.preventDefault();
    setLang(lang);
    new bootstrap.Modal(modalEl).show();
  });

  confirmBtn.addEventListener("click", () => {
    bootstrap.Modal.getInstance(modalEl).hide();
    window.ui.confirmOpen();
  });
})();

// ─── esportazioni per app.js ─────────────────────────────────────────
window.ui = {
  show,
  updateStatusDot,
  showNotBooked,
  showInteraction,
  showRegisteredUI,
  resetAlerts,
  confirmOpen: () => {},
  showBodyLoader: () => show("info","loading")
};
