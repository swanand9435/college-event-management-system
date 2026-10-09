require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const app = express();

// ============================================================
// MIDDLEWARE & CONFIG
// ============================================================
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "famt_arena_cultural_utopia_secret_jwt_key_2026_ratnagiri";

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Centralized Departments & Years
const ALLOWED_DEPARTMENTS = [
  "Information Technology",
  "CSE-AIML",
  "CSE-CYSE",
  "Mechanical",
  "Electrical",
  "Chemical",
  "Electronics & Telecommunication",
  "MCA",
];

const ALLOWED_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

// ============================================================
// SIMPLE IN-MEMORY RATE LIMITING FOR LOGIN / REGISTRATION
// ============================================================
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

// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================
function requireCulturalAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Cultural Admin token required",
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "CULTURAL_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Cultural Administrator privileges required",
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

// ============================================================
// 1. PUBLIC ENDPOINTS
// ============================================================

// GET /api/cultural/health
app.get("/api/cultural/health", (req, res) => {
  res.json({
    status: "healthy",
    module: "Cultural (UTOPIA)",
    database: "famt_arena_cultural",
    timestamp: new Date().toISOString(),
  });
});

// GET /api/cultural/committees - List active committees
app.get("/api/cultural/committees", async (req, res, next) => {
  try {
    const committees = await prisma.culturalCommittee.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        category: true,
        icon: true,
        description: true,
        isActive: true,
      },
    });
    res.json({ success: true, data: committees });
  } catch (err) {
    next(err);
  }
});

// GET /api/cultural/committees/:id - Committee details
app.get("/api/cultural/committees/:id", async (req, res, next) => {
  try {
    const committee = await prisma.culturalCommittee.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        category: true,
        icon: true,
        description: true,
        isActive: true,
      },
    });

    if (!committee) {
      return res.status(404).json({
        success: false,
        message: `Cultural committee '${req.params.id}' not found`,
      });
    }

    res.json({ success: true, data: committee });
  } catch (err) {
    next(err);
  }
});

// GET /api/cultural/positions - Dynamic active positions for student form
app.get("/api/cultural/positions", async (req, res, next) => {
  try {
    const positions = await prisma.culturalPosition.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
      },
    });
    res.json({ success: true, data: positions });
  } catch (err) {
    next(err);
  }
});

