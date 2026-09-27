require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const departments = [
  {
    name: "Information Technology",
    code: "IT",
  },
  {
    name: "CSE-AIML",
    code: "AIML",
  },
  {
    name: "CSE-CYSE",
    code: "CYSE",
  },
  {
    name: "Mechanical",
    code: "MECH",
  },
  {
    name: "Electrical",
    code: "ELEC",
  },
  {
    name: "Chemical",
    code: "CHEM",
  },
  {
    name: "Electronics & Telecommunication",
    code: "ENTC",
  },
  {
    name: "MCA",
    code: "MCA",
  },
];

async function main() {
  console.log("Seeding departments...");

  for (const department of departments) {
    const result = await prisma.department.upsert({
      where: {
        code: department.code,
      },
      update: {
        name: department.name,
      },
      create: department,
    });

    console.log(`✓ ${result.name} (${result.code})`);
  }

  console.log("Departments seeded successfully.");
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });