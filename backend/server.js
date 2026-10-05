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
// RECALCULATE DEPARTMENT STANDINGS
// CompetitionResult is the source of truth.
// ============================================================
async function recalculateDepartmentStandings(
tx = prisma,
year = "2026-27"
) {
const departments = await tx.department.findMany({
select: {
id: true,
},
});
const results = await tx.competitionResult.findMany({
where: {
year,
},
include: {
entry: {
select: {
departmentId: true,
},
},
},
});
const totals = new Map();
for (const department of departments) {
totals.set(department.id, {
gold: 0,
silver: 0,
bronze: 0,
points: 0,
});
}
for (const result of results) {
const departmentId = result.entry.departmentId;
if (!totals.has(departmentId)) {
totals.set(departmentId, {
gold: 0,
silver: 0,
bronze: 0,
points: 0,
});
}
const standing = totals.get(departmentId);
if (result.medal === "GOLD") {
standing.gold += 1;
}
if (result.medal === "SILVER") {
standing.silver += 1;
}
if (result.medal === "BRONZE") {
standing.bronze += 1;
}
standing.points += Number(
result.pointsAwarded || 0
);
}
for (const [departmentId, standing] of totals) {
await tx.departmentStanding.upsert({
where: {
departmentId,
},
update: {
gold: standing.gold,
silver: standing.silver,
bronze: standing.bronze,
points: standing.points,
},
create: {
departmentId,
gold: standing.gold,
silver: standing.silver,
bronze: standing.bronze,
points: standing.points,
},
});
}
return totals;
}
// ============================================================
// CREATE / REPLACE COMPETITION RESULT
// ============================================================
async function saveCompetitionResult(
tx,
{
categoryId,
entryId,
position,
medal,
pointsAwarded,
year = "2026-27",
}
) {
return tx.competitionResult.upsert({
where: {
categoryId_entryId_year: {
categoryId,
entryId,
year,
},
},
update: {
position,
medal,
pointsAwarded,
updatedAt: new Date(),
},
create: {
categoryId,
entryId,
position,
medal,
pointsAwarded,
year,
},
});
}
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
// POINT TABLE
// ============================================================
app.get("/api/point-table", async (req, res) => {
try {
const standings = await prisma.departmentStanding.findMany({
include: {
department: {
select: {
id: true,
name: true,
code: true,
},
},
},
orderBy: [
{
points: "desc",
},
{
gold: "desc",
},
{
silver: "desc",
},
{
bronze: "desc",
},
],
});
res.json({
success: true,
count: standings.length,
data: standings,
});
} catch (error) {
console.error("Error fetching point table:", error);
res.status(500).json({
success: false,
message: "Failed to fetch point table",
});
}
});
app.post("/api/point-table/initialize", async (req, res) => {
try {
const departments = await prisma.department.findMany();
for (const department of departments) {
await prisma.departmentStanding.upsert({
where: {
departmentId: department.id,
},
update: {},
create: {
departmentId: department.id,
gold: 0,
silver: 0,
bronze: 0,
points: 0,
},
});
}
res.json({
success: true,
message: "Point table initialized successfully",
count: departments.length,
});
} catch (error) {
console.error("Error initializing point table:", error);
res.status(500).json({
success: false,
message: "Failed to initialize point table",
error: error.message,
});
}
});
// ============================================================
// SPORTS
// ============================================================
app.get("/api/sports", async (req, res) => {
try {
const sports = await prisma.sport.findMany({
where: {
isActive: true,
},
include: {
categories: {
where: {
isActive: true,
},
orderBy: {
id: "asc",
},
},
},
orderBy: {
id: "asc",
},
});
const data = sports.map((sport) => ({
...sport,
categories: sport.categories.map((category) => ({
id: category.id,
sportId: category.sportId,
name: category.name,
description: category.description,
format: category.format,
entryType: category.entryType,
registrationStatus: getRegistrationStatus(category),
registrationStartedAt: category.registrationStartedAt,
registrationClosedAt: category.registrationClosedAt,
registrationEnds: category.registrationEnds,
isActive: category.isActive,
})),
}));
res.json({
success: true,
data,
});
} catch (error) {
console.error("Error fetching sports:", error);
res.status(500).json({
success: false,
message: "Failed to fetch sports",
error: error.message,
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
// REGISTRATION STATUS HELPER
// ============================================================
function getRegistrationStatus(category) {
if (!category) {
return "CLOSED";
}
if (category.registrationStatus === "CLOSED") {
return "CLOSED";
}
if (
category.registrationEnds &&
new Date(category.registrationEnds).getTime() <= Date.now()
) {
return "CLOSED";
}
if (category.registrationStatus !== "OPEN") {
return "CLOSED";
}
if (category.registrationEnds) {
const remaining =
new Date(category.registrationEnds).getTime() - Date.now();
if (remaining <= 24 * 60 * 60 * 1000) {
return "CLOSING_SOON";
}
}
return "OPEN";
}
// ============================================================
// CATEGORY REGISTRATION STATUS
// ============================================================
app.get(
"/api/categories/:categoryId/registration",
async (req, res) => {
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
const status = getRegistrationStatus(category);
res.json({
success: true,
data: {
categoryId: category.id,
categoryName: category.name,
sportId: category.sportId,
sportName: category.sport?.name || "",
registrationStatus: status,
registrationEnds: category.registrationEnds,
registrationStartedAt:
category.registrationStartedAt || null,
registrationClosedAt:
category.registrationClosedAt || null,
},
});
} catch (error) {
console.error(
"Error fetching registration status:",
error
);
res.status(500).json({
success: false,
message: "Failed to fetch registration status",
});
}
}
);
// ============================================================
// ALL REGISTRATION CONTROLS - ADMIN
// ============================================================
app.get("/api/registration-controls", async (req, res) => {
try {
const categories = await prisma.sportCategory.findMany({
include: {
sport: true,
},
orderBy: {
id: "asc",
},
});
const data = categories.map((category) => ({
...category,
computedRegistrationStatus:
getRegistrationStatus(category),
}));
res.json({
success: true,
count: data.length,
data,
});
} catch (error) {
console.error(
"Error fetching registration controls:",
error
);
res.status(500).json({
success: false,
message: "Failed to fetch registration controls",
});
}
});
// ============================================================
// OPEN REGISTRATION
// ============================================================
app.post(
"/api/categories/:categoryId/registration/open",
async (req, res) => {
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
});
if (!category) {
return res.status(404).json({
success: false,
message: "Category not found",
});
}
let registrationEnds = null;
if (
req.body.registrationEnds !== undefined &&
req.body.registrationEnds !== null &&
req.body.registrationEnds !== ""
) {
registrationEnds = new Date(
req.body.registrationEnds
);
if (Number.isNaN(registrationEnds.getTime())) {
return res.status(400).json({
success: false,
message: "Invalid registration deadline",
});
}
}
const updatedCategory =
await prisma.sportCategory.update({
where: {
id: categoryId,
},
data: {
registrationStatus: "OPEN",
registrationStartedAt: new Date(),
registrationClosedAt: null,
registrationEnds,
},
include: {
sport: true,
},
});
res.json({
success: true,
message: "Registration opened successfully",
data: {
...updatedCategory,
computedRegistrationStatus:
getRegistrationStatus(updatedCategory),
},
});
} catch (error) {
console.error(
"Error opening registration:",
error
);
res.status(500).json({
success: false,
message: "Failed to open registration",
error: error.message,
});
}
}
);
// ============================================================
// CLOSE REGISTRATION
// ============================================================
app.post(
"/api/categories/:categoryId/registration/close",
async (req, res) => {
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
});
if (!category) {
return res.status(404).json({
success: false,
message: "Category not found",
});
}
const updatedCategory =
await prisma.sportCategory.update({
where: {
id: categoryId,
},
data: {
registrationStatus: "CLOSED",
registrationClosedAt: new Date(),
},
include: {
sport: true,
},
});
res.json({
success: true,
message: "Registration closed successfully",
data: {
...updatedCategory,
computedRegistrationStatus:
getRegistrationStatus(updatedCategory),
},
});
} catch (error) {
console.error(
"Error closing registration:",
error
);
res.status(500).json({
success: false,
message: "Failed to close registration",
error: error.message,
});
}
}
);
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
if (cleanName.length < 2) {
return res.status(400).json({
success: false,
message:
"Player name must contain at least 2 characters",
});
}
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
if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
return res.status(400).json({
success: false,
message:
"Mobile number must be a valid 10-digit Indian mobile number",
});
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
return res.status(400).json({
success: false,
message: "Invalid email address",
});
}
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
message:
"Mobile number or email already exists",
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
entryType,
captainId,
playerIds,
players: playerDetails,
} = req.body;
if (
categoryId === undefined ||
departmentId === undefined ||
!name ||
!entryType
) {
return res.status(400).json({
success: false,
message:
"categoryId, departmentId, name and entryType are required",
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
// --------------------------------------------------------
// REGISTRATION CONTROL
// --------------------------------------------------------
const registrationStatus =
getRegistrationStatus(category);
if (registrationStatus === "CLOSED") {
return res.status(403).json({
success: false,
message:
"Registration is currently closed for this category",
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
if (category.entryType !== entryType) {
return res.status(400).json({
success: false,
message:
`This category only accepts ${category.entryType} entries`,
});
}
let registrationPlayers = [];
if (Array.isArray(playerDetails)) {
registrationPlayers = playerDetails;
}
if (
registrationPlayers.length === 0 &&
Array.isArray(playerIds)
) {
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
const existingPlayers =
await prisma.player.findMany({
where: {
id: {
in: uniquePlayerIds,
},
},
});
if (
existingPlayers.length !==
uniquePlayerIds.length
) {
return res.status(400).json({
success: false,
message:
"One or more players were not found",
});
}
registrationPlayers = existingPlayers.map(
(player) => ({
id: player.id,
name: player.name,
year: player.year,
mobile: player.mobile,
email: player.email,
departmentId: player.departmentId,
})
);
}
// --------------------------------------------------------
// ENTRY TYPE VALIDATION
// --------------------------------------------------------
if (entryType === "SINGLE") {
if (registrationPlayers.length !== 1) {
return res.status(400).json({
success: false,
message:
"SINGLE entry requires exactly 1 player",
});
}
}
if (entryType === "PAIR") {
if (registrationPlayers.length !== 2) {
return res.status(400).json({
success: false,
message:
"PAIR entry requires exactly 2 players",
});
}
}
if (entryType === "TEAM") {
if (registrationPlayers.length < 1) {
return res.status(400).json({
success: false,
message:
"TEAM entry requires at least 1 player",
});
}
}
// --------------------------------------------------------
// PLAYER VALIDATION
// --------------------------------------------------------
for (const player of registrationPlayers) {
if (
!player.name ||
!player.year ||
!player.mobile ||
!player.email
) {
return res.status(400).json({
success: false,
message:
"Every player must have name, year, mobile and email",
});
}
if (
player.departmentId !== undefined &&
Number(player.departmentId) !==
departmentIdNumber
) {
return res.status(400).json({
success: false,
message:
"All players must belong to the selected department",
});
}
}
registrationPlayers = registrationPlayers.map(
(player) => ({
...player,
name: String(player.name).trim(),
year: String(player.year).trim(),
mobile: String(player.mobile).trim(),
email: String(player.email)
.trim()
.toLowerCase(),
})
);
const mobiles = registrationPlayers.map(
(player) => player.mobile
);
const emails = registrationPlayers.map(
(player) => player.email
);
if (new Set(mobiles).size !== mobiles.length) {
return res.status(400).json({
success: false,
message:
"The same mobile number cannot be used for multiple players",
});
}
if (new Set(emails).size !== emails.length) {
return res.status(400).json({
success: false,
message:
"The same email cannot be used for multiple players",
});
}
// --------------------------------------------------------
// CREATE ENTRY
// --------------------------------------------------------
const result = await prisma.$transaction(
async (tx) => {
// Re-check registration inside transaction
const currentCategory =
await tx.sportCategory.findUnique({
where: {
id: categoryIdNumber,
},
});
if (!currentCategory) {
throw new Error("CATEGORY_NOT_FOUND");
}
if (
getRegistrationStatus(currentCategory) ===
"CLOSED"
) {
throw new Error("REGISTRATION_CLOSED");
}
const resolvedPlayers = [];
for (const playerData of registrationPlayers) {
let player = await tx.player.findUnique({
where: {
mobile: playerData.mobile,
},
});
if (!player) {
const existingEmail =
await tx.player.findUnique({
where: {
email: playerData.email,
},
});
if (existingEmail) {
if (
existingEmail.departmentId !==
departmentIdNumber
) {
throw new Error(
"PLAYER_EMAIL_DEPARTMENT_MISMATCH"
);
}
player = existingEmail;
}
}
if (!player) {
player = await tx.player.create({
data: {
name: playerData.name,
year: playerData.year,
mobile: playerData.mobile,
email: playerData.email,
departmentId:
departmentIdNumber,
},
});
} else {
if (
player.departmentId !==
departmentIdNumber
) {
throw new Error(
"PLAYER_DEPARTMENT_MISMATCH"
);
}
}
resolvedPlayers.push(player);
}
// ----------------------------------------------------
// TEAM: ONE TEAM PER DEPARTMENT
// ----------------------------------------------------
if (entryType === "TEAM") {
const existingTeamEntry =
await tx.competitionEntry.findFirst({
where: {
categoryId: categoryIdNumber,
departmentId: departmentIdNumber,
entryType: "TEAM",
},
});
if (existingTeamEntry) {
throw new Error(
"TEAM_ALREADY_REGISTERED"
);
}
}
// ----------------------------------------------------
// PREVENT SAME PLAYER FROM REGISTERING TWICE
// ----------------------------------------------------
const existingPlayerEntry =
await tx.entryPlayer.findFirst({
where: {
playerId: {
in: resolvedPlayers.map(
(player) => player.id
),
},
entry: {
categoryId: categoryIdNumber,
},
},
});
if (existingPlayerEntry) {
throw new Error(
"PLAYER_ALREADY_REGISTERED"
);
}
// ----------------------------------------------------
// CAPTAIN
// ----------------------------------------------------
let finalCaptainId =
resolvedPlayers[0].id;
if (
captainId !== undefined &&
captainId !== null
) {
const captainNumber =
Number(captainId);
const captainExists =
resolvedPlayers.some(
(player) =>
player.id === captainNumber
);
if (!captainExists) {
throw new Error(
"CAPTAIN_NOT_REGISTERED"
);
}
finalCaptainId = captainNumber;
}
// ----------------------------------------------------
// CREATE COMPETITION ENTRY
// ----------------------------------------------------
const entry =
await tx.competitionEntry.create({
data: {
categoryId: categoryIdNumber,
departmentId: departmentIdNumber,
name: String(name).trim(),
entryType,
captainId: finalCaptainId,
players: {
create: resolvedPlayers.map(
(player) => ({
playerId: player.id,
})
),
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
return entry;
}
);
res.status(201).json({
success: true,
message:
"Competition entry created successfully",
data: result,
});
} catch (error) {
console.error(
"Error creating competition entry:",
error
);
if (
error.message ===
"REGISTRATION_CLOSED"
) {
return res.status(403).json({
success: false,
message:
"Registration is currently closed for this category",
});
}
if (
error.message ===
"CATEGORY_NOT_FOUND"
) {
return res.status(404).json({
success: false,
message: "Category not found",
});
}
if (
error.message ===
"PLAYER_DEPARTMENT_MISMATCH"
) {
return res.status(400).json({
success: false,
message:
"All players must belong to the selected department",
});
}
if (
error.message ===
"PLAYER_EMAIL_DEPARTMENT_MISMATCH"
) {
return res.status(400).json({
success: false,
message:
"This email is already registered to a player from another department",
});
}
if (
error.message ===
"PLAYER_ALREADY_REGISTERED"
) {
return res.status(409).json({
success: false,
message:
"One or more players are already registered in this category",
});
}
if (
error.message ===
"TEAM_ALREADY_REGISTERED"
) {
return res.status(409).json({
success: false,
message:
"This department already has a team registered for this category",
});
}
if (
error.message ===
"CAPTAIN_NOT_REGISTERED"
) {
return res.status(400).json({
success: false,
message:
"Captain must be one of the registered players",
});
}
res.status(500).json({
success: false,
message:
"Failed to create competition entry",
});
}
});
// ============================================================
// ALL COMPETITION ENTRIES - ADMIN
// ============================================================
app.get("/api/entries", async (req, res) => {
try {
const { categoryId, sportId, departmentId } = req.query;
const where = {};
// --------------------------------------------------------
// OPTIONAL CATEGORY FILTER
// --------------------------------------------------------
if (categoryId !== undefined) {
const categoryIdNumber = Number(categoryId);
if (!Number.isInteger(categoryIdNumber)) {
return res.status(400).json({
success: false,
message: "Invalid category ID",
});
}
where.categoryId = categoryIdNumber;
}
// --------------------------------------------------------
// OPTIONAL SPORT FILTER
// --------------------------------------------------------
if (sportId !== undefined) {
const sportIdNumber = Number(sportId);
if (!Number.isInteger(sportIdNumber)) {
return res.status(400).json({
success: false,
message: "Invalid sport ID",
});
}
where.category = {
sportId: sportIdNumber,
};
}
// --------------------------------------------------------
// OPTIONAL DEPARTMENT FILTER
// --------------------------------------------------------
if (departmentId !== undefined) {
const departmentIdNumber = Number(departmentId);
if (!Number.isInteger(departmentIdNumber)) {
return res.status(400).json({
success: false,
message: "Invalid department ID",
});
}
where.departmentId = departmentIdNumber;
}
const entries =
await prisma.competitionEntry.findMany({
where,
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
console.error(
"Error fetching competition entries:",
error
);
res.status(500).json({
success: false,
message:
"Failed to fetch competition entries",
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
const categoryId =
Number(req.params.categoryId);
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
console.error(
"Error fetching entries:",
error
);
res.status(500).json({
success: false,
message:
"Failed to fetch competition entries",
});
}
}
);
// ============================================================
// SINGLE ENTRY
// ============================================================
app.get("/api/entries/:entryId", async (req, res) => {
try {
const entryId =
Number(req.params.entryId);
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
message:
"Competition entry not found",
});
}
res.json({
success: true,
data: entry,
});
} catch (error) {
console.error(
"Error fetching entry:",
error
);
res.status(500).json({
success: false,
message:
"Failed to fetch competition entry",
});
}
});
// ============================================================
// DELETE COMPETITION ENTRY - ADMIN
// ============================================================
app.delete("/api/entries/:entryId", async (req, res) => {
try {
const entryId = Number(req.params.entryId);
if (!Number.isInteger(entryId)) {
return res.status(400).json({
success: false,
message: "Invalid entry ID",
});
}
const entry = await prisma.competitionEntry.findUnique({
where: {
id: entryId,
},
include: {
drawSlots: true,
matchesAsA: true,
matchesAsB: true,
wins: true,
results: true,
players: true,
},
});
if (!entry) {
return res.status(404).json({
success: false,
message: "Competition entry not found",
});
}
// --------------------------------------------------------
// SAFETY CHECK
// --------------------------------------------------------
// Do not allow deletion if this entry is already being used
// by a generated draw, match, or recorded result.
if (
entry.drawSlots.length > 0 ||
entry.matchesAsA.length > 0 ||
entry.matchesAsB.length > 0 ||
entry.wins.length > 0 ||
entry.results.length > 0
) {
return res.status(409).json({
success: false,
message:
"This entry is already used in a draw, match, or result and cannot be deleted.",
});
}
// --------------------------------------------------------
// DELETE ENTRY PLAYERS FIRST
// --------------------------------------------------------
await prisma.$transaction(async (tx) => {
await tx.entryPlayer.deleteMany({
where: {
entryId,
},
});
await tx.competitionEntry.delete({
where: {
id: entryId,
},
});
});
res.json({
success: true,
message: "Competition entry deleted successfully",
data: {
id: entryId,
name: entry.name,
categoryId: entry.categoryId,
departmentId: entry.departmentId,
},
});
} catch (error) {
console.error(
"Error deleting competition entry:",
error
);
res.status(500).json({
success: false,
message: "Failed to delete competition entry",
});
}
});
// ============================================================
// MATCHES - ALL
// ============================================================
app.get("/api/matches", async (req, res) => {
try {
const matches =
await prisma.match.findMany({
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
console.error(
"Error fetching matches:",
error
);
res.status(500).json({
success: false,
message:
"Failed to fetch matches",
});
}
});
// ============================================================
// LIVE MATCHES
// ============================================================
app.get("/api/matches/live", async (req, res) => {
try {
const matches =
await prisma.match.findMany({
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
console.error(
"Error fetching live matches:",
error
);
res.status(500).json({
success: false,
message:
"Failed to fetch live matches",
});
}
});
// ============================================================
// UPCOMING MATCHES
// ============================================================
app.get("/api/matches/upcoming", async (req, res) => {
try {
const matches =
await prisma.match.findMany({
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
console.error(
"Error fetching upcoming matches:",
error
);
res.status(500).json({
success: false,
message:
"Failed to fetch upcoming matches",
});
}
});
// ============================================================
// SINGLE MATCH
// ============================================================
app.get("/api/matches/:matchId", async (req, res) => {
try {
const matchId =
Number(req.params.matchId);
if (!Number.isInteger(matchId)) {
return res.status(400).json({
success: false,
message: "Invalid match ID",
});
}
const match =
await prisma.match.findUnique({
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
console.error(
"Error fetching match:",
error
);
res.status(500).json({
success: false,
message:
"Failed to fetch match",
});
}
});
// ============================================================
// CREATE MATCH
// ============================================================
app.post("/api/matches", async (req, res) => {
try {
const {
sportId,
categoryId,
entryAId,
entryBId,
scheduledAt,
venue,
status = "UPCOMING",
} = req.body;
const match =
await prisma.match.create({
data: {
sportId: Number(sportId),
categoryId: Number(categoryId),
entryAId: Number(entryAId),
entryBId: Number(entryBId),
scheduledAt: scheduledAt
? new Date(scheduledAt)
: null,
venue: venue || null,
status,
},
include: {
sport: true,
category: true,
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
},
});
res.status(201).json({
success: true,
message:
"Match created successfully",
data: match,
});
} catch (error) {
console.error(
"Error creating match:",
error
);
res.status(500).json({
success: false,
message:
"Failed to create match",
error: error.message,
});
}
});
// ============================================================
// UPDATE MATCH
// ============================================================
app.patch("/api/matches/:matchId", async (req, res) => {
try {
const matchId =
Number(req.params.matchId);
if (!Number.isInteger(matchId)) {
return res.status(400).json({
success: false,
message: "Invalid match ID",
});
}
const existingMatch =
await prisma.match.findUnique({
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
if (scheduledAt !== undefined) {
if (
scheduledAt === null ||
scheduledAt === ""
) {
data.scheduledAt = null;
} else {
const date = new Date(scheduledAt);
if (Number.isNaN(date.getTime())) {
return res.status(400).json({
success: false,
message:
"Invalid scheduledAt date",
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
const date =
new Date(registrationEnds);
if (Number.isNaN(date.getTime())) {
return res.status(400).json({
success: false,
message:
"Invalid registrationEnds date",
});
}
data.registrationEnds = date;
}
}
if (venue !== undefined) {
data.venue =
venue === null
? null
: String(venue).trim();
}
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
message:
"No valid fields provided for update",
});
}
const match =
await prisma.match.update({
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
message:
"Match updated successfully",
data: match,
});
} catch (error) {
console.error(
"Error updating match:",
error
);
res.status(500).json({
success: false,
message:
"Failed to update match",
});
}
});
// ============================================================
// START MATCH
// ============================================================
app.post(
"/api/matches/:matchId/start",
async (req, res) => {
try {
const matchId =
Number(req.params.matchId);
if (!Number.isInteger(matchId)) {
return res.status(400).json({
success: false,
message: "Invalid match ID",
});
}
const match =
await prisma.match.findUnique({
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
if (
!match.entryAId ||
!match.entryBId
) {
return res.status(400).json({
success: false,
message:
"Match cannot start until both entries are available",
});
}
if (match.status === "COMPLETED") {
return res.status(400).json({
success: false,
message:
"Match is already completed",
});
}
if (match.status === "CANCELLED") {
return res.status(400).json({
success: false,
message:
"Cancelled match cannot be started",
});
}
if (match.status === "LIVE") {
return res.status(400).json({
success: false,
message:
"Match is already live",
});
}
const updatedMatch =
await prisma.match.update({
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
message:
"Match started successfully",
data: updatedMatch,
});
} catch (error) {
console.error(
"Error starting match:",
error
);
res.status(500).json({
success: false,
message:
"Failed to start match",
});
}
}
);
// ============================================================
// UPDATE LIVE SCORE
// ============================================================
app.post(
"/api/matches/:matchId/score",
async (req, res) => {
try {
const matchId =
Number(req.params.matchId);
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
const match =
await prisma.match.findUnique({
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
let cleanWinnerId = null;
if (
winnerEntryId !== undefined &&
winnerEntryId !== null
) {
cleanWinnerId =
Number(winnerEntryId);
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
const score =
await prisma.matchScore.upsert({
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
winnerTeam:
String(cleanWinnerId),
}),
},
});
res.json({
success: true,
message:
"Score updated successfully",
data: score,
});
} catch (error) {
console.error(
"Error updating score:",
error
);
res.status(500).json({
success: false,
message:
"Failed to update score",
});
}
}
);
// ============================================================
// COMPLETE MATCH
// ============================================================
app.post(
"/api/matches/:matchId/complete",
async (req, res) => {
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
// --------------------------------------------------------
// VALIDATE WINNER
// --------------------------------------------------------
if (
winnerEntryId === undefined ||
winnerEntryId === null ||
winnerEntryId === ""
) {
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
// --------------------------------------------------------
// FETCH MATCH
// --------------------------------------------------------
const match = await prisma.match.findUnique({
where: {
id: matchId,
},
include: {
sport: true,
category: {
include: {
sport: true,
},
},
round: {
include: {
draw: true,
},
},
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
winnerEntry: true,
score: true,
nextMatch: true,
previousMatches: true,
},
});
if (!match) {
return res.status(404).json({
success: false,
message: "Match not found",
});
}
// --------------------------------------------------------
// VALIDATE MATCH STATE
// --------------------------------------------------------
if (match.status === "COMPLETED") {
return res.status(400).json({
success: false,
message: "Match is already completed",
});
}
if (match.status === "CANCELLED") {
return res.status(400).json({
success: false,
message:
"Cancelled match cannot be completed",
});
}
if (!match.entryAId || !match.entryBId) {
return res.status(400).json({
success: false,
message:
"Both entries must be available before completing the match",
});
}
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
// --------------------------------------------------------
// LOSER
// --------------------------------------------------------
const loserId =
winnerId === match.entryAId
? match.entryBId
: match.entryAId;
// --------------------------------------------------------
// MATCH TYPE
// --------------------------------------------------------
const isBronzeMatch =
match.matchNumber === "Bronze Match";
const isFinal =
match.round?.name === "Final" &&
!isBronzeMatch;
const isSemiFinal =
match.round?.name === "Semi Final" &&
!isBronzeMatch;
// ========================================================
// TRANSACTION
// ========================================================
const result = await prisma.$transaction(
async (tx) => {
// ----------------------------------------------------
// 1. SAVE SCORE
// ----------------------------------------------------
await tx.matchScore.upsert({
where: {
matchId,
},
create: {
matchId,
scoreA:
scoreA !== undefined &&
scoreA !== null
? String(scoreA)
: null,
scoreB:
scoreB !== undefined &&
scoreB !== null
? String(scoreB)
: null,
detail:
detail !== undefined &&
detail !== null
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
// ----------------------------------------------------
// 2. COMPLETE MATCH
// ----------------------------------------------------
const completedMatch =
await tx.match.update({
where: {
id: matchId,
},
data: {
status: "COMPLETED",
winnerEntryId: winnerId,
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
winnerEntry: {
include: {
department: true,
},
},
score: true,
nextMatch: true,
},
});
// ====================================================
// 3. NORMAL MATCH → NEXT ROUND
// ====================================================
if (
!isSemiFinal &&
!isFinal &&
!isBronzeMatch &&
match.nextMatchId
) {
const nextMatch =
await tx.match.findUnique({
where: {
id: match.nextMatchId,
},
});
if (nextMatch) {
const updateData = {};
if (!nextMatch.entryAId) {
updateData.entryAId = winnerId;
} else if (!nextMatch.entryBId) {
updateData.entryBId = winnerId;
}
if (
Object.keys(updateData).length > 0
) {
await tx.match.update({
where: {
id: nextMatch.id,
},
data: updateData,
});
}
}
}
// ====================================================
// 4. SEMI FINAL
//
// Winner → Final
// Loser → Bronze Match
// ====================================================
if (isSemiFinal) {
// --------------------------------------------------
// WINNER → FINAL
// --------------------------------------------------
if (match.nextMatchId) {
const finalMatch =
await tx.match.findUnique({
where: {
id: match.nextMatchId,
},
});
if (finalMatch) {
const finalUpdate = {};
if (!finalMatch.entryAId) {
finalUpdate.entryAId = winnerId;
} else if (!finalMatch.entryBId) {
finalUpdate.entryBId = winnerId;
}
if (
Object.keys(finalUpdate).length > 0
) {
await tx.match.update({
where: {
id: finalMatch.id,
},
data: finalUpdate,
});
}
}
}
// --------------------------------------------------
// LOSER → BRONZE MATCH
// --------------------------------------------------
const bronzeMatch =
await tx.match.findFirst({
where: {
categoryId: match.categoryId,
matchNumber: "Bronze Match",
},
});
if (bronzeMatch) {
const bronzeUpdate = {};
if (!bronzeMatch.entryAId) {
bronzeUpdate.entryAId = loserId;
} else if (!bronzeMatch.entryBId) {
bronzeUpdate.entryBId = loserId;
}
if (
Object.keys(bronzeUpdate).length > 0
) {
await tx.match.update({
where: {
id: bronzeMatch.id,
},
data: bronzeUpdate,
});
}
}
}
// ============================================================
// 5. GET POINT SCHEME
// ============================================================
const pointScheme =
await tx.pointScheme.findFirst({
where: {
categoryId: match.categoryId,
year: "2026-27",
},
orderBy: {
id: "desc",
},
});
const goldPoints =
Number(pointScheme?.goldPoints || 0);
const silverPoints =
Number(pointScheme?.silverPoints || 0);
const bronzePoints =
Number(pointScheme?.bronzePoints || 0);
// ============================================================
// 6. SAVE COMPETITION RESULTS
//
// CompetitionResult is now the source of truth.
// DepartmentStanding is recalculated afterwards.
// ============================================================
const resultYear = "2026-27";
// ------------------------------------------------------------
// FINAL → GOLD + SILVER
// ------------------------------------------------------------
if (isFinal) {
const winnerEntry =
await tx.competitionEntry.findUnique({
where: {
id: winnerId,
},
select: {
id: true,
departmentId: true,
},
});
const loserEntry =
await tx.competitionEntry.findUnique({
where: {
id: loserId,
},
select: {
id: true,
departmentId: true,
},
});
if (!winnerEntry || !loserEntry) {
throw new Error(
"Unable to find final participants"
);
}
// GOLD
await saveCompetitionResult(tx, {
categoryId: match.categoryId,
entryId: winnerEntry.id,
position: 1,
medal: "GOLD",
pointsAwarded: goldPoints,
year: resultYear,
});
// SILVER
await saveCompetitionResult(tx, {
categoryId: match.categoryId,
entryId: loserEntry.id,
position: 2,
medal: "SILVER",
pointsAwarded: silverPoints,
year: resultYear,
});
}
// ------------------------------------------------------------
// BRONZE MATCH → BRONZE
// ------------------------------------------------------------
if (isBronzeMatch) {
const bronzeEntry =
await tx.competitionEntry.findUnique({
where: {
id: winnerId,
},
select: {
id: true,
departmentId: true,
},
});
if (!bronzeEntry) {
throw new Error(
"Unable to find bronze winner"
);
}
await saveCompetitionResult(tx, {
categoryId: match.categoryId,
entryId: bronzeEntry.id,
position: 3,
medal: "BRONZE",
pointsAwarded: bronzePoints,
year: resultYear,
});
}
// ============================================================
// 7. RECALCULATE DEPARTMENT STANDINGS
// ============================================================
await recalculateDepartmentStandings(
tx,
resultYear
);
return completedMatch;
}
);
// ========================================================
// RESPONSE
// ========================================================
return res.json({
success: true,
message:
"Match completed successfully",
data: {
match: result,
winnerEntryId: winnerId,
loserEntryId: loserId,
result:
isFinal
? "GOLD_SILVER"
: isBronzeMatch
? "BRONZE"
: isSemiFinal
? "SEMIFINAL"
: "NEXT_ROUND",
},
});
} catch (error) {
console.error(
"COMPLETE MATCH ERROR:",
error
);
return res.status(500).json({
success: false,
message:
"Failed to complete match",
error: error.message,
});
}
}
);
// ============================================================
// DRAW HELPERS
// ============================================================
function shuffleArray(array) {
const result = [...array];
for (let i = result.length - 1; i > 0; i--) {
const j = Math.floor(
Math.random() * (i + 1)
);
[result[i], result[j]] = [
result[j],
result[i],
];
}
return result;
}
// ------------------------------------------------------------
// NEXT POWER OF TWO
// ------------------------------------------------------------
function nextPowerOfTwo(number) {
let power = 1;
while (power < number) {
power *= 2;
}
return power;
}
// ------------------------------------------------------------
// ROUND NAME
// ------------------------------------------------------------
function getRoundName(matchCount) {
if (matchCount === 1) {
return "Final";
}
if (matchCount === 2) {
return "Semi Final";
}
if (matchCount === 4) {
return "Quarter Final";
}
if (matchCount === 8) {
return "Round of 16";
}
if (matchCount === 16) {
return "Round of 32";
}
if (matchCount === 32) {
return "Round of 64";
}
return `Round of ${matchCount * 2}`;
}
// ------------------------------------------------------------
// DEPARTMENT-AWARE PAIRING
// ------------------------------------------------------------
function createDepartmentAwarePairs(entries) {
const remaining =
shuffleArray(entries);
const pairs = [];
while (remaining.length >= 2) {
const first =
remaining.shift();
let opponentIndex =
remaining.findIndex(
(entry) =>
entry.departmentId !==
first.departmentId
);
// If no different department exists,
// same department is allowed.
if (opponentIndex === -1) {
opponentIndex = 0;
}
const second =
remaining.splice(
opponentIndex,
1
)[0];
pairs.push([
first,
second,
]);
}
if (remaining.length === 1) {
pairs.push([
remaining[0],
null,
]);
}
return pairs;
}
// ------------------------------------------------------------
// DISTRIBUTE BYES
//
// Instead of putting all empty slots at the end,
// BYEs are distributed through the bracket.
//
// Example:
//
// 60 entries
// 64 bracket slots
// 4 BYEs
//
// Result:
// 30 real first-round matches
// + 4 BYE positions
//
// No unnecessary empty R1 matches.
// ------------------------------------------------------------
function createFirstRoundPairs(entries) {
const shuffled =
shuffleArray(entries);
const bracketSize =
nextPowerOfTwo(
shuffled.length
);
const totalMatches =
bracketSize / 2;
const byeCount =
bracketSize -
shuffled.length;
// ----------------------------------------------------------
// NO BYES
// ----------------------------------------------------------
if (byeCount === 0) {
return createDepartmentAwarePairs(
shuffled
);
}
// ----------------------------------------------------------
// SELECT BYE ENTRIES
// ----------------------------------------------------------
const byeEntries =
shuffled.slice(
0,
byeCount
);
const remaining =
shuffled.slice(
byeCount
);
// ----------------------------------------------------------
// PAIR REMAINING ENTRIES
// ----------------------------------------------------------
const normalPairs =
createDepartmentAwarePairs(
remaining
);
// ----------------------------------------------------------
// CREATE EMPTY POSITIONS
// ----------------------------------------------------------
const pairs =
new Array(totalMatches)
.fill(null);
// ----------------------------------------------------------
// DISTRIBUTE BYE MATCHES
// ----------------------------------------------------------
for (
let i = 0;
i < byeEntries.length;
i++
) {
const position =
Math.floor(
(i * totalMatches) /
byeEntries.length
);
let finalPosition =
position;
while (
pairs[finalPosition] !==
null
) {
finalPosition++;
if (
finalPosition >=
totalMatches
) {
finalPosition = 0;
}
}
pairs[finalPosition] = [
byeEntries[i],
null,
];
}
// ----------------------------------------------------------
// FILL NORMAL MATCHES
// ----------------------------------------------------------
let normalIndex = 0;
for (
let i = 0;
i < totalMatches;
i++
) {
if (
pairs[i] === null &&
normalIndex <
normalPairs.length
) {
pairs[i] =
normalPairs[
normalIndex
];
normalIndex++;
}
}
return pairs;
}
// ============================================================
// DRAW RESPONSE INCLUDE
// ============================================================
const drawInclude = {
category: {
include: {
sport: true,
},
},
slots: {
orderBy: {
slotNumber: "asc",
},
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
},
rounds: {
orderBy: {
roundNo: "asc",
},
include: {
matches: {
orderBy: {
id: "asc",
},
include: {
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
previousMatches: true,
nextMatch: true,
},
},
},
},
};
// ============================================================
// CREATE DRAW
// ============================================================
app.post(
"/api/draws",
async (req, res) => {
try {
const {
categoryId,
name,
format = "KNOCKOUT",
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
const categoryIdNumber =
Number(categoryId);
if (
!Number.isInteger(
categoryIdNumber
)
) {
return res.status(400).json({
success: false,
message:
"Invalid category ID",
});
}
const category =
await prisma.sportCategory.findUnique({
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
message:
"Category not found",
});
}
if (
category.sport?.name?.trim()?.toLowerCase() ===
"athletics"
) {
return res.status(400).json({
success: false,
message:
"Athletics does not use draws. Enter winners directly.",
});
}
const validFormats = [
"KNOCKOUT",
"ROUND_ROBIN",
"HEAT",
];
if (
!validFormats.includes(
format
)
) {
return res.status(400).json({
success: false,
message:
"Invalid draw format",
});
}
// --------------------------------------------------------
// RETURN EXISTING ACTIVE DRAW
// --------------------------------------------------------
const existingDraw =
await prisma.draw.findFirst({
where: {
categoryId:
categoryIdNumber,
status: {
in: [
"DRAFT",
"GENERATED",
"LOCKED",
],
},
},
orderBy: {
id: "desc",
},
});
if (existingDraw) {
const fullDraw =
await prisma.draw.findUnique({
where: {
id: existingDraw.id,
},
include: drawInclude,
});
return res.json({
success: true,
message:
"Existing draw returned",
data: fullDraw,
});
}
// --------------------------------------------------------
// CREATE DRAW
// --------------------------------------------------------
const draw =
await prisma.draw.create({
data: {
categoryId:
categoryIdNumber,
name:
String(name).trim(),
format,
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
message:
"Draw created successfully",
data: draw,
});
} catch (error) {
console.error(
"Error creating draw:",
error
);
res.status(500).json({
success: false,
message:
"Failed to create draw",
error:
error.message,
});
}
}
);
// ============================================================
// GET DRAW
// ============================================================
app.get(
"/api/draws/:drawId",
async (req, res) => {
try {
const drawId =
Number(req.params.drawId);
if (
!Number.isInteger(drawId)
) {
return res.status(400).json({
success: false,
message:
"Invalid draw ID",
});
}
const draw =
await prisma.draw.findUnique({
where: {
id: drawId,
},
include: drawInclude,
});
if (!draw) {
return res.status(404).json({
success: false,
message:
"Draw not found",
});
}
res.json({
success: true,
data: draw,
});
} catch (error) {
console.error(
"Error fetching draw:",
error
);
res.status(500).json({
success: false,
message:
"Failed to fetch draw",
error:
error.message,
});
}
}
);
// ============================================================
// GET LATEST DRAW FOR CATEGORY
// ============================================================
app.get(
"/api/categories/:categoryId/draw",
async (req, res) => {
try {
const categoryId =
Number(
req.params.categoryId
);
if (
!Number.isInteger(
categoryId
)
) {
return res.status(400).json({
success: false,
message:
"Invalid category ID",
});
}
const draw =
await prisma.draw.findFirst({
where: {
categoryId,
},
orderBy: {
id: "desc",
},
include: drawInclude,
});
if (!draw) {
return res.json({
success: true,
data: null,
});
}
res.json({
success: true,
data: draw,
});
} catch (error) {
console.error(
"Error fetching category draw:",
error
);
res.status(500).json({
success: false,
message:
"Failed to fetch category draw",
error:
error.message,
});
}
}
);
// ============================================================
// GENERATE DRAW
// ============================================================
app.post(
"/api/draws/:drawId/generate",
async (req, res) => {
try {
const drawId =
Number(req.params.drawId);
if (
!Number.isInteger(drawId)
) {
return res.status(400).json({
success: false,
message:
"Invalid draw ID",
});
}
const draw =
await prisma.draw.findUnique({
where: {
id: drawId,
},
include: {
category: {
include: {
sport: true,
},
},
},
});
if (!draw) {
return res.status(404).json({
success: false,
message:
"Draw not found",
});
}
if (
draw.status !== "DRAFT"
) {
return res.status(400).json({
success: false,
message:
"Only draft draws can be generated",
});
}
if (
draw.format !== "KNOCKOUT"
) {
return res.status(400).json({
success: false,
message:
"Currently only KNOCKOUT draws are supported",
});
}
// --------------------------------------------------------
// REGISTRATION MUST BE CLOSED
// --------------------------------------------------------
const category =
await prisma.sportCategory.findUnique({
where: {
id: draw.categoryId,
},
});
if (!category) {
return res.status(404).json({
success: false,
message:
"Category not found",
});
}
if (
category.sport?.name?.trim()?.toLowerCase() ===
"athletics"
) {
return res.status(400).json({
success: false,
message:
"Athletics does not use draws. Enter winners directly.",
});
}
if (
getRegistrationStatus(
category
) !== "CLOSED"
) {
return res.status(400).json({
success: false,
message:
"Registration must be closed before generating the draw",
});
}
// --------------------------------------------------------
// GET REGISTERED ENTRIES
// --------------------------------------------------------
const entries =
await prisma.competitionEntry.findMany({
where: {
categoryId:
draw.categoryId,
},
include: {
department: true,
},
orderBy: {
id: "asc",
},
});
if (entries.length < 2) {
return res.status(400).json({
success: false,
message:
"At least 2 entries are required to generate a draw",
});
}
// --------------------------------------------------------
// BRACKET SIZE
// --------------------------------------------------------
const bracketSize =
nextPowerOfTwo(
entries.length
);
const totalRounds =
Math.log2(
bracketSize
);
const firstRoundPairs =
createFirstRoundPairs(
entries
);
// ========================================================
// TRANSACTION
// ========================================================
const generatedDraw =
await prisma.$transaction(
async (tx) => {
// --------------------------------------------------
// DELETE OLD STRUCTURE
// --------------------------------------------------
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
// --------------------------------------------------
// CREATE DRAW SLOTS
// --------------------------------------------------
const slots = [];
let slotNumber = 1;
for (
const pair of
firstRoundPairs
) {
for (
const entry of pair
) {
const slot =
await tx.drawSlot.create({
data: {
drawId,
slotNumber,
entryId:
entry?.id ||
null,
isBye:
!entry,
},
});
slots.push(slot);
slotNumber++;
}
}
// --------------------------------------------------
// CREATE ROUNDS
// --------------------------------------------------
const rounds = [];
for (
let roundIndex = 0;
roundIndex <
totalRounds;
roundIndex++
) {
const matchCount =
bracketSize /
Math.pow(
2,
roundIndex + 1
);
const round =
await tx.drawRound.create({
data: {
drawId,
roundNo:
roundIndex + 1,
name:
getRoundName(
matchCount
),
},
});
rounds.push(round);
}
// --------------------------------------------------
// CREATE ROUND 1
// --------------------------------------------------
const roundMatches =
[];
for (
let i = 0;
i <
firstRoundPairs.length;
i++
) {
const [
entryA,
entryB,
] =
firstRoundPairs[i];
const isBye =
!entryA ||
!entryB;
const byeWinner =
entryA?.id ||
entryB?.id ||
null;
const match =
await tx.match.create({
data: {
sportId:
draw.category
.sportId,
categoryId:
draw.categoryId,
roundId:
rounds[0].id,
matchNumber:
`R1-M${
i + 1
}`,
entryAId:
entryA?.id ||
null,
entryBId:
entryB?.id ||
null,
isBye,
status:
isBye
? "COMPLETED"
: "UPCOMING",
winnerEntryId:
isBye
? byeWinner
: null,
},
});
roundMatches.push(
[match]
);
}
// --------------------------------------------------
// CREATE REMAINING ROUNDS
// --------------------------------------------------
let previousRoundMatches =
roundMatches.map(
(item) => item[0]
);
const allRoundMatches =
[
previousRoundMatches,
];
for (
let roundIndex = 1;
roundIndex <
totalRounds;
roundIndex++
) {
const currentRoundMatches =
[];
for (
let i = 0;
i <
previousRoundMatches.length;
i += 2
) {
const nextMatch =
await tx.match.create({
data: {
sportId:
draw.category
.sportId,
categoryId:
draw.categoryId,
roundId:
rounds[
roundIndex
].id,
matchNumber:
`R${
roundIndex + 1
}-M${
i / 2 + 1
}`,
status:
"UPCOMING",
isBye: false,
},
});
currentRoundMatches.push(
nextMatch
);
// ----------------------------------------------
// LINK MATCH 1
// ----------------------------------------------
await tx.match.update({
where: {
id:
previousRoundMatches[
i
].id,
},
data: {
nextMatchId:
nextMatch.id,
},
});
// ----------------------------------------------
// LINK MATCH 2
// ----------------------------------------------
if (
previousRoundMatches[
i + 1
]
) {
await tx.match.update({
where: {
id:
previousRoundMatches[
i + 1
].id,
},
data: {
nextMatchId:
nextMatch.id,
},
});
}
}
allRoundMatches.push(
currentRoundMatches
);
previousRoundMatches =
currentRoundMatches;
}
// ============================================================
// PROPAGATE TRUE BYES ONLY
// ============================================================
//
// BYE matches are already COMPLETED with a winner.
// Their winners must immediately occupy a slot in the
// next-round match.
//
// IMPORTANT:
// We re-fetch the matches after linking nextMatchId because
// the original Prisma objects do not contain those later updates.
//
for (
let roundIndex = 0;
roundIndex < allRoundMatches.length - 1;
roundIndex++
) {
const currentMatches = allRoundMatches[roundIndex];
for (const originalMatch of currentMatches) {
// Re-fetch the match so nextMatchId is current.
const currentMatch =
await tx.match.findUnique({
where: {
id: originalMatch.id,
},
});
if (
!currentMatch ||
!currentMatch.isBye ||
currentMatch.status !== "COMPLETED" ||
!currentMatch.winnerEntryId ||
!currentMatch.nextMatchId
) {
continue;
}
const nextMatch =
await tx.match.findUnique({
where: {
id: currentMatch.nextMatchId,
},
});
if (!nextMatch) {
continue;
}
const updateData = {};
if (
!nextMatch.entryAId &&
nextMatch.entryBId !== currentMatch.winnerEntryId
) {
updateData.entryAId =
currentMatch.winnerEntryId;
} else if (
!nextMatch.entryBId &&
nextMatch.entryAId !== currentMatch.winnerEntryId
) {
updateData.entryBId =
currentMatch.winnerEntryId;
}
if (Object.keys(updateData).length > 0) {
await tx.match.update({
where: {
id: nextMatch.id,
},
data: updateData,
});
}
}
}
// ============================================================
// VERIFY FUTURE ROUNDS
// ============================================================
//
// A future match becomes playable only when BOTH feeder
// matches have been resolved.
//
// We NEVER create a fake BYE here.
//
for (
let roundIndex = 1;
roundIndex < allRoundMatches.length;
roundIndex++
) {
const currentMatches =
allRoundMatches[roundIndex];
for (const currentMatch of currentMatches) {
const feederMatches =
await tx.match.findMany({
where: {
nextMatchId: currentMatch.id,
},
orderBy: {
id: "asc",
},
});
if (feederMatches.length !== 2) {
continue;
}
const bothResolved =
feederMatches.every(
(feeder) =>
feeder.status === "COMPLETED" &&
feeder.winnerEntryId
);
if (!bothResolved) {
continue;
}
const winnerIds =
feederMatches.map(
(feeder) =>
feeder.winnerEntryId
);
const uniqueWinnerIds = [
...new Set(winnerIds),
];
// ------------------------------------------------------
// Normal next-round match
// ------------------------------------------------------
if (uniqueWinnerIds.length === 2) {
await tx.match.update({
where: {
id: currentMatch.id,
},
data: {
entryAId:
uniqueWinnerIds[0],
entryBId:
uniqueWinnerIds[1],
isBye: false,
status: "UPCOMING",
winnerEntryId: null,
},
});
}
}
}
// ==================================================
// CREATE BRONZE MATCH
// ==================================================
//
// Bronze match is created only for tournaments with
// at least 2 rounds (i.e. semifinals exist).
//
// It must NOT become part of the final bracket.
// It is a separate match between the semifinal losers.
//

if (totalRounds >= 2) {
  const semiFinalRound =
    rounds[totalRounds - 2];

  await tx.match.create({
    data: {
      sportId:
        draw.category.sportId,

      categoryId:
        draw.categoryId,

      roundId:
        semiFinalRound.id,

      matchNumber:
        "Bronze Match",

      status:
        "UPCOMING",

      isBye: false,
    },
  });
}
// ==================================================
// MARK DRAW GENERATED
// ==================================================
return await tx.draw.update({
where: {
id: drawId,
},
data: {
status:
"GENERATED",
generatedAt:
new Date(),
},
include:
drawInclude,
});
}
);
// ========================================================
// RESPONSE
// ========================================================
return res.json({
success: true,
message:
"Knockout draw generated successfully",
data: generatedDraw,
});
} catch (error) {
console.error(
"Error generating draw:",
error
);
return res.status(500).json({
success: false,
message:
"Failed to generate draw",
error:
error.message,
});
}
}
);
// ============================================================
// RESET / REGENERATE DRAW
// ============================================================
//
// Admin-only correction route.
//
// This removes the generated bracket structure but keeps
// the Draw record itself and keeps all registrations.
//
// After reset:
//
// DRAWED STRUCTURE
// ↓
// DRAFT
// ↓
// ADMIN CAN GENERATE AGAIN
//
// Registrations are NOT deleted.
//
app.post(
"/api/draws/:drawId/reset",
async (req, res) => {
try {
const drawId =
Number(req.params.drawId);
if (!Number.isInteger(drawId)) {
return res.status(400).json({
success: false,
message:
"Invalid draw ID",
});
}
const draw =
await prisma.draw.findUnique({
where: {
id: drawId,
},
include: {
category: {
include: {
sport: true,
},
},
},
});
if (!draw) {
return res.status(404).json({
success: false,
message:
"Draw not found",
});
}
// --------------------------------------------------------
// ATHLETICS DOES NOT USE DRAW / MATCH SYSTEM
// --------------------------------------------------------
if (
draw.category?.sport?.name?.trim()?.toLowerCase() ===
"athletics"
) {
return res.status(400).json({
success: false,
message:
"Athletics does not use draws. Enter winners directly.",
});
}
// ------------------------------------------------------
// Reset generated/locked bracket structure
// ------------------------------------------------------
const resetDraw =
await prisma.$transaction(
async (tx) => {
// Delete all matches belonging to
// this draw's rounds.
await tx.match.deleteMany({
where: {
round: {
drawId,
},
},
});
// Delete rounds.
await tx.drawRound.deleteMany({
where: {
drawId,
},
});
// Delete bracket slots.
await tx.drawSlot.deleteMany({
where: {
drawId,
},
});
// Keep the Draw record.
// Only reset its generated state.
return await tx.draw.update({
where: {
id: drawId,
},
data: {
status: "DRAFT",
generatedAt: null,
lockedAt: null,
},
include:
drawInclude,
});
}
);
return res.json({
success: true,
message:
"Draw reset successfully. Registrations were preserved.",
data: resetDraw,
});
} catch (error) {
console.error(
"Error resetting draw:",
error
);
return res.status(500).json({
success: false,
message:
"Failed to reset draw",
error:
error.message,
});
}
}
);
// ============================================================
// LOCK DRAW
// ============================================================
app.post(
"/api/draws/:drawId/lock",
async (req, res) => {
try {
const drawId =
Number(req.params.drawId);
if (
!Number.isInteger(drawId)
) {
return res.status(400).json({
success: false,
message:
"Invalid draw ID",
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
message:
"Draw not found",
});
}
if (
draw.status !== "GENERATED"
) {
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
status:
"LOCKED",
lockedAt:
new Date(),
},
include:
drawInclude,
});
res.json({
success: true,
message:
"Draw locked successfully",
data:
lockedDraw,
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
error:
error.message,
});
}
}
);
// ============================================================
// ADMIN - VIEW COMPETITION RESULTS
// ============================================================
app.get("/api/results", async (req, res) => {
try {
const year = req.query.year || "2026-27";
const categoryId = req.query.categoryId
? Number(req.query.categoryId)
: undefined;
const results = await prisma.competitionResult.findMany({
where: {
year,
...(categoryId ? { categoryId } : {}),
},
include: {
category: {
select: {
id: true,
name: true,
},
},
entry: {
select: {
id: true,
departmentId: true,
department: {
select: {
id: true,
name: true,
code: true,
},
},
},
},
},
orderBy: [
{ categoryId: "asc" },
{ position: "asc" },
],
});
res.json({
success: true,
count: results.length,
data: results,
});
} catch (error) {
console.error("Error fetching competition results:", error);
res.status(500).json({
success: false,
message: "Failed to fetch competition results",
error: error.message,
});
}
});
// ======================================================
// ATHLETICS - SAVE / UPDATE ALL 3 POSITIONS
// Admin can manipulate Athletics results anytime
// ======================================================
app.post("/api/results/athletics", async (req, res) => {
try {
const {
categoryId,
firstEntryId,
secondEntryId,
thirdEntryId,
year = "2026-27",
} = req.body;
const categoryIdNumber = Number(categoryId);
const firstId = Number(firstEntryId);
const secondId = Number(secondEntryId);
const thirdId = Number(thirdEntryId);
// --------------------------------------------------
// BASIC VALIDATION
// --------------------------------------------------
if (
!categoryIdNumber ||
!firstId ||
!secondId ||
!thirdId
) {
return res.status(400).json({
success: false,
message:
"categoryId, firstEntryId, secondEntryId and thirdEntryId are required",
});
}
// --------------------------------------------------
// PREVENT SAME ENTRY IN MULTIPLE POSITIONS
// --------------------------------------------------
const entryIds = [
firstId,
secondId,
thirdId,
];
if (
new Set(entryIds).size !==
entryIds.length
) {
return res.status(400).json({
success: false,
message:
"The same participant cannot have multiple positions.",
});
}
// --------------------------------------------------
// VERIFY CATEGORY
// --------------------------------------------------
const category =
await prisma.sportCategory.findUnique({
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
message: "Category not found.",
});
}
// Athletics only
if (
category.sport?.name
?.trim()
?.toLowerCase() !==
"athletics"
) {
return res.status(400).json({
success: false,
message:
"This endpoint is only for Athletics.",
});
}
// --------------------------------------------------
// VERIFY ALL THREE ENTRIES
// --------------------------------------------------
const selectedEntries =
await prisma.competitionEntry.findMany({
where: {
id: {
in: entryIds,
},
categoryId:
categoryIdNumber,
},
});
if (
selectedEntries.length !== 3
) {
return res.status(400).json({
success: false,
message:
"One or more selected participants do not belong to this Athletics category.",
});
}
// --------------------------------------------------
// SINGLE DATABASE TRANSACTION
// --------------------------------------------------
const savedResults =
await prisma.$transaction(
async (tx) => {
// Remove existing results for
// this category and year.
//
// This makes the operation a complete
// replacement of the podium.
await tx.competitionResult.deleteMany({
where: {
categoryId:
categoryIdNumber,
year,
},
});
// --------------------------------------------
// 1ST POSITION - GOLD - 5 POINTS
// --------------------------------------------
await tx.competitionResult.create({
data: {
categoryId:
categoryIdNumber,
entryId: firstId,
position: 1,
medal: "GOLD",
pointsAwarded: 5,
year,
},
});
// --------------------------------------------
// 2ND POSITION - SILVER - 3 POINTS
// --------------------------------------------
await tx.competitionResult.create({
data: {
categoryId:
categoryIdNumber,
entryId: secondId,
position: 2,
medal: "SILVER",
pointsAwarded: 3,
year,
},
});
// --------------------------------------------
// 3RD POSITION - BRONZE - 1 POINT
// --------------------------------------------
await tx.competitionResult.create({
data: {
categoryId:
categoryIdNumber,
entryId: thirdId,
position: 3,
medal: "BRONZE",
pointsAwarded: 1,
year,
},
});
// --------------------------------------------
// RECALCULATE DEPARTMENT STANDINGS
// --------------------------------------------
await recalculateDepartmentStandings(
tx,
year
);
// Return the new results
return tx.competitionResult.findMany({
where: {
categoryId:
categoryIdNumber,
year,
},
orderBy: {
position: "asc",
},
});
}
);
// --------------------------------------------------
// SUCCESS
// --------------------------------------------------
res.status(201).json({
success: true,
message:
"Athletics results saved successfully.",
data: savedResults,
});
} catch (error) {
console.error(
"Error saving Athletics results:",
error
);
res.status(500).json({
success: false,
message:
"Failed to save Athletics results.",
error: error.message,
});
}
});
/* ============================================================
DELETE SINGLE COMPETITION RESULT
ADMIN CAN DELETE ANY RESULT AT ANY TIME
============================================================ */
app.delete(
"/api/results/:resultId",
async (req, res) => {
try {
const resultId = Number(
req.params.resultId
);
if (!resultId) {
return res.status(400).json({
success: false,
message: "Invalid result ID",
});
}
const existingResult =
await prisma.competitionResult.findUnique({
where: {
id: resultId,
},
});
if (!existingResult) {
return res.status(404).json({
success: false,
message: "Competition result not found",
});
}
await prisma.$transaction(
async (tx) => {
await tx.competitionResult.delete({
where: {
id: resultId,
},
});
await recalculateDepartmentStandings(
tx,
existingResult.year
);
}
);
res.json({
success: true,
message:
"Competition result deleted successfully",
});
} catch (error) {
console.error(
"Error deleting competition result:",
error
);
res.status(500).json({
success: false,
message:
"Failed to delete competition result",
error: error.message,
});
}
}
);
/* ============================================================
RESET ALL RESULTS FOR A CATEGORY
ADMIN CAN RESET RESULTS AT ANY TIME
============================================================ */
app.delete(
"/api/results/category/:categoryId",
async (req, res) => {
try {
const categoryId = Number(
req.params.categoryId
);
const year =
req.query.year || "2026-27";
if (!categoryId) {
return res.status(400).json({
success: false,
message: "Invalid category ID",
});
}
const category =
await prisma.sportCategory.findUnique({
where: {
id: categoryId,
},
});
if (!category) {
return res.status(404).json({
success: false,
message: "Category not found",
});
}
const deleted =
await prisma.$transaction(
async (tx) => {
const deleteResult =
await tx.competitionResult.deleteMany({
where: {
categoryId,
year,
},
});
await recalculateDepartmentStandings(
tx,
year
);
return deleteResult;
}
);
res.json({
success: true,
message:
"All results for this category have been reset",
deletedCount: deleted.count,
});
} catch (error) {
console.error(
"Error resetting competition results:",
error
);
res.status(500).json({
success: false,
message:
"Failed to reset competition results",
error: error.message,
});
}
}
);
// ============================================================
// ADMIN - EDIT COMPETITION RESULT POINTS
// ============================================================

app.patch("/api/results/:resultId", async (req, res) => {
  try {
    const resultId = Number(req.params.resultId);
    const pointsAwarded = Number(req.body.pointsAwarded);

    if (!Number.isInteger(resultId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid result ID",
      });
    }

    if (!Number.isFinite(pointsAwarded) || pointsAwarded < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid points value",
      });
    }

    const existingResult =
      await prisma.competitionResult.findUnique({
        where: { id: resultId },
      });

    if (!existingResult) {
      return res.status(404).json({
        success: false,
        message: "Competition result not found",
      });
    }

    const updatedResult =
      await prisma.$transaction(async (tx) => {
        const updated =
          await tx.competitionResult.update({
            where: { id: resultId },
            data: {
              pointsAwarded,
            },
          });

        await recalculateDepartmentStandings(
          tx,
          existingResult.year
        );

        return updated;
      });

    res.json({
      success: true,
      message: "Result points updated successfully",
      data: updatedResult,
    });
  } catch (error) {
    console.error(
      "Error editing competition result:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to edit competition result",
      error: error.message,
    });
  }
});
// ============================================================
// ADMIN - EDIT CATEGORY PODIUM / WINNERS
// ============================================================

app.patch("/api/results/category/:categoryId/podium", async (req, res) => {
  try {
    const categoryId = Number(req.params.categoryId);
    const firstEntryId = Number(req.body.firstEntryId);
    const secondEntryId = Number(req.body.secondEntryId);
    const thirdEntryId = Number(req.body.thirdEntryId);
    const year = req.body.year || "2026-27";

    if (!Number.isInteger(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const podium = [
      firstEntryId,
      secondEntryId,
      thirdEntryId,
    ];

    if (
      podium.some((id) => !Number.isInteger(id)) ||
      new Set(podium).size !== 3
    ) {
      return res.status(400).json({
        success: false,
        message: "Gold, Silver and Bronze must be three different valid entries",
      });
    }

    const category = await prisma.sportCategory.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const entries = await prisma.competitionEntry.findMany({
      where: {
        id: {
          in: podium,
        },
        categoryId,
      },
    });

    if (entries.length !== 3) {
      return res.status(400).json({
        success: false,
        message: "All podium entries must belong to this category",
      });
    }

    const pointScheme = await prisma.pointScheme.findFirst({
      where: {
        categoryId,
        year,
      },
      orderBy: {
        id: "desc",
      },
    });

    const goldPoints = Number(pointScheme?.goldPoints ?? 5);
    const silverPoints = Number(pointScheme?.silverPoints ?? 3);
    const bronzePoints = Number(pointScheme?.bronzePoints ?? 1);

    const updatedResults = await prisma.$transaction(async (tx) => {
      // Remove the old podium for this category.
      await tx.competitionResult.deleteMany({
        where: {
          categoryId,
          year,
        },
      });

      // Create the new podium.
      await tx.competitionResult.createMany({
        data: [
          {
            categoryId,
            entryId: firstEntryId,
            position: 1,
            medal: "GOLD",
            pointsAwarded: goldPoints,
            year,
          },
          {
            categoryId,
            entryId: secondEntryId,
            position: 2,
            medal: "SILVER",
            pointsAwarded: silverPoints,
            year,
          },
          {
            categoryId,
            entryId: thirdEntryId,
            position: 3,
            medal: "BRONZE",
            pointsAwarded: bronzePoints,
            year,
          },
        ],
      });

      await recalculateDepartmentStandings(tx, year);

      return tx.competitionResult.findMany({
        where: {
          categoryId,
          year,
        },
        include: {
          category: true,
          entry: {
            include: {
              department: true,
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      });
    });

    res.json({
      success: true,
      message: "Winner podium updated and point table recalculated",
      data: updatedResults,
    });
  } catch (error) {
    console.error("EDIT PODIUM ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update winner podium",
      error: error.message,
    });
  }
});
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