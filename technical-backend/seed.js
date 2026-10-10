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

const majorEvents = [
  {
    id: "stabilia",
    name: "Stabilia",
    tagline: "Self-Balancing Robot Challenge",
    category: "Robotics & Automation",
    icon: "🤖",
    description:
      "The flagship robotics engineering arena testing autonomous control, PID tuning, and dynamic stability performance.",
    order: 1,
  },
  {
    id: "brainbyte",
    name: "BrainByte",
    tagline: "Premier Tech Quiz & Coding Challenge",
    category: "Technical & Computing",
    icon: "🧠",
    description:
      "A high-stakes battle of intelligence, programming fundamentals, algorithmic problem solving, and technological aptitude.",
    order: 2,
  },
  {
    id: "kalakruti",
    name: "Kalakruti",
    tagline: "Creative, Design & Digital Arts Fest",
    category: "Art, Media & Creative",
    icon: "🎨",
    description:
      "A vibrant celebration of artistic innovation, visual media, handcrafted design, photography, and digital storytelling.",
    order: 3,
  },
];

const kalakrutiCompetitions = [
  {
    id: "reel-short-making",
    name: "Reel & Short Making",
    icon: "🎬",
    description: "Create compelling short-form video reels showcasing innovation and creativity.",
    order: 1,
  },
  {
    id: "dslr-photography",
    name: "DSLR Photography Competition",
    icon: "📷",
    description: "Capture breathtaking frames, lighting, and perspectives through professional lenses.",
    order: 2,
  },
  {
    id: "origami-knitting-quilling",
    name: "Origami / Knitting / Quilling",
    icon: "🧶",
    description: "Intricate paper folding, textile crafting, and quilling artwork.",
    order: 3,
  },
  {
    id: "cup-mug-painting",
    name: "Cup & Mug Painting",
    icon: "☕",
    description: "Hand-painted ceramic artwork with vibrant colors and themes.",
    order: 4,
  },
  {
    id: "rangoli",
    name: "Rangoli (Kalakruti)",
    icon: "🌸",
    description: "Traditional and modern floor art expressing cultural aesthetics.",
    order: 5,
  },
  {
    id: "poster-making",
    name: "Poster Making",
    icon: "📜",
    description: "Design visual awareness and thematic posters with creative impact.",
    order: 6,
  },
  {
    id: "mehendi",
    name: "Mehendi Competition",
    icon: "✋",
    description: "Artistic henna patterns, symmetry, and traditional and modern design finesse.",
    order: 7,
  },
  {
    id: "painting",
    name: "Painting (Kalakruti)",
    icon: "🎨",
    description: "Express your imagination on canvas with acrylic, watercolor, or oil media.",
    order: 8,
  },
  {
    id: "best-out-of-waste",
    name: "Best Out of Waste",
    icon: "♻️",
    description: "Transform recycled materials into innovative, functional or decorative artifacts.",
    order: 9,
  },
  {
    id: "pot-painting",
    name: "Pot Painting",
    icon: "🏺",
    description: "Earthen pot decoration blending ethnic folk art with contemporary flair.",
    order: 10,
  },
  {
    id: "mobile-photography",
    name: "Mobile Photography",
    icon: "📱",
    description: "Street, macro, and portrait photography captured using smartphones.",
    order: 11,
  },
  {
    id: "sketching",
    name: "Sketching Competition",
    icon: "✏️",
    description: "Graphite and charcoal illustrations emphasizing shading, realism, and depth.",
    order: 12,
  },
];

const initialPositions = [
  { name: "Participant", order: 1 },
  { name: "Head / Co-Head", order: 2 },
];

async function seed() {
  console.log("Seeding Technical Database (famt_arena_technical)...");

  // Seed Major Events
  for (const ev of majorEvents) {
    await prisma.majorEvent.upsert({
      where: { id: ev.id },
      update: {
        name: ev.name,
        tagline: ev.tagline,
        category: ev.category,
        icon: ev.icon,
        description: ev.description,
        order: ev.order,
        isRegistrationOpen: true,
        isActive: true,
      },
      create: {
        id: ev.id,
        name: ev.name,
        tagline: ev.tagline,
        category: ev.category,
        icon: ev.icon,
        description: ev.description,
        order: ev.order,
        isRegistrationOpen: true,
        isActive: true,
      },
    });
  }
  console.log(`Seeded ${majorEvents.length} major technical events.`);

  // Seed Kalakruti Competitions
  for (const comp of kalakrutiCompetitions) {
    await prisma.competition.upsert({
      where: { id: comp.id },
      update: {
        majorEventId: "kalakruti",
        name: comp.name,
        icon: comp.icon,
        description: comp.description,
        order: comp.order,
        isRegistrationOpen: true,
        isActive: true,
      },
      create: {
        id: comp.id,
        majorEventId: "kalakruti",
        name: comp.name,
        icon: comp.icon,
        description: comp.description,
        order: comp.order,
        isRegistrationOpen: true,
        isActive: true,
      },
    });
  }
  console.log(`Seeded ${kalakrutiCompetitions.length} Kalakruti competitions.`);

  // Seed Positions
  for (const pos of initialPositions) {
    await prisma.technicalPosition.upsert({
      where: { name: pos.name },
      update: {
        order: pos.order,
        isActive: true,
      },
      create: {
        name: pos.name,
        order: pos.order,
        isActive: true,
      },
    });
  }
  console.log(`Seeded ${initialPositions.length} initial dynamic positions.`);

  // Seed Admin User
  const adminUsername = process.env.TECHNICAL_ADMIN_USERNAME || "tech_admin";
  const adminPassword = process.env.TECHNICAL_ADMIN_PASSWORD || "FamtTechArena@2026";
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(adminPassword, salt);

  await prisma.technicalAdminUser.upsert({
    where: { username: adminUsername },
    update: {
      passwordHash,
      name: "Technical Administrator",
      role: "TECHNICAL_ADMIN",
    },
    create: {
      username: adminUsername,
      passwordHash,
      name: "Technical Administrator",
      role: "TECHNICAL_ADMIN",
    },
  });
  console.log(`Seeded Technical Admin user: ${adminUsername}`);

  console.log("Technical Database seeding completed successfully!");
}

seed()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
