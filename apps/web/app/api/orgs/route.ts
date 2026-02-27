import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ai-cfo/db";

export async function GET() {
  return NextResponse.json({ orgs: await prisma.org.findMany({ orderBy: { createdAt: "desc" } }) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const org = await prisma.org.create({ data: { name: body.name } });
  return NextResponse.json({ org });
}
