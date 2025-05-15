const API = "https://lockers-api.cqc2qfkwcw.workers.dev";  // <-- cambia

const qs  = new URLSearchParams(location.search);
const box = Number(qs.get("box"));
document.getElementById("boxLbl").textContent = box || "-";

const alertBox = document.getElementById("alert");
function showMsg(type,msg){
  alertBox.className = `alert alert-${type}`; alertBox.textContent = msg;
  alertBox.classList.remove("d-none");
}

function hide(id){ document.getElementById(id).classList.add("d-none"); }
function show(id){ document.getElementById(id).classList.remove("d-none"); }

if(!Number.isInteger(box)||box<100||box>183){ showMsg("danger","Box non valido"); }
else loadStatus();

async function loadStatus(){
  const r = await fetch(`${API}/status?box=${box}`).then(r=>r.json());
  if(!r.ok){ showMsg("danger",r.msg); return; }

  if(!r.booked){ showMsg("warning","Box libero, nessuna prenotazione."); return; }

  if(r.registered){
    showMsg("success","Dispositivo riconosciuto.");
    show("openBtn");
  }else{
    showMsg("info","Inserisci il PIN della tua prenotazione.");
    show("needPin");
  }
}

document.getElementById("regBtn").onclick = async ()=>{
  const pin = document.getElementById("pin").value.trim();
  if(!pin) return;
  const r = await fetch(`${API}/register?box=${box}&pin=${pin}`).then(r=>r.json());
  if(r.ok){ hide("needPin"); loadStatus(); }
  else showMsg("danger",r.msg);
};

document.getElementById("openBtn").onclick = async ()=>{
  const r = await fetch(`${API}/open?box=${box}`).then(r=>r.json());
  if(r.ok) showMsg("success","Apertura inviata!");
  else     showMsg("danger",r.msg);
};
