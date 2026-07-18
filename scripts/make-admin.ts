// Promote an existing user to ADMIN by email.
// The person must have signed in at least once (so their profile exists).
//
// Usage: npm run make-admin -- someone@example.com

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npm run make-admin -- <email>");
    process.exit(1);
  }

  const profile = await prisma.profile.findUnique({ where: { email } });
  if (!profile) {
    console.error(`No account found for ${email}. Have them sign in once first.`);
    process.exit(1);
  }

  await prisma.profile.update({ where: { email }, data: { role: "ADMIN" } });
  console.log(`${email} is now an ADMIN.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
