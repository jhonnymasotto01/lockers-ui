const API = {
  getStates()        { return fetchJSON("/api/states"); },
  getDetails(id)     { return fetchJSON(`/api/details/${id}`); },
  open(id)           { return post("/api/open",    {locker:id}); },
  book(id,pincode)   { return post("/api/book",    {locker:id,pincode}); },
  unbook(id)         { return post("/api/unbook",  {locker:id}); },
  inhibit(id,val)    { return post("/api/inhibit", {locker:id,inhibit:val}); },
  proceeds(from,to)  { return fetchJSON(`/api/proceeds?from=${from}&to=${to}`); }
};

async function fetchJSON(url,opt){ const r=await fetch(url,opt); if(!r.ok)throw Error(r.status); return r.json();}
function post(url,body){ return fetchJSON(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}); }
export default API;