const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const departments = await prisma.department.findMany();

  for (const department of departments) {
    await prisma.departmentStanding.upsert({
      where: {
        departmentId: department.id
      },
      update: {},
      create: {
        departmentId: department.id,
        gold: 0,
        silver: 0,
        bronze: 0,
        points: 0
      }
    });
  }

  console.log(
    "Point table initialized:",
    departments.length,
    "departments"
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });