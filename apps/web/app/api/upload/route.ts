import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { prisma } from "@ai-cfo/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { org_id, type, filename, csv_text, mapping } = body as { org_id: string; type: "gl" | "pl"; filename: string; csv_text: string; mapping: Record<string, string> };
  const rows = parse(csv_text, { columns: true, skip_empty_lines: true });

  if (type === "gl") {
    await prisma.gLRow.createMany({
      data: rows.map((r: any) => ({
        orgId: org_id,
        date: new Date(r[mapping.date] ?? r.date),
        accountName: r[mapping.account_name] ?? r.account_name,
        accountType: r[mapping.account_type] ?? null,
        amount: Number(r[mapping.amount] ?? r.amount),
        vendor: r[mapping.vendor] ?? null,
        memo: r[mapping.memo] ?? null,
        raw: r
      }))
    });
  } else {
    for (const r of rows) {
      await prisma.monthlyPL.upsert({
        where: { orgId_month: { orgId: org_id, month: r[mapping.month] ?? r.month } },
        update: {
          revenue: Number(r[mapping.revenue] ?? r.revenue), cogs: Number(r[mapping.cogs] ?? r.cogs), grossProfit: Number(r[mapping.gross_profit] ?? r.gross_profit), opex: Number(r[mapping.opex] ?? r.opex), netIncome: Number(r[mapping.net_income] ?? r.net_income), raw: r
        },
        create: {
          orgId: org_id,
          month: r[mapping.month] ?? r.month,
          revenue: Number(r[mapping.revenue] ?? r.revenue), cogs: Number(r[mapping.cogs] ?? r.cogs), grossProfit: Number(r[mapping.gross_profit] ?? r.gross_profit), opex: Number(r[mapping.opex] ?? r.opex), netIncome: Number(r[mapping.net_income] ?? r.net_income), raw: r
        }
      });
    }
  }

  await prisma.financialUpload.create({
    data: { orgId: org_id, filename, type, periodStart: new Date(), periodEnd: new Date() }
  });

  await prisma.contextNote.upsert({
    where: { id: `${org_id}-${type}-mapping` },
    update: { note: JSON.stringify(mapping) },
    create: { id: `${org_id}-${type}-mapping`, orgId: org_id, note: JSON.stringify(mapping) }
  });

  return NextResponse.json({ ok: true, rows: rows.length });
}
