/* ---------- config ---------------------------------------------------- */
const api   = "https://lockers-api.cqc2qfkwcw.workers.dev/";
const url   = new URL(location.href);
const boxId = +url.searchParams.get("box") || 0;
document.getElementById("title").textContent = `Locker ${boxId}`;

const devId = localStorage.devId ||= crypto.randomUUID();

/* ---------- elementi -------------------------------------------------- */
const regSec = document.getElementById("reg");
const openSec= document.getElementById("open");
const msg    = document.getElementById("msg");
const okText = document.getElementById("ok");

async function check(){
  const r = await fetch(`${api}/check?box=${boxId}&dev=${devId}`).then(r=>r.json());
  if (r.ok){
    regSec.hidden = true;  openSec.hidden = false;
  } else {
    regSec.hidden = false; openSec.hidden = true;
  }
}

document.getElementById("btnReg").onclick = async ()=>{
  msg.textContent="";
  const pin = document.getElementById("pin").value.trim();
  if(!pin){msg.textContent="Inserisci PIN";return;}
  const res = await fetch(api+"/register",{method:"POST",
        headers:{ "content-type":"application/json"},
        body: JSON.stringify({box:boxId,pin,dev:devId})}).then(r=>r.json());
  if(res.ok){ await check(); }
  else msg.textContent="PIN errato";
};

document.getElementById("btnOpen").onclick = async ()=>{
  okText.textContent="";
  const res = await fetch(`${api}/open?dev=${devId}`).then(r=>r.json());
  okText.textContent = res.ok ? "Aperto!" : "Errore";
};

check();
