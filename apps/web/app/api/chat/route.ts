import { NextRequest, NextResponse } from "next/server";
import { buildChatResponse, ChatRequest, runDetectors } from "@ai-cfo/core";
import { prisma } from "@ai-cfo/db";
import { correlationId } from "@/lib/correlation";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ChatRequest;
  const corr = correlationId(body.correlation_id);

  const [pl, gl, notes] = await Promise.all([
    prisma.monthlyPL.findMany({ where: { orgId: body.org_id }, orderBy: { month: "asc" }, take: 12 }),
    prisma.gLRow.findMany({ where: { orgId: body.org_id }, orderBy: { date: "desc" }, take: 150 }),
    prisma.contextNote.findMany({ where: { orgId: body.org_id }, orderBy: { createdAt: "desc" }, take: 5 })
  ]);

  await prisma.message.create({
    data: {
      orgId: body.org_id,
      source: body.source,
      userId: body.user_id,
      slackThreadTs: body.thread_id,
      text: body.text,
      metadata: { correlation_id: corr }
    }
  });

  const response = buildChatResponse(
    { ...body, correlation_id: corr },
    pl.map((m) => ({ month: m.month, revenue: Number(m.revenue), cogs: Number(m.cogs), gross_profit: Number(m.grossProfit), opex: Number(m.opex), net_income: Number(m.netIncome) })),
    gl.map((r) => ({ id: r.id, date: r.date.toISOString().slice(0, 10), account_name: r.accountName, account_type: r.accountType, amount: Number(r.amount), vendor: r.vendor, memo: r.memo })),
    notes.map((n) => n.note)
  );

  const detectorInsights = runDetectors(
    pl.map((m) => ({ month: m.month, revenue: Number(m.revenue), cogs: Number(m.cogs), gross_profit: Number(m.grossProfit), opex: Number(m.opex), net_income: Number(m.netIncome) })),
    gl.map((r) => ({ id: r.id, date: r.date.toISOString().slice(0, 10), account_name: r.accountName, amount: Number(r.amount), memo: r.memo }))
  );

  await prisma.insight.createMany({
    data: detectorInsights.slice(0, 8).map((i) => ({ orgId: body.org_id, key: i.key, severity: i.severity, title: i.title, detail: i.detail }))
  });

  return NextResponse.json({ ...response, correlation_id: corr });
}
