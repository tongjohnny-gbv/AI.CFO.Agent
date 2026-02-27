import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ai-cfo/db";

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("org_id");
  if (!orgId) return NextResponse.json({ error: "org_id required" }, { status: 400 });
  const insights = await prisma.insight.findMany({ where: { orgId }, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ insights });
}
