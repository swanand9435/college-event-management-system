require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const initialCommittees = [
  {
    id: "natyarang",
    name: "Natyarang",
    category: "Performance",
    icon: "🎭",
    description: "The theatre committee responsible for stage performances and theatrical activities.",
  },
  {
    id: "dance",
    name: "Dance",
    category: "Performance",
    icon: "💃",
    description: "The committee responsible for dance performances and related activities.",
  },
  {
    id: "swarsandhya",
    name: "Swarsandhya",
    category: "Music",
    icon: "🎵",
    description: "The committee responsible for musical performances.",
  },
  {
    id: "voice-of-famt",
    name: "Voice of FAMT",
    category: "Music",
    icon: "🎤",
    description: "The committee responsible for vocal talent and singing activities.",
  },
  {
    id: "anchoring",
    name: "Anchoring",
    category: "Stage",
    icon: "🎙️",
    description: "Responsible for hosting and stage communication.",
  },
  {
    id: "dhol-tasha",
    name: "Dhol Tasha",
    category: "Performance",
    icon: "🥁",
    description: "Responsible for Dhol Tasha performances and coordination.",
  },
  {
    id: "fun-games",
    name: "Fun Games",
    category: "Activities",
    icon: "🎯",
    description: "Responsible for fun games and interactive activities.",
  },
  {
    id: "fashion-walk",
    name: "Fashion Walk",
    category: "Fashion",
    icon: "👗",
    description: "Responsible for fashion walk activities.",
  },
  {
    id: "decoration",
    name: "Decoration",
    category: "Creative",
    icon: "🎨",
    description: "Responsible for decoration and visual setup.",
  },
  {
    id: "social-media",
    name: "Social Media",
    category: "Media",
    icon: "📱",
    description: "Responsible for UTOPIA social media presence and promotion.",
  },
  {
    id: "event-management",
    name: "Event Management",
    category: "Management",
    icon: "⚡",
    description: "Responsible for coordination and execution of events.",
  },
  {
    id: "finance",
    name: "Finance",
    category: "Management",
    icon: "💰",
    description: "Responsible for financial coordination and budget management.",
  },
  {
    id: "documentation",
    name: "Documentation",
    category: "Media",
    icon: "📝",
    description: "Responsible for event documentation and records.",
  },
  {
    id: "food",
    name: "Food Committee",
    category: "Operations",
    icon: "🍴",
    description: "Responsible for food and refreshments arrangements.",
  },
  {
    id: "question-answer",
    name: "Question Answer",
    category: "Activities",
    icon: "❓",
    description: "Responsible for quiz and question-answer activities.",
  },
  {
    id: "transport",
    name: "Transport",
    category: "Operations",
    icon: "🚌",
    description: "Responsible for transportation coordination.",
  },
  {
    id: "discipline",
    name: "Discipline",
    category: "Operations",
    icon: "🛡️",
    description: "Responsible for discipline and event safety coordination.",
  },
  {
    id: "stage-management",
    name: "Stage Management",
    category: "Production",
    icon: "🎬",
    description: "Responsible for stage setup and stage operations.",
  },
  {
    id: "felicitation",
    name: "Felicitation",
    category: "Ceremony",
    icon: "🏆",
    description: "Responsible for felicitation and award ceremony coordination.",
  },
];

const initialPositions = [
  { name: "Participation", order: 1 },
  { name: "Head / Co-Head", order: 2 },
  { name: "Member / Volunteer", order: 3 },
];

async function seed() {
  console.log("Seeding cultural database...");

  // Seed committees
  for (const c of initialCommittees) {
    await prisma.culturalCommittee.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        category: c.category,
        icon: c.icon,
        description: c.description,
        isActive: true,
      },
      create: {
        id: c.id,
        name: c.name,
        category: c.category,
        icon: c.icon,
        description: c.description,
        isActive: true,
      },
    });
  }
  console.log(`Seeded ${initialCommittees.length} committees.`);

  // Seed positions
  for (const p of initialPositions) {
    await prisma.culturalPosition.upsert({
      where: { name: p.name },
      update: {
        order: p.order,
        isActive: true,
      },
      create: {
        name: p.name,
        order: p.order,
        isActive: true,
      },
    });
  }
  console.log(`Seeded ${initialPositions.length} positions.`);

  // Seed admin user
  const adminUsername = process.env.CULTURAL_ADMIN_USERNAME || "cultural_admin";
  const adminPassword = process.env.CULTURAL_ADMIN_PASSWORD || "UtopiaCultural@2026";
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(adminPassword, salt);

  await prisma.culturalAdminUser.upsert({
    where: { username: adminUsername },
    update: {
      passwordHash,
      role: "CULTURAL_ADMIN",
      name: "Cultural Administrator",
    },
    create: {
      username: adminUsername,
      passwordHash,
      role: "CULTURAL_ADMIN",
      name: "Cultural Administrator",
    },
  });
  console.log(`Seeded Cultural Admin user: ${adminUsername}`);

  console.log("Cultural database seeding completed successfully!");
}

seed()
  .catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
