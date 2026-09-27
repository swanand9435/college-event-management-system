require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

// ============================================================
// DATABASE
// ============================================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

// ============================================================
// BASIC
// ============================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FAMT Arena Backend API",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "FAMT Arena Backend is running",
    });
  } catch (error) {
    console.error("Health error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// ============================================================
// DEPARTMENTS
// ============================================================

app.get("/api/departments", async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        id: "asc",
      },
    });

    res.json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
    });
  }
});

// ============================================================
// SPORTS
// ============================================================

app.get("/api/sports", async (req, res) => {
  try {
    const sports = await prisma.sport.findMany({
      orderBy: {
        id: "asc",
      },
    });

    res.json({
      success: true,
      count: sports.length,
      data: sports,
    });
  } catch (error) {
    console.error("Error fetching sports:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch sports",
    });
  }
});

// ============================================================
// SINGLE SPORT
// ============================================================

app.get("/api/sports/:sportId", async (req, res) => {
  try {
    const sportId = Number(req.params.sportId);

    if (!Number.isInteger(sportId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sport ID",
      });
    }

    const sport = await prisma.sport.findUnique({
      where: {
        id: sportId,
      },
      include: {
        categories: {
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    if (!sport) {
      return res.status(404).json({
        success: false,
        message: "Sport not found",
      });
    }

    res.json({
      success: true,
      data: sport,
    });
  } catch (error) {
    console.error("Error fetching sport:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch sport",
    });
  }
});

// ============================================================
// SPORT CATEGORIES
// ============================================================

app.get("/api/sports/:sportId/categories", async (req, res) => {
  try {
    const sportId = Number(req.params.sportId);

    if (!Number.isInteger(sportId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sport ID",
      });
    }

    const categories = await prisma.sportCategory.findMany({
      where: {
        sportId,
      },
      orderBy: {
        id: "asc",
      },
    });

    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
});

// ============================================================
// SINGLE CATEGORY
// ============================================================

app.get("/api/categories/:categoryId", async (req, res) => {
  try {
    const categoryId = Number(req.params.categoryId);

    if (!Number.isInteger(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category = await prisma.sportCategory.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        sport: true,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error fetching category:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
});

// ============================================================
// PLAYERS
// ============================================================

app.get("/api/players", async (req, res) => {
  try {
    const players = await prisma.player.findMany({
      include: {
        department: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    res.json({
      success: true,
      count: players.length,
      data: players,
    });
  } catch (error) {
    console.error("Error fetching players:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch players",
    });
  }
});

// ============================================================
// SINGLE PLAYER
// ============================================================

app.get("/api/players/:playerId", async (req, res) => {
  try {
    const playerId = Number(req.params.playerId);

    if (!Number.isInteger(playerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid player ID",
      });
    }

    const player = await prisma.player.findUnique({
      where: {
        id: playerId,
      },
      include: {
        department: true,
      },
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        message: "Player not found",
      });
    }

    res.json({
      success: true,
      data: player,
    });
  } catch (error) {
    console.error("Error fetching player:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch player",
    });
  }
});

// ============================================================
// CREATE PLAYER
// ============================================================

app.post("/api/players", async (req, res) => {
  try {
    const {
      name,
      departmentId,
      year,
      mobile,
      email,
    } = req.body;

    if (
      !name ||
      departmentId === undefined ||
      !year ||
      !mobile ||
      !email
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, departmentId, year, mobile and email are required",
      });
    }

    const cleanName = String(name).trim();
    const cleanMobile = String(mobile).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    // Name validation
    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Player name must contain at least 2 characters",
      });
    }

    // Department validation
    const departmentIdNumber = Number(departmentId);

    if (!Number.isInteger(departmentIdNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    const department = await prisma.department.findUnique({
      where: {
        id: departmentIdNumber,
      },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Year validation
    const validYears = [
      "1st Year",
      "2nd Year",
      "3rd Year",
      "4th Year",
    ];

    if (!validYears.includes(year)) {
      return res.status(400).json({
        success: false,
        message: "Invalid year of study",
      });
    }

    // Mobile validation
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message:
          "Mobile number must be a valid 10-digit Indian mobile number",
      });
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // Duplicate mobile
    const existingMobile = await prisma.player.findUnique({
      where: {
        mobile: cleanMobile,
      },
    });

    if (existingMobile) {
      return res.status(409).json({
        success: false,
        message: "Mobile number already registered",
      });
    }

    // Duplicate email
    const existingEmail = await prisma.player.findUnique({
      where: {
        email: cleanEmail,
      },
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create player
    const player = await prisma.player.create({
      data: {
        name: cleanName,
        year,
        mobile: cleanMobile,
        email: cleanEmail,
        departmentId: departmentIdNumber,
      },
      include: {
        department: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Player registered successfully",
      data: player,
    });
  } catch (error) {
    console.error("Error creating player:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Mobile number or email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create player",
    });
  }
});

// ============================================================
// COMPETITION ENTRIES
// ============================================================

app.post("/api/entries", async (req, res) => {
  try {
    const {
      categoryId,
      departmentId,
      name,
      playerIds,
      entryType,
      captainId,
    } = req.body;

    if (
      categoryId === undefined ||
      departmentId === undefined ||
      !name ||
      !Array.isArray(playerIds) ||
      !entryType
    ) {
      return res.status(400).json({
        success: false,
        message:
          "categoryId, departmentId, name, playerIds and entryType are required",
      });
    }

    const categoryIdNumber = Number(categoryId);
    const departmentIdNumber = Number(departmentId);

    if (
      !Number.isInteger(categoryIdNumber) ||
      !Number.isInteger(departmentIdNumber)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid categoryId or departmentId",
      });
    }

    // Validate category
    const category = await prisma.sportCategory.findUnique({
      where: {
        id: categoryIdNumber,
      },
      include: {
        sport: true,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Validate department
    const department = await prisma.department.findUnique({
      where: {
        id: departmentIdNumber,
      },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // Entry type validation
    const validEntryTypes = [
      "SINGLE",
      "PAIR",
      "TEAM",
    ];

    if (!validEntryTypes.includes(entryType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid entry type",
      });
    }

    // Remove duplicate player IDs
    const uniquePlayerIds = [
      ...new Set(playerIds.map((id) => Number(id))),
    ];

    if (
      uniquePlayerIds.some(
        (id) => !Number.isInteger(id)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid player IDs",
      });
    }

    // Entry size validation
    if (
      entryType === "SINGLE" &&
      uniquePlayerIds.length !== 1
    ) {
      return res.status(400).json({
        success: false,
        message: "SINGLE entry requires exactly 1 player",
      });
    }

    if (
      entryType === "PAIR" &&
      uniquePlayerIds.length !== 2
    ) {
      return res.status(400).json({
        success: false,
        message: "PAIR entry requires exactly 2 players",
      });
    }

    if (
      entryType === "TEAM" &&
      uniquePlayerIds.length < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "TEAM entry requires at least 1 player",
      });
    }

    // Fetch players
    const players = await prisma.player.findMany({
      where: {
        id: {
          in: uniquePlayerIds,
        },
      },
    });

    if (players.length !== uniquePlayerIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more players were not found",
      });
    }

    // Check player departments
    const wrongDepartmentPlayer = players.find(
      (player) =>
        player.departmentId !== departmentIdNumber
    );

    if (wrongDepartmentPlayer) {
      return res.status(400).json({
        success: false,
        message:
          "All players must belong to the selected department",
      });
    }

    // TEAM: one department entry
    if (entryType === "TEAM") {
      const existingTeamEntry =
        await prisma.competitionEntry.findFirst({
          where: {
            categoryId: categoryIdNumber,
            departmentId: departmentIdNumber,
            entryType: "TEAM",
          },
        });

      if (existingTeamEntry) {
        return res.status(409).json({
          success: false,
          message:
            "This department already has a team registered for this category",
        });
      }
    }

    // Player cannot appear twice in same category
    const existingPlayerEntry =
      await prisma.entryPlayer.findFirst({
        where: {
          playerId: {
            in: uniquePlayerIds,
          },
          entry: {
            categoryId: categoryIdNumber,
          },
        },
      });

    if (existingPlayerEntry) {
      return res.status(409).json({
        success: false,
        message:
          "One or more players are already registered in this category",
      });
    }

    // Captain validation
    let finalCaptainId = null;

    if (
      captainId !== undefined &&
      captainId !== null
    ) {
      const captainNumber = Number(captainId);

      if (!uniquePlayerIds.includes(captainNumber)) {
        return res.status(400).json({
          success: false,
          message:
            "Captain must be one of the registered players",
        });
      }

      finalCaptainId = captainNumber;
    } else {
      finalCaptainId = uniquePlayerIds[0];
    }

    // Create entry
    const entry = await prisma.competitionEntry.create({
      data: {
        categoryId: categoryIdNumber,
        departmentId: departmentIdNumber,
        name: String(name).trim(),
        entryType,
        captainId: finalCaptainId,

        players: {
          create: uniquePlayerIds.map((playerId) => ({
            playerId,
          })),
        },
      },

      include: {
        category: {
          include: {
            sport: true,
          },
        },
        department: true,
        captain: true,
        players: {
          include: {
            player: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Competition entry created successfully",
      data: entry,
    });
  } catch (error) {
    console.error("Error creating competition entry:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create competition entry",
    });
  }
});

// ============================================================
// CATEGORY ENTRIES
// ============================================================

app.get(
  "/api/categories/:categoryId/entries",
  async (req, res) => {
    try {
      const categoryId = Number(req.params.categoryId);

      if (!Number.isInteger(categoryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      const entries =
        await prisma.competitionEntry.findMany({
          where: {
            categoryId,
          },

          include: {
            department: true,
            captain: true,

            players: {
              include: {
                player: true,
              },
            },

            category: {
              include: {
                sport: true,
              },
            },
          },

          orderBy: {
            id: "asc",
          },
        });

      res.json({
        success: true,
        count: entries.length,
        data: entries,
      });
    } catch (error) {
      console.error("Error fetching entries:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch competition entries",
      });
    }
  }
);

// ============================================================
// SINGLE ENTRY
// ============================================================

app.get("/api/entries/:entryId", async (req, res) => {
  try {
    const entryId = Number(req.params.entryId);

    if (!Number.isInteger(entryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid entry ID",
      });
    }

    const entry =
      await prisma.competitionEntry.findUnique({
        where: {
          id: entryId,
        },

        include: {
          category: {
            include: {
              sport: true,
            },
          },

          department: true,
          captain: true,

          players: {
            include: {
              player: true,
            },
          },
        },
      });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Competition entry not found",
      });
    }

    res.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error("Error fetching entry:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch competition entry",
    });
  }
});

// ============================================================
// MATCHES - ALL
// ============================================================

app.get("/api/matches", async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      include: {
        sport: true,
        category: true,
        round: true,

        entryA: {
          include: {
            department: true,
          },
        },

        entryB: {
          include: {
            department: true,
          },
        },

        winnerEntry: {
          include: {
            department: true,
          },
        },

        score: true,
      },

      orderBy: {
        id: "asc",
      },
    });

    res.json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    console.error("Error fetching matches:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch matches",
    });
  }
});

// ============================================================
// LIVE MATCHES
// ============================================================

app.get("/api/matches/live", async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      where: {
        status: "LIVE",
      },

      include: {
        sport: true,
        category: true,
        round: true,

        entryA: {
          include: {
            department: true,
          },
        },

        entryB: {
          include: {
            department: true,
          },
        },

        score: true,
      },

      orderBy: {
        scheduledAt: "asc",
      },
    });

    res.json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    console.error("Error fetching live matches:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch live matches",
    });
  }
});

// ============================================================
// UPCOMING MATCHES
// ============================================================

app.get("/api/matches/upcoming", async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      where: {
        status: "UPCOMING",
      },

      include: {
        sport: true,
        category: true,
        round: true,

        entryA: {
          include: {
            department: true,
          },
        },

        entryB: {
          include: {
            department: true,
          },
        },

        score: true,
      },

      orderBy: [
        {
          scheduledAt: "asc",
        },
        {
          id: "asc",
        },
      ],
    });

    res.json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    console.error("Error fetching upcoming matches:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming matches",
    });
  }
});

// ============================================================
// SINGLE MATCH
// ============================================================

app.get("/api/matches/:matchId", async (req, res) => {
  try {
    const matchId = Number(req.params.matchId);

    if (!Number.isInteger(matchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid match ID",
      });
    }

    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },

      include: {
        sport: true,
        category: true,
        round: true,

        entryA: {
          include: {
            department: true,

            players: {
              include: {
                player: true,
              },
            },
          },
        },

        entryB: {
          include: {
            department: true,

            players: {
              include: {
                player: true,
              },
            },
          },
        },

        winnerEntry: true,
        score: true,

        previousMatches: {
          include: {
            score: true,
            entryA: true,
            entryB: true,
            winnerEntry: true,
          },
        },

        nextMatch: true,
      },
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    res.json({
      success: true,
      data: match,
    });
  } catch (error) {
    console.error("Error fetching match:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch match",
    });
  }
});

// ============================================================
// UPDATE MATCH
// ============================================================

app.patch("/api/matches/:matchId", async (req, res) => {
  try {
    const matchId = Number(req.params.matchId);

    if (!Number.isInteger(matchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid match ID",
      });
    }

    const existingMatch = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
    });

    if (!existingMatch) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    const {
      scheduledAt,
      registrationEnds,
      venue,
      status,
    } = req.body;

    const data = {};

    // Date/time
    if (scheduledAt !== undefined) {
      if (scheduledAt === null || scheduledAt === "") {
        data.scheduledAt = null;
      } else {
        const date = new Date(scheduledAt);

        if (Number.isNaN(date.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid scheduledAt date",
          });
        }

        data.scheduledAt = date;
      }
    }

    if (registrationEnds !== undefined) {
      if (
        registrationEnds === null ||
        registrationEnds === ""
      ) {
        data.registrationEnds = null;
      } else {
        const date = new Date(registrationEnds);

        if (Number.isNaN(date.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid registrationEnds date",
          });
        }

        data.registrationEnds = date;
      }
    }

    // Venue
    if (venue !== undefined) {
      data.venue =
        venue === null ? null : String(venue).trim();
    }

    // Status
    const validStatuses = [
      "UPCOMING",
      "REGISTRATION_OPEN",
      "REGISTRATION_CLOSED",
      "LIVE",
      "COMPLETED",
      "CANCELLED",
    ];

    if (status !== undefined) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid match status",
        });
      }

      data.status = status;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const match = await prisma.match.update({
      where: {
        id: matchId,
      },

      data,

      include: {
        sport: true,
        category: true,
        round: true,
        entryA: true,
        entryB: true,
        score: true,
      },
    });

    res.json({
      success: true,
      message: "Match updated successfully",
      data: match,
    });
  } catch (error) {
    console.error("Error updating match:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update match",
    });
  }
});

// ============================================================
// START MATCH
// ============================================================

app.post("/api/matches/:matchId/start", async (req, res) => {
  try {
    const matchId = Number(req.params.matchId);

    if (!Number.isInteger(matchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid match ID",
      });
    }

    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },

      include: {
        entryA: true,
        entryB: true,
      },
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    if (!match.entryAId || !match.entryBId) {
      return res.status(400).json({
        success: false,
        message:
          "Match cannot start until both entries are available",
      });
    }

    if (match.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Match is already completed",
      });
    }

    if (match.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cancelled match cannot be started",
      });
    }

    if (match.status === "LIVE") {
      return res.status(400).json({
        success: false,
        message: "Match is already live",
      });
    }

    const updatedMatch = await prisma.match.update({
      where: {
        id: matchId,
      },

      data: {
        status: "LIVE",
      },

      include: {
        sport: true,
        category: true,
        round: true,
        entryA: true,
        entryB: true,
        score: true,
      },
    });

    res.json({
      success: true,
      message: "Match started successfully",
      data: updatedMatch,
    });
  } catch (error) {
    console.error("Error starting match:", error);

    res.status(500).json({
      success: false,
      message: "Failed to start match",
    });
  }
});

// ============================================================
// UPDATE LIVE SCORE
// ============================================================

app.post("/api/matches/:matchId/score", async (req, res) => {
  try {
    const matchId = Number(req.params.matchId);

    if (!Number.isInteger(matchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid match ID",
      });
    }

    const {
      scoreA,
      scoreB,
      detail,
      winnerEntryId,
    } = req.body;

    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },

      include: {
        entryA: true,
        entryB: true,
        score: true,
      },
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    if (
      match.status !== "LIVE" &&
      match.status !== "UPCOMING"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Score can only be updated for a live or upcoming match",
      });
    }

    // Validate winner
    let cleanWinnerId = null;

    if (
      winnerEntryId !== undefined &&
      winnerEntryId !== null
    ) {
      cleanWinnerId = Number(winnerEntryId);

      if (
        cleanWinnerId !== match.entryAId &&
        cleanWinnerId !== match.entryBId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Winner must be one of the match entries",
        });
      }
    }

    // Create/update score
    const score = await prisma.matchScore.upsert({
      where: {
        matchId,
      },

      create: {
        matchId,

        scoreA:
          scoreA !== undefined
            ? String(scoreA)
            : null,

        scoreB:
          scoreB !== undefined
            ? String(scoreB)
            : null,

        detail:
          detail !== undefined
            ? String(detail)
            : null,

        winnerTeam:
          cleanWinnerId !== null
            ? String(cleanWinnerId)
            : null,
      },

      update: {
        ...(scoreA !== undefined && {
          scoreA: String(scoreA),
        }),

        ...(scoreB !== undefined && {
          scoreB: String(scoreB),
        }),

        ...(detail !== undefined && {
          detail: String(detail),
        }),

        ...(cleanWinnerId !== null && {
          winnerTeam: String(cleanWinnerId),
        }),
      },
    });

    res.json({
      success: true,
      message: "Score updated successfully",
      data: score,
    });
  } catch (error) {
    console.error("Error updating score:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update score",
    });
  }
});

// ============================================================
// COMPLETE MATCH
// ============================================================

