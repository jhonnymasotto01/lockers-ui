// ─── SETUP UI (HEADER, STYLES, MAIN, FOOTER) ─────────────────────────────
;(function(){
  // 1) inietto lo style
  const style = document.createElement('style');
  style.textContent = `
    body { background: #d4e4f0; margin:0; font-family: sans-serif; }
    header { display:flex; justify-content:space-between; align-items:center;
             padding:0.5rem 1rem; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,0.1); }
    header h1 { margin:0; color:#001f3f; font-size:1.25rem; }
    .lang-switcher button { background:none; border:none; font-size:1.25rem;
                             margin:0 0.25rem; cursor:pointer; opacity:0.5; }
    .lang-switcher button.selected { opacity:1; }
    .status { display:flex; align-items:center; gap:0.5rem; font-size:0.9rem; }
    .status-dot { width:0.75rem; height:0.75rem; border-radius:50%; display:inline-block; }
    main { padding:1rem; }
    #pin { border-radius:1rem; }
    #btnReg, #btnOpen { border-radius:1rem; width:100%; }
    #notBookedMessage { text-align:center; margin:2rem 0; font-size:1rem; }
    footer { text-align:center; padding:1rem; font-size:0.85rem; background:#fff; }
  `;
  document.head.appendChild(style);

  // 2) creo header
  const header = document.createElement('header');
  header.innerHTML = `
    <h1 id="appTitle">Locker App</h1>
    <div class="lang-switcher">
      <button id="lang-it">🇮🇹</button>
      <button id="lang-en">🇬🇧</button>
    </div>
    <div class="status">
      <span class="status-dot"></span>
      <span id="statusText">…</span>
      <span><strong data-i18n="boxLabel">Armadietto</strong> <strong id="titBox">?</strong></span>
    </div>
  `;
  document.body.insertBefore(header, document.body.firstChild);

  // 3) avvolgo il resto in <main>
  const main = document.createElement('main');
  // sposto tutti i nodi validi (tranne lo script) dentro main
  let sibling = header.nextSibling;
  while(sibling && !(sibling.tagName === 'SCRIPT' && sibling.src.includes('app.js'))){
    const toMove = sibling;
    sibling = sibling.nextSibling;
    main.appendChild(toMove);
  }
  header.after(main);

  // 4) inietto il messaggio “non prenotato”
  const notBooked = document.createElement('div');
  notBooked.id = 'notBookedMessage';
  notBooked.hidden = true;
  notBooked.textContent = 'Prenota ora il tuo armadietto, segui le linee guida riportate sul totem per l’acquisto e la prenotazione';
  main.insertBefore(notBooked, main.firstChild);

  // 5) footer
  const footer = document.createElement('footer');
  footer.innerHTML = '&copy; CanevaWorld® 2025';
  document.body.appendChild(footer);

  // 6) lingua e status base (ti basta poi integrare il cambio lingua in fondo a app.js)
  let lang = localStorage.getItem('lang') || 'it';
  const btnIt = document.getElementById('lang-it');
  const btnEn = document.getElementById('lang-en');
  function setLang(l){
    lang = l;
    localStorage.setItem('lang',l);
    btnIt.classList.toggle('selected', l==='it');
    btnEn.classList.toggle('selected', l==='en');
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      el.textContent = translations[lang][key] || el.textContent;
    });
  }
  btnIt.onclick = ()=> setLang('it');
  btnEn.onclick = ()=> setLang('en');
  setLang(lang);

  // helper per aggiornare il bollino
  window.updateStatusDot = booked => {
    const dot = document.querySelector('.status-dot');
    dot.style.background = booked ? '#28a745' : '#ffc107';
    document.getElementById('statusText').textContent =
      booked
        ? (lang==='it' ? 'Prenotato' : 'Booked')
        : (lang==='it' ? 'Non prenotato' : 'Not booked');
  };
})();


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
