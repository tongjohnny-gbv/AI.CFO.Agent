import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ai-cfo/db";

export async function POST(req: NextRequest) {
  const { org_id, month } = await req.json();
  const pl = await prisma.monthlyPL.findUnique({ where: { orgId_month: { orgId: org_id, month } } });
  if (!pl) return NextResponse.json({ error: "month not found" }, { status: 404 });
  const content = {
    exec_summary: `For ${month}, revenue was ${pl.revenue} and net income ${pl.netIncome}.`,
    kpis: [{ key: "Gross Margin", value: Number(pl.revenue) ? (Number(pl.grossProfit) / Number(pl.revenue) * 100).toFixed(1) + "%" : "n/a" }],
    risks: ["Expense growth could compress profitability."],
    opportunities: ["Review pricing and COGS renegotiation."],
    questions: ["Which 3 expenses drove month-over-month variance?", "How concentrated is pipeline revenue?"]
  };
  const report = await prisma.monthlyReport.upsert({ where: { orgId_month: { orgId: org_id, month } }, update: { content }, create: { orgId: org_id, month, content } });
  return NextResponse.json({ report });
}

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("org_id");
  const reports = await prisma.monthlyReport.findMany({ where: { orgId: orgId || undefined }, orderBy: { month: "desc" }, take: 20 });
  return NextResponse.json({ reports });
}
