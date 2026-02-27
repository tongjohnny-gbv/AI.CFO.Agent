"use client";
import { useEffect, useState } from "react";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  useEffect(()=>{fetch('/api/reports?org_id=demo-org').then(r=>r.json()).then(d=>setReports(d.reports||[]));},[]);
  return <main className="space-y-4"><h1 className="text-xl font-semibold">Monthly Package</h1><button className="bg-violet-600 px-3 py-1 rounded" onClick={async()=>{await fetch('/api/reports',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({org_id:'demo-org',month:'2024-02'})});const r=await fetch('/api/reports?org_id=demo-org');setReports((await r.json()).reports||[]);}}>Generate latest package</button>{reports.map((r)=><a key={r.id} href={`/reports/${r.month}`} className="card block">{r.month} package</a>)}</main>;
}
