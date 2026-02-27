"use client";
import { useState } from "react";

export default function UploadPage() {
  const [csv, setCsv] = useState("month,revenue,cogs,gross_profit,opex,net_income\n2024-03,130000,42000,88000,64000,14000");
  const [type, setType] = useState<"pl"|"gl">("pl");
  const [msg, setMsg] = useState("");
  return <main className="space-y-4"><h1 className="text-xl font-semibold">CSV Upload + Mapping</h1><div className="card space-y-2"><select className="bg-slate-800 p-2" value={type} onChange={(e)=>setType(e.target.value as any)}><option value="pl">Monthly P&L</option><option value="gl">General Ledger</option></select><textarea className="w-full h-56 bg-slate-800 p-2" value={csv} onChange={(e)=>setCsv(e.target.value)} /><button className="bg-emerald-600 px-3 py-1 rounded" onClick={async()=>{const mapping=type==='pl'?{month:'month',revenue:'revenue',cogs:'cogs',gross_profit:'gross_profit',opex:'opex',net_income:'net_income'}:{date:'date',account_name:'account_name',amount:'amount',account_type:'account_type',vendor:'vendor',memo:'memo'};const r=await fetch('/api/upload',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({org_id:'demo-org',type,filename:'inline.csv',csv_text:csv,mapping})});setMsg(JSON.stringify(await r.json()));}}>Upload</button><p>{msg}</p></div></main>;
}