// GET /api/cultural/options - Centralized metadata (departments, years, positions)
app.get("/api/cultural/options", async (req, res, next) => {
  try {
    const positions = await prisma.culturalPosition.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    });

    res.json({
      success: true,
      data: {
        departments: ALLOWED_DEPARTMENTS,
        studentYears: ALLOWED_YEARS,
        positions: positions.map((p) => p.name),
        positionObjects: positions,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/cultural/registrations - Student Registration
app.post(
  "/api/cultural/registrations",
  rateLimiter(20, 60 * 1000), // 20 requests per minute max
  async (req, res, next) => {
    try {
      const {
        fullName,
        department,
        studentYear,
        committeeId,
        position,
        contactNumber,
        email,
      } = req.body;

      // 1. Mandatory field checks
      if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Full Name is required",
        });
      }
      if (!department || !ALLOWED_DEPARTMENTS.includes(department.trim())) {
        return res.status(400).json({
          success: false,
          message: `Valid Department is required. Allowed: ${ALLOWED_DEPARTMENTS.join(", ")}`,
        });
      }
      if (!studentYear || !ALLOWED_YEARS.includes(studentYear.trim())) {
        return res.status(400).json({
          success: false,
          message: `Valid Student Year is required. Allowed: ${ALLOWED_YEARS.join(", ")}`,
        });
      }
      if (!committeeId || typeof committeeId !== "string" || !committeeId.trim()) {
        return res.status(400).json({
          success: false,
          message: "Committee is required",
        });
      }
      if (!position || typeof position !== "string" || !position.trim()) {
        return res.status(400).json({
          success: false,
          message: "Position is required",
        });
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

      const cleanName = fullName.trim();
      const cleanDept = department.trim();
      const cleanYear = studentYear.trim();
      const cleanPhone = contactNumber.replace(/[\s-]/g, "").trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanCommitteeId = committeeId.trim();
      const cleanPosition = position.trim();

      // 2. Verify Committee exists & is active
      const committee = await prisma.culturalCommittee.findUnique({
        where: { id: cleanCommitteeId },
      });
      if (!committee || !committee.isActive) {
        return res.status(400).json({
          success: false,
          message: "Selected cultural committee does not exist or is inactive",
        });
      }

      // 3. Verify Position exists in active positions
      const matchedPosition = await prisma.culturalPosition.findFirst({
        where: {
          name: { equals: cleanPosition, mode: "insensitive" },
          isActive: true,
        },
      });

      // 4. Duplicate Submission Prevention
      // Check if this student (by email or phone) already registered for THIS committee
      const existingRegistration = await prisma.culturalRegistration.findFirst({
        where: {
          committeeId: cleanCommitteeId,
          OR: [{ email: cleanEmail }, { contactNumber: cleanPhone }],
          status: { in: ["PENDING", "APPROVED"] },
        },
      });

      if (existingRegistration) {
        return res.status(409).json({
          success: false,
          message: `A registration for committee '${committee.name}' with this email or mobile number already exists (Status: ${existingRegistration.status}).`,
        });
      }

      // 5. Create Registration
      const registration = await prisma.culturalRegistration.create({
        data: {
          fullName: cleanName,
          department: cleanDept,
          studentYear: cleanYear,
          committeeId: cleanCommitteeId,
          positionId: matchedPosition ? matchedPosition.id : null,
          positionName: matchedPosition ? matchedPosition.name : cleanPosition,
          contactNumber: cleanPhone,
          email: cleanEmail,
          status: "PENDING",
        },
        include: {
          committee: {
            select: { name: true, category: true },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: "Registration submitted successfully!",
        data: {
          id: registration.id,
          fullName: registration.fullName,
          committeeName: registration.committee.name,
          position: registration.positionName,
          department: registration.department,
          studentYear: registration.studentYear,
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

// POST /api/cultural/admin/login
app.post(
  "/api/cultural/admin/login",
  rateLimiter(10, 60 * 1000), // Max 10 login attempts per minute
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
      }

      const adminUser = await prisma.culturalAdminUser.findUnique({
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
        message: "Cultural Admin authenticated successfully",
        token,
        user: {
          username: adminUser.username,
          name: adminUser.name || "Cultural Administrator",
          role: adminUser.role,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/cultural/admin/verify - Session check
app.get("/api/cultural/admin/verify", requireCulturalAdmin, (req, res) => {
  res.json({
    success: true,
    message: "Cultural Admin session valid",
    user: req.admin,
  });
});

// ============================================================
// 3. ADMIN DASHBOARD & STATISTICS
// ============================================================

// GET /api/cultural/admin/dashboard - Complete counts calculated from DB
app.get(
  "/api/cultural/admin/dashboard",
  requireCulturalAdmin,
  async (req, res, next) => {
    try {
      const [
        totalRegistrations,
        totalCommittees,
        pendingCount,
        approvedCount,
        rejectedCount,
        allRegistrations,
        allCommittees,
      ] = await Promise.all([
        prisma.culturalRegistration.count(),
        prisma.culturalCommittee.count({ where: { isActive: true } }),
        prisma.culturalRegistration.count({ where: { status: "PENDING" } }),
        prisma.culturalRegistration.count({ where: { status: "APPROVED" } }),
        prisma.culturalRegistration.count({ where: { status: "REJECTED" } }),
        prisma.culturalRegistration.findMany({
          select: {
            committeeId: true,
            department: true,
            positionName: true,
            status: true,
            committee: { select: { name: true } },
          },
        }),
        prisma.culturalCommittee.findMany({
          where: { isActive: true },
          select: { id: true, name: true, category: true },
        }),
      ]);

      // Group by Committee
      const byCommitteeMap = {};
      allCommittees.forEach((c) => {
        byCommitteeMap[c.name] = { id: c.id, name: c.name, count: 0 };
      });
      allRegistrations.forEach((r) => {
        const cName = r.committee?.name || r.committeeId;
        if (!byCommitteeMap[cName]) {
          byCommitteeMap[cName] = { id: r.committeeId, name: cName, count: 0 };
        }
        byCommitteeMap[cName].count++;
      });
      const byCommittee = Object.values(byCommitteeMap);

      // Group by Department
      const byDeptMap = {};
      ALLOWED_DEPARTMENTS.forEach((d) => (byDeptMap[d] = 0));
      allRegistrations.forEach((r) => {
        byDeptMap[r.department] = (byDeptMap[r.department] || 0) + 1;
      });
      const byDepartment = Object.entries(byDeptMap).map(([department, count]) => ({
        department,
        count,
      }));

      // Group by Position
      const byPosMap = {};
      allRegistrations.forEach((r) => {
        byPosMap[r.positionName] = (byPosMap[r.positionName] || 0) + 1;
      });
      const byPosition = Object.entries(byPosMap).map(([position, count]) => ({
        position,
        count,
      }));

      res.json({
        success: true,
        data: {
          totalRegistrations,
          totalCommittees,
          pendingCount,
          approvedCount,
          rejectedCount,
          byCommittee,
          byDepartment,
          byPosition,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// 4. ADMIN REGISTRATIONS MANAGEMENT
// ============================================================

// GET /api/cultural/admin/registrations - Search, filter, list
app.get(
  "/api/cultural/admin/registrations",
  requireCulturalAdmin,
  async (req, res, next) => {
    try {
      const {
        search,
        committeeId,
        department,
        studentYear,
        position,
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const where = {};

      if (committeeId && committeeId !== "ALL") {
        where.committeeId = committeeId;
      }
      if (department && department !== "ALL") {
        where.department = department;
      }
      if (studentYear && studentYear !== "ALL") {
        where.studentYear = studentYear;
      }
      if (position && position !== "ALL") {
        where.positionName = position;
      }
      if (status && status !== "ALL") {
        where.status = status;
      }

      if (search && search.trim()) {
        const query = search.trim();
        where.OR = [
          { fullName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { contactNumber: { contains: query } },
        ];
      }

      const orderBy = {};
      orderBy[sortBy] = sortOrder.toLowerCase() === "asc" ? "asc" : "desc";

      const registrations = await prisma.culturalRegistration.findMany({
        where,
        orderBy,
        include: {
          committee: {
            select: { id: true, name: true, category: true },
          },
        },
      });

      res.json({
        success: true,
        count: registrations.length,
        data: registrations,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/cultural/admin/registrations/:id - Single registration details
app.get(
  "/api/cultural/admin/registrations/:id",
  requireCulturalAdmin,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      const registration = await prisma.culturalRegistration.findUnique({
        where: { id },
        include: {
          committee: true,
          position: true,
        },
      });

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: "Registration not found",
        });
      }

      res.json({ success: true, data: registration });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/cultural/admin/registrations - Admin manual creation
app.post(
  "/api/cultural/admin/registrations",
  requireCulturalAdmin,
  async (req, res, next) => {
    try {
      const {
        fullName,
        department,
        studentYear,
        committeeId,
        position,
        contactNumber,
        email,
        status = "PENDING",
        notes,
      } = req.body;

      if (!fullName || !department || !studentYear || !committeeId || !position || !contactNumber || !email) {
        return res.status(400).json({
          success: false,
          message: "All required fields must be provided",
        });
      }

      const matchedPosition = await prisma.culturalPosition.findFirst({
        where: { name: { equals: position.trim(), mode: "insensitive" } },
      });

      const newRegistration = await prisma.culturalRegistration.create({
        data: {
          fullName: fullName.trim(),
          department: department.trim(),
          studentYear: studentYear.trim(),
          committeeId: committeeId.trim(),
          positionId: matchedPosition ? matchedPosition.id : null,
          positionName: matchedPosition ? matchedPosition.name : position.trim(),
          contactNumber: contactNumber.replace(/[\s-]/g, "").trim(),
          email: email.trim().toLowerCase(),
          status: status || "PENDING",
          notes: notes ? notes.trim() : null,
        },
        include: {
          committee: true,
        },
      });

      res.status(201).json({
        success: true,
        message: "Registration created successfully",
        data: newRegistration,
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/cultural/admin/registrations/:id - Edit registration details
app.put(
  "/api/cultural/admin/registrations/:id",
  requireCulturalAdmin,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      const {
        fullName,
        department,
        studentYear,
        committeeId,
        position,
        contactNumber,
        email,
        status,
        notes,
      } = req.body;

      // Validation
      if (!fullName || !fullName.trim()) {
        return res.status(400).json({ success: false, message: "Full Name is required" });
      }
      if (!department || !ALLOWED_DEPARTMENTS.includes(department.trim())) {
        return res.status(400).json({
          success: false,
          message: `Valid Department required. Allowed: ${ALLOWED_DEPARTMENTS.join(", ")}`,
        });
      }
      if (!studentYear || !ALLOWED_YEARS.includes(studentYear.trim())) {
        return res.status(400).json({
          success: false,
          message: `Valid Student Year required. Allowed: ${ALLOWED_YEARS.join(", ")}`,
        });
      }
      if (!contactNumber || !/^\d{10}$/.test(contactNumber.replace(/[\s-]/g, ""))) {
        return res.status(400).json({ success: false, message: "Valid 10-digit contact number required" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: "Valid email address required" });
      }

      // Check committee
      if (committeeId) {
        const comm = await prisma.culturalCommittee.findUnique({
          where: { id: committeeId.trim() },
        });
        if (!comm) {
          return res.status(400).json({ success: false, message: "Committee does not exist" });
        }
      }

      let positionId = null;
      let positionName = position ? position.trim() : "";
      if (position) {
        const matchedPosition = await prisma.culturalPosition.findFirst({
          where: { name: { equals: position.trim(), mode: "insensitive" } },
        });
        if (matchedPosition) {
          positionId = matchedPosition.id;
          positionName = matchedPosition.name;
        }
      }

      const updateData = {
        fullName: fullName.trim(),
        department: department.trim(),
        studentYear: studentYear.trim(),
        contactNumber: contactNumber.replace(/[\s-]/g, "").trim(),
        email: email.trim().toLowerCase(),
        positionName,
        positionId,
      };

      if (committeeId) updateData.committeeId = committeeId.trim();
      if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
        updateData.status = status;
      }
      if (notes !== undefined) {
        updateData.notes = notes ? notes.trim() : null;
      }

      const updated = await prisma.culturalRegistration.update({
        where: { id },
        data: updateData,
        include: {
          committee: true,
        },
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

// PATCH /api/cultural/admin/registrations/:id/position - Change individual student position
app.patch(
  "/api/cultural/admin/registrations/:id/position",
  requireCulturalAdmin,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      const { position } = req.body;
      if (!position || !position.trim()) {
        return res.status(400).json({
          success: false,
          message: "New position label is required",
        });
      }

      const cleanPos = position.trim();
      const matchedPosition = await prisma.culturalPosition.findFirst({
        where: { name: { equals: cleanPos, mode: "insensitive" } },
      });

      const updated = await prisma.culturalRegistration.update({
        where: { id },
        data: {
          positionName: matchedPosition ? matchedPosition.name : cleanPos,
          positionId: matchedPosition ? matchedPosition.id : null,
        },
        include: {
          committee: true,
        },
      });

      res.json({
        success: true,
        message: `Position updated to '${updated.positionName}'`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/cultural/admin/registrations/:id/status - Approve / Reject / Pending
app.patch(
  "/api/cultural/admin/registrations/:id/status",
  requireCulturalAdmin,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      const { status } = req.body;
      if (!status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be PENDING, APPROVED, or REJECTED",
        });
      }

      const updated = await prisma.culturalRegistration.update({
        where: { id },
        data: { status },
        include: {
          committee: true,
        },
      });

      res.json({
        success: true,
        message: `Registration status updated to ${status}`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/cultural/admin/registrations/:id - Delete with safety
app.delete(
  "/api/cultural/admin/registrations/:id",
  requireCulturalAdmin,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      const existing = await prisma.culturalRegistration.findUnique({
        where: { id },
        include: { committee: { select: { name: true } } },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Registration not found",
        });
      }

      await prisma.culturalRegistration.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: `Registration #${id} for '${existing.fullName}' (${existing.committee?.name}) was deleted successfully.`,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// 5. ADMIN POSITION OPTIONS MANAGEMENT
// ============================================================

// GET /api/cultural/admin/positions - View all positions (active & inactive)
app.get(
  "/api/cultural/admin/positions",
  requireCulturalAdmin,
  async (req, res, next) => {
    try {
      const positions = await prisma.culturalPosition.findMany({
        orderBy: { order: "asc" },
        include: {
          _count: {
            select: { registrations: true },
          },
        },
      });

      const formatted = positions.map((p) => ({
        id: p.id,
        name: p.name,
        isActive: p.isActive,
        order: p.order,
        registrationCount: p._count.registrations,
        createdAt: p.createdAt,
      }));

      res.json({ success: true, data: formatted });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/cultural/admin/positions - Add a new position
app.post(
  "/api/cultural/admin/positions",
  requireCulturalAdmin,
  async (req, res, next) => {
    try {
      const { name, isActive = true } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Position name is required",
        });
      }

      const cleanName = name.trim();
      const existing = await prisma.culturalPosition.findUnique({
        where: { name: cleanName },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Position '${cleanName}' already exists`,
        });
      }

      const maxOrder = await prisma.culturalPosition.aggregate({
        _max: { order: true },
      });
      const nextOrder = (maxOrder._max.order || 0) + 1;

      const newPos = await prisma.culturalPosition.create({
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

// PUT /api/cultural/admin/positions/:id - Edit position label or active toggle
app.put(
  "/api/cultural/admin/positions/:id",
  requireCulturalAdmin,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      const { name, isActive, order } = req.body;
      const existing = await prisma.culturalPosition.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: "Position not found" });
      }

      const updateData = {};
      if (name && name.trim()) {
        updateData.name = name.trim();
      }
      if (isActive !== undefined) {
        updateData.isActive = Boolean(isActive);
      }
      if (order !== undefined) {
        updateData.order = parseInt(order, 10);
      }

      const updated = await prisma.culturalPosition.update({
        where: { id },
        data: updateData,
      });

      // If position name changed, optionally sync with registrations referencing it
      if (name && name.trim() && name.trim() !== existing.name) {
        await prisma.culturalRegistration.updateMany({
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

// DELETE /api/cultural/admin/positions/:id - Safe removal or deactivation
app.delete(
  "/api/cultural/admin/positions/:id",
  requireCulturalAdmin,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      const position = await prisma.culturalPosition.findUnique({
        where: { id },
        include: { _count: { select: { registrations: true } } },
      });

      if (!position) {
        return res.status(404).json({ success: false, message: "Position not found" });
      }

      // Safe check: If registrations exist using this position, deactivate instead of delete
      if (position._count.registrations > 0) {
        const deactivated = await prisma.culturalPosition.update({
          where: { id },
          data: { isActive: false },
        });

        return res.json({
          success: true,
          message: `Position '${position.name}' has ${position._count.registrations} existing registration(s). It has been safely deactivated so historical records remain intact.`,
          action: "deactivated",
          data: deactivated,
        });
      }

      // If no registrations, safe to delete
      await prisma.culturalPosition.delete({ where: { id } });

      res.json({
        success: true,
        message: `Position '${position.name}' was permanently removed.`,
        action: "deleted",
      });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// 6. CSV EXPORT
// ============================================================

// GET /api/cultural/admin/export - CSV Export
app.get(
  "/api/cultural/admin/export",
  requireCulturalAdmin,
  async (req, res, next) => {
    try {
      const { search, committeeId, department, studentYear, position, status } =
        req.query;

      const where = {};
      if (committeeId && committeeId !== "ALL") where.committeeId = committeeId;
      if (department && department !== "ALL") where.department = department;
      if (studentYear && studentYear !== "ALL") where.studentYear = studentYear;
      if (position && position !== "ALL") where.positionName = position;
      if (status && status !== "ALL") where.status = status;

      if (search && search.trim()) {
        const query = search.trim();
        where.OR = [
          { fullName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { contactNumber: { contains: query } },
        ];
      }

      const registrations = await prisma.culturalRegistration.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          committee: { select: { name: true } },
        },
      });

      // Build CSV
      const headers = [
        "Registration ID",
        "Student Name",
        "Department",
        "Student Year",
        "Committee",
        "Position",
        "Contact Number",
        "Email Address",
        "Status",
        "Registration Date",
      ];

      const escapeCsvCell = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const rows = registrations.map((r) => [
        escapeCsvCell(r.id),
        escapeCsvCell(r.fullName),
        escapeCsvCell(r.department),
        escapeCsvCell(r.studentYear),
        escapeCsvCell(r.committee ? r.committee.name : r.committeeId),
        escapeCsvCell(r.positionName),
        escapeCsvCell(r.contactNumber),
        escapeCsvCell(r.email),
        escapeCsvCell(r.status),
        escapeCsvCell(new Date(r.createdAt).toLocaleString("en-IN")),
      ]);

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join(
        "\r\n"
      );

      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `cultural_registrations_${timestamp}.csv`;

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(csvContent);
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
  console.error("Cultural Backend Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error in Cultural Backend",
  });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`FAMT Arena Cultural Backend (UTOPIA) Running!`);
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log(`Database:   famt_arena_cultural`);
  console.log(`===============================================`);
});
