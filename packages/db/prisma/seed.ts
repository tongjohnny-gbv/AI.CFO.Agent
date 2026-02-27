import { prisma } from "../index";

async function main() {
  const org = await prisma.org.upsert({
    where: { id: "demo-org" },
    update: {},
    create: { id: "demo-org", name: "Demo Co" }
  });

  const user = await prisma.user.upsert({
    where: { email: "owner@demo.co" },
    update: {},
    create: { email: "owner@demo.co", name: "Demo Owner" }
  });

  await prisma.membership.upsert({
    where: { userId_orgId: { userId: user.id, orgId: org.id } },
    update: {},
    create: { userId: user.id, orgId: org.id, role: "owner" }
  });

  await prisma.contextNote.create({ data: { orgId: org.id, note: "SaaS business with annual contracts and Q4 seasonality." } });
  console.log("Seeded demo org:", org.id);
}

main().finally(() => prisma.$disconnect());
