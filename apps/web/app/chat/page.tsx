"use client";
import { useState } from "react";

export default function ChatPage() {
  const [text, setText] = useState("What changed in margin this month?");
  const [resp, setResp] = useState<any>(null);
  return <main className="space-y-4"><h1 className="text-xl font-semibold">Shared Chat Endpoint</h1><div className="card space-y-2"><input className="w-full bg-slate-800 p-2" value={text} onChange={(e)=>setText(e.target.value)} /><button className="bg-blue-600 px-3 py-1 rounded" onClick={async()=>{const r=await fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({org_id:'demo-org',source:'web',text})});setResp(await r.json());}}>Ask</button></div>{resp && <pre className="card whitespace-pre-wrap text-xs">{JSON.stringify(resp,null,2)}</pre>}</main>;
}