app.post("/api/matches/:matchId/complete", async (req, res) => {
  try {
    const matchId = Number(req.params.matchId);

    if (!Number.isInteger(matchId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid match ID",
      });
    }

    const {
      winnerEntryId,
      scoreA,
      scoreB,
      detail,
    } = req.body;

    if (winnerEntryId === undefined) {
      return res.status(400).json({
        success: false,
        message: "winnerEntryId is required",
      });
    }

    const winnerId = Number(winnerEntryId);

    if (!Number.isInteger(winnerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid winnerEntryId",
      });
    }

    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },

      include: {
        entryA: true,
        entryB: true,
        score: true,
        nextMatch: true,
      },
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    if (match.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Match is already completed",
      });
    }

    if (match.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cancelled match cannot be completed",
      });
    }

    // Both entries required
    if (!match.entryAId || !match.entryBId) {
      return res.status(400).json({
        success: false,
        message:
          "Both entries must be available before completing the match",
      });
    }

    // Winner validation
    if (
      winnerId !== match.entryAId &&
      winnerId !== match.entryBId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Winner must be one of the match entries",
      });
    }

    // ========================================================
    // TRANSACTION
    // ========================================================

    const result = await prisma.$transaction(
      async (tx) => {
        // Save score
        await tx.matchScore.upsert({
          where: {
            matchId,
          },

          create: {
            matchId,

            scoreA:
              scoreA !== undefined
                ? String(scoreA)
                : null,

            scoreB:
              scoreB !== undefined
                ? String(scoreB)
                : null,

            detail:
              detail !== undefined
                ? String(detail)
                : null,

            winnerTeam: String(winnerId),
          },

          update: {
            ...(scoreA !== undefined && {
              scoreA: String(scoreA),
            }),

            ...(scoreB !== undefined && {
              scoreB: String(scoreB),
            }),

            ...(detail !== undefined && {
              detail: String(detail),
            }),

            winnerTeam: String(winnerId),
          },
        });

        // Complete current match
        const completedMatch =
          await tx.match.update({
            where: {
              id: matchId,
            },

            data: {
              winnerEntryId: winnerId,
              status: "COMPLETED",
            },

            include: {
              sport: true,
              category: true,
              round: true,
              entryA: true,
              entryB: true,
              winnerEntry: true,
              score: true,
            },
          });

        // Advance winner
        let nextMatch = null;

        if (match.nextMatchId) {
          const next =
            await tx.match.findUnique({
              where: {
                id: match.nextMatchId,
              },
            });

          if (!next) {
            throw new Error("Next match not found");
          }

          if (next.entryAId === null) {
            nextMatch =
              await tx.match.update({
                where: {
                  id: next.id,
                },

                data: {
                  entryAId: winnerId,
                },

                include: {
                  entryA: true,
                  entryB: true,
                },
              });
          } else if (next.entryBId === null) {
            nextMatch =
              await tx.match.update({
                where: {
                  id: next.id,
                },

                data: {
                  entryBId: winnerId,
                },

                include: {
                  entryA: true,
                  entryB: true,
                },
              });
          } else {
            throw new Error(
              "Next match already has two entries"
            );
          }
        }

        return {
          completedMatch,
          nextMatch,
        };
      }
    );

    res.json({
      success: true,

      message: match.nextMatchId
        ? "Match completed and winner advanced successfully"
        : "Final match completed successfully",

      data: result,
    });
  } catch (error) {
    console.error("Error completing match:", error);

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to complete match",
    });
  }
});

// ============================================================
// DRAW LOTS
// ============================================================

// ------------------------------------------------------------
// CREATE DRAW
// ------------------------------------------------------------

app.post("/api/draws", async (req, res) => {
  try {
    const {
      categoryId,
      name,
      format,
    } = req.body;

    if (
      categoryId === undefined ||
      !name
    ) {
      return res.status(400).json({
        success: false,
        message:
          "categoryId and name are required",
      });
    }

    const categoryIdNumber = Number(categoryId);

    if (!Number.isInteger(categoryIdNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const category =
      await prisma.sportCategory.findUnique({
        where: {
          id: categoryIdNumber,
        },
      });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const drawFormat =
      format || "KNOCKOUT";

    const validFormats = [
      "KNOCKOUT",
      "ROUND_ROBIN",
      "HEAT",
    ];

    if (!validFormats.includes(drawFormat)) {
      return res.status(400).json({
        success: false,
        message: "Invalid draw format",
      });
    }

    const draw = await prisma.draw.create({
      data: {
        categoryId: categoryIdNumber,
        name: String(name).trim(),
        format: drawFormat,
      },

      include: {
        category: {
          include: {
            sport: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Draw created successfully",
      data: draw,
    });
  } catch (error) {
    console.error("Error creating draw:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create draw",
    });
  }
});

// ------------------------------------------------------------
// GET DRAW
// ------------------------------------------------------------

app.get("/api/draws/:drawId", async (req, res) => {
  try {
    const drawId = Number(req.params.drawId);

    if (!Number.isInteger(drawId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid draw ID",
      });
    }

    const draw = await prisma.draw.findUnique({
      where: {
        id: drawId,
      },

      include: {
        category: {
          include: {
            sport: true,
          },
        },

        slots: {
          include: {
            entry: {
              include: {
                department: true,

                players: {
                  include: {
                    player: true,
                  },
                },
              },
            },
          },

          orderBy: {
            slotNumber: "asc",
          },
        },

        rounds: {
          orderBy: {
            roundNo: "asc",
          },

          include: {
            matches: {
              include: {
                entryA: true,
                entryB: true,
                winnerEntry: true,
                score: true,
              },

              orderBy: {
                id: "asc",
              },
            },
          },
        },
      },
    });

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found",
      });
    }

    res.json({
      success: true,
      data: draw,
    });
  } catch (error) {
    console.error("Error fetching draw:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch draw",
    });
  }
});

