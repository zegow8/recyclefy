const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: 'rainawr@gmail.com' },
    data: { koin: 100 },
  });
  console.log(`✅ User ${user.email} sekarang punya ${user.koin} poin`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());