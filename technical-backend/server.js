require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5002;
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "famt_arena_technical_jwt_secret_key_2026_ratnagiri";

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Standard Departments (FAMT + General / School / Not Applicable)
const STANDARD_DEPARTMENTS = [
  "Information Technology",
  "CSE-AIML",
  "CSE-CYSE",
  "Mechanical",
  "Electrical",
  "Chemical",
  "Electronics & Telecommunication",
  "MCA",
  "Other / School / Junior College",
  "General / Not Applicable",
];

const STANDARD_YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "11th Standard",
  "12th Standard",
  "School (8th - 10th)",
  "Other",
];

// In-Memory Rate Limiter
const rateLimitMap = new Map();
function rateLimiter(limitCount, windowMs) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || "global";
    const now = Date.now();
    const clientData = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > clientData.resetTime) {
      clientData.count = 0;
      clientData.resetTime = now + windowMs;
    }

    clientData.count++;
    rateLimitMap.set(ip, clientData);

    if (clientData.count > limitCount) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
      });
    }
    next();
  };
}

// Technical Admin Authentication Middleware
function requireTechnicalAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Technical Admin authentication token required",
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "TECHNICAL_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Technical Administrator privileges required",
      });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
}

// Generate Unique Registration Code (e.g. STAB-26-0001-123)
async function generateRegistrationCode(majorEventId) {
  const count = await prisma.technicalRegistration.count();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const codeNum = String(count + 1).padStart(4, "0");
  let prefix = "TECH";
  if (majorEventId === "stabilia") prefix = "STAB";
  else if (majorEventId === "brainbyte") prefix = "BB";
  else if (majorEventId === "kalakruti") prefix = "KALA";
  return `${prefix}-26-${codeNum}-${randomSuffix}`;
}

// ============================================================
// 1. PUBLIC ENDPOINTS
// ============================================================

