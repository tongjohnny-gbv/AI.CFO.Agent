"use client";
import { useEffect, useState } from "react";

export default function InsightsPage() {
  const [insights, setInsights] = useState<any[]>([]);
  useEffect(()=>{fetch('/api/insights?org_id=demo-org').then(r=>r.json()).then(d=>setInsights(d.insights||[]));},[]);
  return <main className="space-y-4"><h1 className="text-xl font-semibold">Proactive Insights Feed</h1>{insights.map((i)=><div key={i.id} className="card"><p className="font-medium">{i.title} <span className="text-xs text-slate-400">{i.severity}</span></p><p className="text-sm text-slate-300">{i.detail}</p></div>)}</main>;
}
