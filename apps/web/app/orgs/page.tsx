"use client";
import { useEffect, useState } from "react";

export default function OrgsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [name, setName] = useState("New Org");
  const reload = ()=>fetch('/api/orgs').then(r=>r.json()).then(d=>setOrgs(d.orgs||[]));
  useEffect(reload,[]);
  return <main className="space-y-4"><h1 className="text-xl font-semibold">Org selection and switching</h1><div className="card"><p>Current demo org: <b>demo-org</b>. (NextAuth/Clerk hook points prepared in README.)</p></div><div className="card space-y-2"><input className="bg-slate-800 p-2" value={name} onChange={(e)=>setName(e.target.value)} /><button className="bg-cyan-700 px-3 py-1 rounded" onClick={async()=>{await fetch('/api/orgs',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name})});reload();}}>Create org</button></div>{orgs.map((o)=><div key={o.id} className="card">{o.name} ({o.id})</div>)}</main>;
}
