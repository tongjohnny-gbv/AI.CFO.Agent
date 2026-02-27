import { prisma } from "@ai-cfo/db";

export default async function ReportMonthPage({ params }: { params: { month: string } }) {
  const report = await prisma.monthlyReport.findFirst({ where: { orgId: "demo-org", month: params.month } });
  return <main className="card"><h1 className="text-xl font-semibold">Report {params.month}</h1><pre className="text-xs mt-2 whitespace-pre-wrap">{JSON.stringify(report?.content ?? { message: 'No report' }, null, 2)}</pre></main>;
}