// ------------------------------------------------------------
// GENERATE DRAW
// ------------------------------------------------------------

app.post(
  "/api/draws/:drawId/generate",
  async (req, res) => {
    try {
      const drawId = Number(req.params.drawId);

      if (!Number.isInteger(drawId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid draw ID",
        });
      }

      const draw =
        await prisma.draw.findUnique({
          where: {
            id: drawId,
          },

          include: {
            category: true,
          },
        });

      if (!draw) {
        return res.status(404).json({
          success: false,
          message: "Draw not found",
        });
      }

      if (draw.status !== "DRAFT") {
        return res.status(400).json({
          success: false,
          message:
            "Only draft draws can be generated",
        });
      }

      if (draw.format !== "KNOCKOUT") {
        return res.status(400).json({
          success: false,
          message:
            "Currently only KNOCKOUT draws are supported",
        });
      }

      const entries =
        await prisma.competitionEntry.findMany({
          where: {
            categoryId: draw.categoryId,
          },

          include: {
            department: true,
          },
        });

      if (entries.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            "At least 2 entries are required to generate a draw",
        });
      }

      // ======================================================
      // SHUFFLE
      // ======================================================

      const shuffled = [...entries];

      for (
        let i = shuffled.length - 1;
        i > 0;
        i--
      ) {
        const j = Math.floor(
          Math.random() * (i + 1)
        );

        [
          shuffled[i],
          shuffled[j],
        ] = [
          shuffled[j],
          shuffled[i],
        ];
      }

      // ======================================================
      // NEXT POWER OF TWO
      // ======================================================

      let bracketSize = 1;

      while (
        bracketSize < shuffled.length
      ) {
        bracketSize *= 2;
      }

      // ======================================================
      // CREATE DRAW
      // ======================================================

      const generatedDraw =
        await prisma.$transaction(
          async (tx) => {
            // Delete old generated data
            await tx.match.deleteMany({
              where: {
                round: {
                  drawId,
                },
              },
            });

            await tx.drawRound.deleteMany({
              where: {
                drawId,
              },
            });

            await tx.drawSlot.deleteMany({
              where: {
                drawId,
              },
            });

            // Create slots
            const slots = [];

            for (
              let i = 0;
              i < bracketSize;
              i++
            ) {
              const entry = shuffled[i];

              slots.push(
                await tx.drawSlot.create({
                  data: {
                    drawId,

                    entryId:
                      entry?.id || null,

                    slotNumber: i + 1,

                    isBye: !entry,
                  },
                })
              );
            }

            // Number of rounds
            const totalRounds =
              Math.log2(bracketSize);

            const roundNames = [];

            if (totalRounds === 1) {
              roundNames.push("Final");
            } else if (totalRounds === 2) {
              roundNames.push(
                "Semi Final",
                "Final"
              );
            } else if (totalRounds === 3) {
              roundNames.push(
                "Quarter Final",
                "Semi Final",
                "Final"
              );
            } else {
              for (
                let i = 0;
                i < totalRounds;
                i++
              ) {
                const matches =
                  bracketSize /
                  Math.pow(
                    2,
                    i + 1
                  );

                if (matches === 1) {
                  roundNames.push("Final");
                } else if (matches === 2) {
                  roundNames.push("Semi Final");
                } else if (matches === 4) {
                  roundNames.push("Quarter Final");
                } else {
                  roundNames.push(
                    `Round ${i + 1}`
                  );
                }
              }
            }

            const rounds = [];

            // Create rounds
            for (
              let i = 0;
              i < totalRounds;
              i++
            ) {
              const round =
                await tx.drawRound.create({
                  data: {
                    drawId,

                    roundNo: i + 1,

                    name:
                      roundNames[i] ||
                      `Round ${i + 1}`,
                  },
                });

              rounds.push(round);
            }

            // First round matches
            const firstRoundMatches = [];

            for (
              let i = 0;
              i < bracketSize;
              i += 2
            ) {
              const slotA = slots[i];
              const slotB = slots[i + 1];

              const isBye =
                !slotA.entryId ||
                !slotB.entryId;

              const winner =
                isBye
                  ? slotA.entryId ||
                    slotB.entryId
                  : null;

              const match =
                await tx.match.create({
                  data: {
                    sportId:
                      draw.category.sportId,

                    categoryId:
                      draw.categoryId,

                    roundId:
                      rounds[0].id,

                    matchNumber:
                      `R1-M${i / 2 + 1}`,

                    entryAId:
                      slotA.entryId,

                    entryBId:
                      slotB.entryId,

                    isBye,

                    status: isBye
                      ? "COMPLETED"
                      : "UPCOMING",

                    winnerEntryId:
                      winner,
                  },
                });

              firstRoundMatches.push(match);
            }

            // Later round matches
            let previousRoundMatches =
              firstRoundMatches;

            for (
              let roundIndex = 1;
              roundIndex < totalRounds;
              roundIndex++
            ) {
              const currentRoundMatches = [];

              for (
                let i = 0;
                i < previousRoundMatches.length;
                i += 2
              ) {
                const match =
                  await tx.match.create({
                    data: {
                      sportId:
                        draw.category.sportId,

                      categoryId:
                        draw.categoryId,

                      roundId:
                        rounds[roundIndex].id,

                      matchNumber:
                        `R${roundIndex + 1}-M${i / 2 + 1}`,

                      status: "UPCOMING",
                    },
                  });

                currentRoundMatches.push(match);

                // Link previous match
                await tx.match.update({
                  where: {
                    id:
                      previousRoundMatches[i].id,
                  },

                  data: {
                    nextMatchId: match.id,
                  },
                });

                // Link second previous match
                if (
                  previousRoundMatches[i + 1]
                ) {
                  await tx.match.update({
                    where: {
                      id:
                        previousRoundMatches[
                          i + 1
                        ].id,
                    },

                    data: {
                      nextMatchId: match.id,
                    },
                  });
                }
              }

              previousRoundMatches =
                currentRoundMatches;
            }

            // Update draw
            return await tx.draw.update({
              where: {
                id: drawId,
              },

              data: {
                status: "GENERATED",
                generatedAt: new Date(),
              },

              include: {
                category: true,

                slots: {
                  orderBy: {
                    slotNumber: "asc",
                  },
                },

                rounds: {
                  orderBy: {
                    roundNo: "asc",
                  },

                  include: {
                    matches: true,
                  },
                },
              },
            });
          }
        );

      res.json({
        success: true,
        message: "Draw generated successfully",
        data: generatedDraw,
      });
    } catch (error) {
      console.error(
        "Error generating draw:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to generate draw",
      });
    }
  }
);

// ------------------------------------------------------------
// LOCK DRAW
// ------------------------------------------------------------

app.post(
  "/api/draws/:drawId/lock",
  async (req, res) => {
    try {
      const drawId =
        Number(req.params.drawId);

      if (!Number.isInteger(drawId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid draw ID",
        });
      }

      const draw =
        await prisma.draw.findUnique({
          where: {
            id: drawId,
          },
        });

      if (!draw) {
        return res.status(404).json({
          success: false,
          message: "Draw not found",
        });
      }

      if (draw.status !== "GENERATED") {
        return res.status(400).json({
          success: false,
          message:
            "Only generated draws can be locked",
        });
      }

      const lockedDraw =
        await prisma.draw.update({
          where: {
            id: drawId,
          },

          data: {
            status: "LOCKED",
            lockedAt: new Date(),
          },
        });

      res.json({
        success: true,
        message:
          "Draw locked successfully",
        data: lockedDraw,
      });
    } catch (error) {
      console.error(
        "Error locking draw:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to lock draw",
      });
    }
  }
);

// ============================================================
// ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ============================================================
// SERVER
// ============================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `FAMT Arena Backend running on http://localhost:${PORT}`
  );
});