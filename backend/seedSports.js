require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const YEAR = "2026-27";

const sports = [
  {
    name: "Athletics",
    icon: "🏃",
    type: "INDIVIDUAL",
    description: "Track and field events",
    categories: [
      ["100m", 5, 3, 1],
      ["200m", 5, 3, 1],
      ["400m", 5, 3, 1],
      ["800m", 5, 3, 1],
      ["Relay", 15, 10, 5],
      ["Shotput", 5, 3, 1],
      ["Disc Throw", 5, 3, 1],
      ["Javelin Throw", 5, 3, 1],
      ["Long Jump", 5, 3, 1],
    ],
  },

  {
    name: "Carrom",
    icon: "🎯",
    type: "INDIVIDUAL",
    description: "Carrom competitions",
    categories: [
      ["Boys Singles", 5, 3, 1],
      ["Girls Singles", 5, 3, 1],
      ["Boys Doubles", 10, 7, 4],
      ["Girls Doubles", 10, 7, 4],
      ["Mixed Doubles", 10, 7, 4],
    ],
  },

  {
    name: "Table Tennis",
    icon: "🏓",
    type: "INDIVIDUAL",
    description: "Table tennis competitions",
    categories: [
      ["Boys Singles", 5, 3, 1],
      ["Girls Singles", 5, 3, 1],
      ["Boys Doubles", 10, 7, 4],
      ["Girls Doubles", 10, 7, 4],
      ["Mixed Doubles", 10, 7, 4],
    ],
  },

  {
    name: "Badminton",
    icon: "🏸",
    type: "INDIVIDUAL",
    description: "Badminton competitions",
    categories: [
      ["Boys Singles", 5, 3, 1],
      ["Girls Singles", 5, 3, 1],
      ["Boys Doubles", 10, 7, 4],
      ["Girls Doubles", 10, 7, 4],
      ["Mixed Doubles", 10, 7, 4],
    ],
  },

  {
    name: "Swimming",
    icon: "🏊",
    type: "INDIVIDUAL",
    description: "Swimming competitions",
    categories: [
      ["Boys", 5, 3, 1],
      ["Girls", 5, 3, 1],
      ["Mixed Relay", 15, 10, 5],
    ],
  },

  {
    name: "Chess",
    icon: "♟️",
    type: "INDIVIDUAL",
    description: "Chess competitions",
    categories: [
      ["Boys", 5, 3, 1],
      ["Girls", 5, 3, 1],
      ["Team", 15, 10, 5],
    ],
  },

  {
    name: "Volleyball",
    icon: "🏐",
    type: "TEAM",
    description: "Department volleyball competition",
    categories: [
      ["Boys Team", 25, 15, null],
      ["Girls Team", 25, 15, null],
    ],
  },

  {
    name: "Cricket",
    icon: "🏏",
    type: "TEAM",
    description: "Department cricket competition",
    categories: [
      ["Boys Team", 25, 15, null],
      ["Girls Team", 25, 15, null],
    ],
  },

  {
    name: "Dodgeball",
    icon: "🔴",
    type: "TEAM",
    description: "Department dodgeball competition",
    categories: [
      ["Boys Team", 25, 15, null],
      ["Girls Team", 25, 15, null],
    ],
  },

  {
    name: "Throwball",
    icon: "🏐",
    type: "TEAM",
    description: "Department throwball competition",
    categories: [
      ["Boys Team", 25, 15, null],
      ["Girls Team", 25, 15, null],
    ],
  },

  {
    name: "Kho-Kho",
    icon: "🏃",
    type: "TEAM",
    description: "Department Kho-Kho competition",
    categories: [
      ["Boys Team", 25, 15, null],
      ["Girls Team", 25, 15, null],
    ],
  },

  {
    name: "Football",
    icon: "⚽",
    type: "TEAM",
    description: "Department football competition",
    categories: [
      ["Boys Team", 25, 15, null],
      ["Girls Team", 25, 15, null],
    ],
  },

  {
    name: "Tug of War",
    icon: "💪",
    type: "TEAM",
    description: "Department tug of war competition",
    categories: [
      ["Boys Team", 25, 15, null],
      ["Girls Team", 25, 15, null],
    ],
  },

  {
    name: "Powerlifting",
    icon: "🏋️",
    type: "INDIVIDUAL",
    description: "Powerlifting competition",
    categories: [
      ["Open", 5, 3, 1],
    ],
  },
];

async function main() {
  console.log("======================================");
  console.log("FAMT ARENA SPORTS SEED");
  console.log("Year:", YEAR);
  console.log("======================================");

  for (const sportData of sports) {
    const sport = await prisma.sport.upsert({
      where: {
        name: sportData.name,
      },
      update: {
        icon: sportData.icon,
        type: sportData.type,
        description: sportData.description,
        isActive: true,
      },
      create: {
        name: sportData.name,
        icon: sportData.icon,
        type: sportData.type,
        description: sportData.description,
      },
    });

    console.log(`\nSport: ${sport.name}`);

    for (const categoryData of sportData.categories) {
      const [categoryName, gold, silver, bronze] = categoryData;

      const category = await prisma.sportCategory.upsert({
        where: {
          sportId_name: {
            sportId: sport.id,
            name: categoryName,
          },
        },
        update: {
          isActive: true,
        },
        create: {
          sportId: sport.id,
          name: categoryName,
          format:
            sportData.type === "TEAM"
              ? "KNOCKOUT"
              : "KNOCKOUT",
          entryType:
            categoryName.includes("Doubles") ||
            categoryName.includes("Relay")
              ? "PAIR"
              : categoryName.includes("Team")
              ? "TEAM"
              : "SINGLE",
        },
      });

      await prisma.pointScheme.upsert({
        where: {
          categoryId_year: {
            categoryId: category.id,
            year: YEAR,
          },
        },
        update: {
          goldPoints: gold,
          silverPoints: silver,
          bronzePoints: bronze,
        },
        create: {
          categoryId: category.id,
          year: YEAR,
          goldPoints: gold,
          silverPoints: silver,
          bronzePoints: bronze,
        },
      });

      console.log(`  ✓ ${categoryName}`);
    }
  }

  console.log("\n======================================");
  console.log("SPORTS SEED COMPLETED SUCCESSFULLY");
  console.log("======================================");
}

main()
  .catch((error) => {
    console.error("\nSEED ERROR:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });