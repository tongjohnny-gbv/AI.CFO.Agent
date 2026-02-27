import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@ai-cfo/db";

export async function POST(req: NextRequest) {
  const { team_id, slack_user_id, org_id, membership_role } = await req.json();
  await prisma.slackIdentity.upsert({
    where: { teamId_slackUserId_orgId: { teamId: team_id, slackUserId: slack_user_id, orgId: org_id } },
    update: { active: true, membershipRole: membership_role },
    create: { teamId: team_id, slackUserId: slack_user_id, orgId: org_id, membershipRole: membership_role }
  });
  return NextResponse.json({ ok: true });
}
