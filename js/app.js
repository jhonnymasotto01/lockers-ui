import API from "./api.js";
const grid=document.querySelector("#grid");
const mEl=document.getElementById("boxModal");
const modal=new bootstrap.Modal(mEl);
const title=mEl.querySelector(".modal-title");
const tbl=mEl.querySelector("#tblDetails");
const btnOpen=mEl.querySelector("#btnOpen");
const btnBook=mEl.querySelector("#btnBook");
const btnInhibit=mEl.querySelector("#btnInhibit");
let curId=null,curCode=0;

init();

async function init(){
  await renderGrid();
  await refreshIncassi();
  document.getElementById("btnApriTutti").onclick=openAll;
}
async function renderGrid(){
  const st=await API.getStates(); grid.innerHTML="";
  Object.entries(st).forEach(([id,code])=>{
    const col=document.createElement("div"); col.className="col-auto";
    const q=document.createElement("div"); q.className="square "+color(code); q.textContent=id;
    q.onclick=()=>openModal(+id,code); col.appendChild(q); grid.appendChild(col);
  });
}
function color(c){if(c===1||c===6)return"green"; if(c===3||c===8)return"blue"; return"red";}

async function openModal(id,code){
  curId=id;curCode=code; title.textContent=`Box #${id}`;
  btnBook.textContent=(code===2)?"Libera":"Occupa";
  btnOpen.disabled=btnBook.disabled=(code===3);
  btnInhibit.textContent=(code===3)?"Sblocca":"Blocca";

  tbl.innerHTML="<tr><td>Loading…</td></tr>";
  const rows=await API.getDetails(id);
  tbl.innerHTML=rows.length?rows.slice(-10).reverse().map(r=>`
    <tr><td>${r.date}</td><td>${descr(r.action)}</td><td>${r.pwd}</td></tr>`).join("")
    :"<tr><td>Nessun evento</td></tr>";
  modal.show();
}
btnOpen.onclick=()=>API.open(curId).then(closeRefresh);
btnBook.onclick=async()=>{
  if(curCode===2) await API.unbook(curId);
  else{
    const pin=prompt("Pincode?"); if(!pin)return; await API.book(curId,pin);
  } closeRefresh();
};
btnInhibit.onclick=()=>API.inhibit(curId,!(curCode===3)).then(closeRefresh);
function closeRefresh(){ modal.hide(); renderGrid(); }
function descr(a){return({1:"Aperto",5:"Prenotato",6:"Liberato"})[a]||a;}

async function refreshIncassi(){
  const t=new Date().toISOString().slice(0,10);
  const list=await API.proceeds(t,t);
  document.getElementById("totIncassi").textContent="€ "+list.reduce((s,i)=>s+i.total,0).toFixed(2);
}
async function openAll(){ const st=await API.getStates(); for(const id of Object.keys(st))API.open(+id); alert("Comando inviato"); }