// GET /api/technical/health
app.get("/api/technical/health", (req, res) => {
  res.json({
    status: "healthy",
    module: "Technical Module (FAMT Arena)",
    database: "famt_arena_technical",
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/technical/events - List the 3 major events with competitions
app.get("/api/technical/events", async (req, res, next) => {
  try {
    const events = await prisma.majorEvent.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        competitions: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
      },
    });
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
});

// GET /api/technical/events/:id - Get specific major event
app.get("/api/technical/events/:id", async (req, res, next) => {
  try {
    const event = await prisma.majorEvent.findUnique({
      where: { id: req.params.id },
      include: {
        competitions: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Technical event '${req.params.id}' not found`,
      });
    }

    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
});

// GET /api/technical/competitions/:id - Get specific competition
app.get("/api/technical/competitions/:id", async (req, res, next) => {
  try {
    const comp = await prisma.competition.findUnique({
      where: { id: req.params.id },
      include: {
        majorEvent: true,
      },
    });

    if (!comp) {
      return res.status(404).json({
        success: false,
        message: `Competition '${req.params.id}' not found`,
      });
    }

    res.json({ success: true, data: comp });
  } catch (err) {
    next(err);
  }
});

// GET /api/technical/positions - Dynamic active positions for student form
app.get("/api/technical/positions", async (req, res, next) => {
  try {
    const positions = await prisma.technicalPosition.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    });
    res.json({ success: true, data: positions });
  } catch (err) {
    next(err);
  }
});

// GET /api/technical/options - Metadata for dropdowns
app.get("/api/technical/options", async (req, res, next) => {
  try {
    const positions = await prisma.technicalPosition.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    });

    res.json({
      success: true,
      data: {
        departments: STANDARD_DEPARTMENTS,
        studentYears: STANDARD_YEARS,
        positions: positions.map((p) => p.name),
        positionObjects: positions,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/technical/registrations - Student Registration
app.post(
  "/api/technical/registrations",
  rateLimiter(25, 60 * 1000), // Max 25 per min
  async (req, res, next) => {
    try {
      const fullName = req.body.fullName;
      const institution = req.body.institution || req.body.collegeName;
      const yearStandard = req.body.yearStandard || req.body.studentYear;
      const department = req.body.department;
      const contactNumber = req.body.contactNumber;
      const email = req.body.email;
      const position = req.body.position;
      const majorEventId = req.body.majorEventId || req.body.majorEventSlug;
      const competitionId = req.body.competitionId || req.body.competitionSlug || null;

      // Mandatory field validations
      if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
        return res.status(400).json({ success: false, message: "Full Name is required" });
      }
      if (!institution || typeof institution !== "string" || !institution.trim()) {
        return res.status(400).json({
          success: false,
          message: "School / College Name is required",
        });
      }
      if (!yearStandard || typeof yearStandard !== "string" || !yearStandard.trim()) {
        return res.status(400).json({
          success: false,
          message: "Year / Standard is required",
        });
      }
      if (!department || typeof department !== "string" || !department.trim()) {
        return res.status(400).json({ success: false, message: "Department is required" });
      }
      if (!contactNumber || !/^\d{10}$/.test(contactNumber.replace(/[\s-]/g, ""))) {
        return res.status(400).json({
          success: false,
          message: "A valid 10-digit Contact Number is required",
        });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: "A valid Email Address is required",
        });
      }
      if (!position || typeof position !== "string" || !position.trim()) {
        return res.status(400).json({ success: false, message: "Position is required" });
      }
      if (!majorEventId || typeof majorEventId !== "string" || !majorEventId.trim()) {
        return res.status(400).json({ success: false, message: "Major Event ID is required" });
      }

      const cleanName = fullName.trim();
      const cleanInst = institution.trim();
      const cleanYear = yearStandard.trim();
      const cleanDept = department.trim();
      const cleanPhone = contactNumber.replace(/[\s-]/g, "").trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanPos = position.trim();
      const cleanMajorEventId = majorEventId.trim().toLowerCase();
      let cleanCompId = competitionId ? competitionId.trim() : null;

      // Verify Major Event
      const majorEvent = await prisma.majorEvent.findUnique({
        where: { id: cleanMajorEventId },
      });
      if (!majorEvent || !majorEvent.isActive) {
        return res.status(400).json({
          success: false,
          message: "Selected technical event does not exist or is inactive",
        });
      }
      if (!majorEvent.isRegistrationOpen) {
        return res.status(400).json({
          success: false,
          message: `Registration for ${majorEvent.name} is currently closed.`,
        });
      }

      // Verify Competition if Kalakruti
      let competition = null;
      if (cleanMajorEventId === "kalakruti") {
        if (!cleanCompId) {
          return res.status(400).json({
            success: false,
            message: "A specific Kalakruti competition must be selected",
          });
        }
        // Match competition by ID or slug variations (e.g. rangoli vs rangoli-kalakruti)
        competition = await prisma.competition.findFirst({
          where: {
            majorEventId: "kalakruti",
            OR: [
              { id: cleanCompId },
              { id: cleanCompId.replace(/-kalakruti|-competition/g, "") },
              { name: { equals: cleanCompId, mode: "insensitive" } },
            ],
          },
        });
        if (!competition || !competition.isActive) {
          return res.status(400).json({
            success: false,
            message: "Selected Kalakruti competition is invalid or inactive",
          });
        }
        cleanCompId = competition.id;
        if (!competition.isRegistrationOpen) {
          return res.status(400).json({
            success: false,
            message: `Registration for ${competition.name} is currently closed.`,
          });
        }
      }

      // Verify Position
      const matchedPos = await prisma.technicalPosition.findFirst({
        where: {
          name: { equals: cleanPos, mode: "insensitive" },
          isActive: true,
        },
      });

      // Prevent Duplicate Submission
      const existingFilter = {
        majorEventId: cleanMajorEventId,
        competitionId: cleanCompId,
        OR: [{ email: cleanEmail }, { contactNumber: cleanPhone }],
        status: { in: ["PENDING", "APPROVED", "CONFIRMED"] },
      };

      const existingReg = await prisma.technicalRegistration.findFirst({
        where: existingFilter,
      });

      if (existingReg) {
        const targetTitle = competition ? competition.name : majorEvent.name;
        return res.status(409).json({
          success: false,
          message: `A registration for '${targetTitle}' with this email or mobile number already exists (Status: ${existingReg.status}, Code: ${existingReg.registrationCode}).`,
        });
      }

      // Generate Registration Code
      const registrationCode = await generateRegistrationCode(cleanMajorEventId);

      // Create Registration
      const registration = await prisma.technicalRegistration.create({
        data: {
          registrationCode,
          fullName: cleanName,
          institution: cleanInst,
          yearStandard: cleanYear,
          department: cleanDept,
          contactNumber: cleanPhone,
          email: cleanEmail,
          majorEventId: cleanMajorEventId,
          competitionId: cleanCompId,
          positionId: matchedPos ? matchedPos.id : null,
          positionName: matchedPos ? matchedPos.name : cleanPos,
          status: "PENDING",
        },
        include: {
          majorEvent: true,
          competition: true,
        },
      });

      res.status(201).json({
        success: true,
        message: "Registration submitted successfully!",
        registrationId: registration.registrationCode,
        registrationCode: registration.registrationCode,
        data: {
          id: registration.id,
          registrationId: registration.registrationCode,
          registrationCode: registration.registrationCode,
          fullName: registration.fullName,
          eventName: registration.majorEvent.name,
          competitionName: registration.competition ? registration.competition.name : null,
          position: registration.positionName,
          institution: registration.institution,
          collegeName: registration.institution,
          yearStandard: registration.yearStandard,
          studentYear: registration.yearStandard,
          department: registration.department,
          status: registration.status,
          createdAt: registration.createdAt,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// 2. ADMIN AUTHENTICATION
// ============================================================

// POST /api/technical/admin/login
app.post(
  "/api/technical/admin/login",
  rateLimiter(10, 60 * 1000),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
      }

      const adminUser = await prisma.technicalAdminUser.findUnique({
        where: { username: username.trim() },
      });

      if (!adminUser) {
        return res.status(401).json({
          success: false,
          message: "Invalid administrator credentials",
        });
      }

      const isMatch = bcrypt.compareSync(password, adminUser.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid administrator credentials",
        });
      }

      const token = jwt.sign(
        {
          id: adminUser.id,
          username: adminUser.username,
          role: adminUser.role,
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        message: "Technical Admin authenticated successfully",
        token,
        user: {
          username: adminUser.username,
          name: adminUser.name || "Technical Administrator",
          role: adminUser.role,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/technical/admin/verify
app.get("/api/technical/admin/verify", requireTechnicalAdmin, (req, res) => {
  res.json({
    success: true,
    message: "Technical Admin session valid",
    user: req.admin,
  });
});

// ============================================================
// 3. ADMIN DASHBOARD & STATISTICS
// ============================================================

// GET /api/technical/admin/dashboard
app.get(
  "/api/technical/admin/dashboard",
  requireTechnicalAdmin,
  async (req, res, next) => {
    try {
      const [
        totalRegistrations,
        pendingCount,
        approvedCount,
        rejectedCount,
        allRegistrations,
        majorEvents,
        competitions,
      ] = await Promise.all([
        prisma.technicalRegistration.count(),
        prisma.technicalRegistration.count({ where: { status: "PENDING" } }),
        prisma.technicalRegistration.count({ where: { status: "APPROVED" } }),
        prisma.technicalRegistration.count({ where: { status: "REJECTED" } }),
        prisma.technicalRegistration.findMany({
          select: {
            majorEventId: true,
            competitionId: true,
            positionName: true,
            department: true,
            status: true,
          },
        }),
        prisma.majorEvent.findMany({ select: { id: true, name: true } }),
        prisma.competition.findMany({ select: { id: true, name: true } }),
      ]);

      // By Major Event
      const byMajorEventMap = {};
      majorEvents.forEach((ev) => {
        byMajorEventMap[ev.id] = { id: ev.id, name: ev.name, count: 0 };
      });
      allRegistrations.forEach((r) => {
        if (byMajorEventMap[r.majorEventId]) {
          byMajorEventMap[r.majorEventId].count++;
        }
      });
      const byMajorEvent = Object.values(byMajorEventMap);

      // By Competition
      const byCompMap = {};
      competitions.forEach((c) => {
        byCompMap[c.id] = { id: c.id, name: c.name, count: 0 };
      });
      allRegistrations.forEach((r) => {
        if (r.competitionId && byCompMap[r.competitionId]) {
          byCompMap[r.competitionId].count++;
        }
      });
      const byCompetition = Object.values(byCompMap);

      // By Position
      const byPosMap = {};
      allRegistrations.forEach((r) => {
        byPosMap[r.positionName] = (byPosMap[r.positionName] || 0) + 1;
      });
      const byPosition = Object.entries(byPosMap).map(([position, count]) => ({
        position,
        count,
      }));

      // Recent 10 Registrations
      const recentRegistrations = await prisma.technicalRegistration.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { majorEvent: true, competition: true },
      });

      const mappedRecent = recentRegistrations.map((r) => ({
        ...r,
        registrationId: r.registrationCode,
        collegeName: r.institution,
        studentYear: r.yearStandard,
        position: r.positionName,
      }));

      res.json({
        success: true,
        data: {
          totalRegistrations,
          pendingCount,
          approvedCount,
          rejectedCount,
          byMajorEvent,
          byCompetition,
          byPosition,
          recentRegistrations: mappedRecent,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// 4. REGISTRATION MANAGEMENT
// ============================================================

// GET /api/technical/admin/registrations
app.get(
  "/api/technical/admin/registrations",
  requireTechnicalAdmin,
  async (req, res, next) => {
    try {
      const {
        search,
        majorEventId,
        competitionId,
        department,
        yearStandard,
        position,
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const filterMajor = majorEventId || req.query.majorEvent;
      const filterComp = competitionId || req.query.competition;
      const filterYear = yearStandard || req.query.studentYear;

      const where = {};
      if (filterMajor && filterMajor !== "ALL") {
        where.OR = [
          { majorEventId: filterMajor.toLowerCase() },
          { majorEvent: { name: { equals: filterMajor, mode: "insensitive" } } },
        ];
      }
      if (filterComp && filterComp !== "ALL") where.competitionId = filterComp;
      if (department && department !== "ALL") where.department = department;
      if (filterYear && filterYear !== "ALL") where.yearStandard = filterYear;
      if (position && position !== "ALL") where.positionName = position;
      if (status && status !== "ALL") where.status = status;

      if (search && search.trim()) {
        const query = search.trim();
        const searchConditions = [
          { fullName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { contactNumber: { contains: query } },
          { registrationCode: { contains: query, mode: "insensitive" } },
          { institution: { contains: query, mode: "insensitive" } },
        ];
        if (where.OR) {
          where.AND = [{ OR: where.OR }, { OR: searchConditions }];
          delete where.OR;
        } else {
          where.OR = searchConditions;
        }
      }

      const orderBy = {};
      orderBy[sortBy] = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";

      const registrations = await prisma.technicalRegistration.findMany({
        where,
        orderBy,
        include: {
          majorEvent: true,
          competition: true,
        },
      });

      const mapped = registrations.map((r) => ({
        ...r,
        registrationId: r.registrationCode,
        collegeName: r.institution,
        studentYear: r.yearStandard,
        position: r.positionName,
      }));

      res.json({
        success: true,
        count: mapped.length,
        data: mapped,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/technical/admin/registrations/:id
app.get(
  "/api/technical/admin/registrations/:id",
  requireTechnicalAdmin,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

      const reg = await prisma.technicalRegistration.findUnique({
        where: { id },
        include: { majorEvent: true, competition: true },
      });

      if (!reg) {
        return res.status(404).json({ success: false, message: "Registration not found" });
      }

      res.json({ success: true, data: reg });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/technical/admin/registrations/:id
app.put(
  "/api/technical/admin/registrations/:id",
  requireTechnicalAdmin,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

      const {
        fullName,
        institution,
        yearStandard,
        department,
        contactNumber,
        email,
        position,
        majorEventId,
        competitionId,
        status,
        notes,
      } = req.body;

      if (!fullName || !institution || !yearStandard || !department || !contactNumber || !email) {
        return res.status(400).json({
          success: false,
          message: "All primary student fields are required",
        });
      }

      let positionId = null;
      let positionName = position ? position.trim() : "";
      if (position) {
        const matched = await prisma.technicalPosition.findFirst({
          where: { name: { equals: position.trim(), mode: "insensitive" } },
        });
        if (matched) {
          positionId = matched.id;
          positionName = matched.name;
        }
      }

      const updateData = {
        fullName: fullName.trim(),
        institution: institution.trim(),
        yearStandard: yearStandard.trim(),
        department: department.trim(),
        contactNumber: contactNumber.replace(/[\s-]/g, "").trim(),
        email: email.trim().toLowerCase(),
        positionName,
        positionId,
      };

      if (majorEventId) updateData.majorEventId = majorEventId.trim();
      if (competitionId !== undefined) updateData.competitionId = competitionId ? competitionId.trim() : null;
      if (status && ["PENDING", "APPROVED", "REJECTED", "CONFIRMED", "CANCELLED"].includes(status)) {
        updateData.status = status;
      }
      if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;

      const updated = await prisma.technicalRegistration.update({
        where: { id },
        data: updateData,
        include: { majorEvent: true, competition: true },
      });

      res.json({
        success: true,
        message: "Registration updated successfully",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/technical/admin/registrations/:id/position - Change student position
app.patch(
  "/api/technical/admin/registrations/:id/position",
  requireTechnicalAdmin,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

      const { position } = req.body;
      if (!position || !position.trim()) {
        return res.status(400).json({ success: false, message: "Position label is required" });
      }

      const cleanPos = position.trim();
      const matched = await prisma.technicalPosition.findFirst({
        where: { name: { equals: cleanPos, mode: "insensitive" } },
      });

      const updated = await prisma.technicalRegistration.update({
        where: { id },
        data: {
          positionName: matched ? matched.name : cleanPos,
          positionId: matched ? matched.id : null,
        },
        include: { majorEvent: true, competition: true },
      });

      res.json({
        success: true,
        message: `Position updated to '${updated.positionName}'`,
        data: {
          ...updated,
          position: updated.positionName,
          registrationId: updated.registrationCode,
          collegeName: updated.institution,
          studentYear: updated.yearStandard,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/technical/admin/registrations/:id/status - Approve / Reject / Pending
app.patch(
  "/api/technical/admin/registrations/:id/status",
  requireTechnicalAdmin,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

      const { status } = req.body;
      if (!status || !["PENDING", "APPROVED", "REJECTED", "CONFIRMED", "CANCELLED"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be PENDING, APPROVED, REJECTED, CONFIRMED, or CANCELLED",
        });
      }

      const updated = await prisma.technicalRegistration.update({
        where: { id },
        data: { status },
        include: { majorEvent: true, competition: true },
      });

      res.json({
        success: true,
        message: `Status updated to ${status}`,
        data: {
          ...updated,
          position: updated.positionName,
          registrationId: updated.registrationCode,
          collegeName: updated.institution,
          studentYear: updated.yearStandard,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/technical/admin/registrations/:id
app.delete(
  "/api/technical/admin/registrations/:id",
  requireTechnicalAdmin,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

      const existing = await prisma.technicalRegistration.findUnique({
        where: { id },
        include: { majorEvent: true, competition: true },
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: "Registration not found" });
      }

      await prisma.technicalRegistration.delete({ where: { id } });

      res.json({
        success: true,
        message: `Registration ${existing.registrationCode} for '${existing.fullName}' was deleted successfully.`,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// 5. POSITION OPTIONS MANAGEMENT
// ============================================================

// GET /api/technical/admin/positions
app.get(
  "/api/technical/admin/positions",
  requireTechnicalAdmin,
  async (req, res, next) => {
    try {
      const positions = await prisma.technicalPosition.findMany({
        orderBy: { order: "asc" },
        include: {
          _count: { select: { registrations: true } },
        },
      });

      const data = positions.map((p) => ({
        id: p.id,
        name: p.name,
        isActive: p.isActive,
        order: p.order,
        registrationCount: p._count.registrations,
      }));

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/technical/admin/positions
app.post(
  "/api/technical/admin/positions",
  requireTechnicalAdmin,
  async (req, res, next) => {
    try {
      const { name, isActive = true } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: "Position name is required" });
      }

      const cleanName = name.trim();
      const existing = await prisma.technicalPosition.findUnique({
        where: { name: cleanName },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Position '${cleanName}' already exists`,
        });
      }

      const maxOrder = await prisma.technicalPosition.aggregate({
        _max: { order: true },
      });
      const nextOrder = (maxOrder._max.order || 0) + 1;

      const newPos = await prisma.technicalPosition.create({
        data: {
          name: cleanName,
          isActive: Boolean(isActive),
          order: nextOrder,
        },
      });

      res.status(201).json({
        success: true,
        message: `Position '${cleanName}' added successfully`,
        data: newPos,
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/technical/admin/positions/:id
app.put(
  "/api/technical/admin/positions/:id",
  requireTechnicalAdmin,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

      const { name, isActive, order } = req.body;
      const existing = await prisma.technicalPosition.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: "Position not found" });
      }

      const updateData = {};
      if (name && name.trim()) updateData.name = name.trim();
      if (isActive !== undefined) updateData.isActive = Boolean(isActive);
      if (order !== undefined) updateData.order = parseInt(order, 10);

      const updated = await prisma.technicalPosition.update({
        where: { id },
        data: updateData,
      });

      // Synchronize name update with registrations referencing this position
      if (name && name.trim() && name.trim() !== existing.name) {
        await prisma.technicalRegistration.updateMany({
          where: { positionId: id },
          data: { positionName: name.trim() },
        });
      }

      res.json({
        success: true,
        message: "Position updated successfully",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/technical/admin/positions/:id - Safe removal / deactivation
app.delete(
  "/api/technical/admin/positions/:id",
  requireTechnicalAdmin,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ success: false, message: "Invalid ID" });

      const pos = await prisma.technicalPosition.findUnique({
        where: { id },
        include: { _count: { select: { registrations: true } } },
      });

      if (!pos) {
        return res.status(404).json({ success: false, message: "Position not found" });
      }

      if (pos._count.registrations > 0) {
        const deactivated = await prisma.technicalPosition.update({
          where: { id },
          data: { isActive: false },
        });

        return res.json({
          success: true,
          message: `Position '${pos.name}' has ${pos._count.registrations} existing registration(s). It was safely deactivated so historical records remain intact.`,
          action: "deactivated",
          data: deactivated,
        });
      }

      await prisma.technicalPosition.delete({ where: { id } });
      res.json({
        success: true,
        message: `Position '${pos.name}' was permanently removed.`,
        action: "deleted",
      });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// 6. EVENT & COMPETITION MANAGEMENT (Toggle open/close, edit)
// ============================================================

// GET /api/technical/admin/events
app.get(
  "/api/technical/admin/events",
  requireTechnicalAdmin,
  async (req, res, next) => {
    try {
      const events = await prisma.majorEvent.findMany({
        orderBy: { order: "asc" },
        include: {
          competitions: { orderBy: { order: "asc" } },
          _count: { select: { registrations: true } },
        },
      });

      res.json({ success: true, data: events });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/technical/admin/events/:id/toggle-registration
app.patch(
  "/api/technical/admin/events/:id/toggle-registration",
  requireTechnicalAdmin,
  async (req, res, next) => {
    try {
      const ev = await prisma.majorEvent.findUnique({ where: { id: req.params.id } });
      if (!ev) return res.status(404).json({ success: false, message: "Event not found" });

      const updated = await prisma.majorEvent.update({
        where: { id: req.params.id },
        data: { isRegistrationOpen: !ev.isRegistrationOpen },
      });

      res.json({
        success: true,
        message: `Registration for '${updated.name}' is now ${updated.isRegistrationOpen ? "OPEN" : "CLOSED"}.`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/technical/admin/competitions/:id/toggle-registration
app.patch(
  "/api/technical/admin/competitions/:id/toggle-registration",
  requireTechnicalAdmin,
  async (req, res, next) => {
    try {
      const comp = await prisma.competition.findUnique({ where: { id: req.params.id } });
      if (!comp) return res.status(404).json({ success: false, message: "Competition not found" });

      const updated = await prisma.competition.update({
        where: { id: req.params.id },
        data: { isRegistrationOpen: !comp.isRegistrationOpen },
      });

      res.json({
        success: true,
        message: `Registration for '${updated.name}' is now ${updated.isRegistrationOpen ? "OPEN" : "CLOSED"}.`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// 7. CSV EXPORT
// ============================================================

// GET /api/technical/admin/export
app.get(
  "/api/technical/admin/export",
  requireTechnicalAdmin,
  async (req, res, next) => {
    try {
      const {
        search,
        majorEventId,
        competitionId,
        department,
        yearStandard,
        position,
        status,
      } = req.query;

      const where = {};
      if (majorEventId && majorEventId !== "ALL") where.majorEventId = majorEventId;
      if (competitionId && competitionId !== "ALL") where.competitionId = competitionId;
      if (department && department !== "ALL") where.department = department;
      if (yearStandard && yearStandard !== "ALL") where.yearStandard = yearStandard;
      if (position && position !== "ALL") where.positionName = position;
      if (status && status !== "ALL") where.status = status;

      if (search && search.trim()) {
        const query = search.trim();
        where.OR = [
          { fullName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { contactNumber: { contains: query } },
          { registrationCode: { contains: query, mode: "insensitive" } },
          { institution: { contains: query, mode: "insensitive" } },
        ];
      }

      const regs = await prisma.technicalRegistration.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { majorEvent: true, competition: true },
      });

      const headers = [
        "Registration Code",
        "Student Name",
        "School / College",
        "Year / Standard",
        "Department",
        "Major Event",
        "Competition",
        "Position",
        "Contact Number",
        "Email Address",
        "Status",
        "Registration Date",
      ];

      const escapeCell = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = regs.map((r) => [
        escapeCell(r.registrationCode),
        escapeCell(r.fullName),
        escapeCell(r.institution),
        escapeCell(r.yearStandard),
        escapeCell(r.department),
        escapeCell(r.majorEvent ? r.majorEvent.name : r.majorEventId),
        escapeCell(r.competition ? r.competition.name : "N/A"),
        escapeCell(r.positionName),
        escapeCell(r.contactNumber),
        escapeCell(r.email),
        escapeCell(r.status),
        escapeCell(new Date(r.createdAt).toLocaleString("en-IN")),
      ]);

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `technical_registrations_${timestamp}.csv`;

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(csvContent);
    } catch (err) {
      next(err);
    }
  }
);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Technical Backend Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error in Technical Backend",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`FAMT Arena Technical Backend Running!`);
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log(`Database:   famt_arena_technical`);
  console.log(`===============================================`);
});
