/*
  Warnings:

  - You are about to drop the column `stage` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the `DrawLot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MatchRegistrationPlayer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MatchTeam` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('SINGLE', 'PAIR', 'TEAM');

-- CreateEnum
CREATE TYPE "CompetitionFormat" AS ENUM ('KNOCKOUT', 'ROUND_ROBIN', 'HEAT', 'DIRECT_FINAL');

-- CreateEnum
CREATE TYPE "DrawFormat" AS ENUM ('KNOCKOUT', 'ROUND_ROBIN', 'HEAT');

-- CreateEnum
CREATE TYPE "DrawStatus" AS ENUM ('DRAFT', 'GENERATED', 'LOCKED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Medal" AS ENUM ('GOLD', 'SILVER', 'BRONZE');

-- DropForeignKey
ALTER TABLE "DrawLot" DROP CONSTRAINT "DrawLot_matchId_fkey";

-- DropForeignKey
ALTER TABLE "MatchRegistrationPlayer" DROP CONSTRAINT "MatchRegistrationPlayer_playerId_fkey";

-- DropForeignKey
ALTER TABLE "MatchRegistrationPlayer" DROP CONSTRAINT "MatchRegistrationPlayer_registrationId_fkey";

-- DropForeignKey
ALTER TABLE "MatchTeam" DROP CONSTRAINT "MatchTeam_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "MatchTeam" DROP CONSTRAINT "MatchTeam_matchId_fkey";

-- DropForeignKey
ALTER TABLE "MatchTeam" DROP CONSTRAINT "MatchTeam_registrationId_fkey";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "stage",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "entryAId" INTEGER,
ADD COLUMN     "entryBId" INTEGER,
ADD COLUMN     "isBye" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nextMatchId" INTEGER,
ADD COLUMN     "roundId" INTEGER,
ADD COLUMN     "winnerEntryId" INTEGER,
ALTER COLUMN "scheduledAt" DROP NOT NULL,
ALTER COLUMN "registrationEnds" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Sport" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "DrawLot";

-- DropTable
DROP TABLE "MatchRegistrationPlayer";

-- DropTable
DROP TABLE "MatchTeam";

-- CreateTable
CREATE TABLE "SportCategory" (
    "id" SERIAL NOT NULL,
    "sportId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "format" "CompetitionFormat" NOT NULL DEFAULT 'KNOCKOUT',
    "entryType" "EntryType" NOT NULL DEFAULT 'SINGLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SportCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointScheme" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "year" TEXT NOT NULL,
    "goldPoints" INTEGER,
    "silverPoints" INTEGER,
    "bronzePoints" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PointScheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitionEntry" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "entryType" "EntryType" NOT NULL,
    "captainId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetitionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntryPlayer" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,

    CONSTRAINT "EntryPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Draw" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "format" "DrawFormat" NOT NULL DEFAULT 'KNOCKOUT',
    "status" "DrawStatus" NOT NULL DEFAULT 'DRAFT',
    "generatedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Draw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrawRound" (
    "id" SERIAL NOT NULL,
    "drawId" INTEGER NOT NULL,
    "roundNo" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DrawRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrawSlot" (
    "id" SERIAL NOT NULL,
    "drawId" INTEGER NOT NULL,
    "entryId" INTEGER,
    "slotNumber" INTEGER NOT NULL,
    "isBye" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DrawSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitionResult" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "entryId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "medal" "Medal",
    "pointsAwarded" INTEGER,
    "year" TEXT NOT NULL,
    "declaredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetitionResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SportCategory_sportId_idx" ON "SportCategory"("sportId");

-- CreateIndex
CREATE UNIQUE INDEX "SportCategory_sportId_name_key" ON "SportCategory"("sportId", "name");

-- CreateIndex
CREATE INDEX "PointScheme_year_idx" ON "PointScheme"("year");

-- CreateIndex
CREATE UNIQUE INDEX "PointScheme_categoryId_year_key" ON "PointScheme"("categoryId", "year");

-- CreateIndex
CREATE INDEX "CompetitionEntry_categoryId_idx" ON "CompetitionEntry"("categoryId");

-- CreateIndex
CREATE INDEX "CompetitionEntry_departmentId_idx" ON "CompetitionEntry"("departmentId");

-- CreateIndex
CREATE INDEX "EntryPlayer_playerId_idx" ON "EntryPlayer"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "EntryPlayer_entryId_playerId_key" ON "EntryPlayer"("entryId", "playerId");

-- CreateIndex
CREATE INDEX "Draw_categoryId_idx" ON "Draw"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "DrawRound_drawId_roundNo_key" ON "DrawRound"("drawId", "roundNo");

-- CreateIndex
CREATE INDEX "DrawSlot_entryId_idx" ON "DrawSlot"("entryId");

-- CreateIndex
CREATE UNIQUE INDEX "DrawSlot_drawId_slotNumber_key" ON "DrawSlot"("drawId", "slotNumber");

-- CreateIndex
CREATE INDEX "CompetitionResult_year_idx" ON "CompetitionResult"("year");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionResult_categoryId_entryId_year_key" ON "CompetitionResult"("categoryId", "entryId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionResult_categoryId_position_year_key" ON "CompetitionResult"("categoryId", "position", "year");

-- CreateIndex
CREATE INDEX "Match_categoryId_idx" ON "Match"("categoryId");

-- CreateIndex
CREATE INDEX "Match_roundId_idx" ON "Match"("roundId");

-- CreateIndex
CREATE INDEX "Match_entryAId_idx" ON "Match"("entryAId");

-- CreateIndex
CREATE INDEX "Match_entryBId_idx" ON "Match"("entryBId");

-- CreateIndex
CREATE INDEX "Match_winnerEntryId_idx" ON "Match"("winnerEntryId");

-- CreateIndex
CREATE INDEX "MatchRegistration_departmentId_idx" ON "MatchRegistration"("departmentId");

-- CreateIndex
CREATE INDEX "Player_departmentId_idx" ON "Player"("departmentId");

-- AddForeignKey
ALTER TABLE "SportCategory" ADD CONSTRAINT "SportCategory_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointScheme" ADD CONSTRAINT "PointScheme_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SportCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionEntry" ADD CONSTRAINT "CompetitionEntry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SportCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionEntry" ADD CONSTRAINT "CompetitionEntry_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionEntry" ADD CONSTRAINT "CompetitionEntry_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryPlayer" ADD CONSTRAINT "EntryPlayer_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CompetitionEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryPlayer" ADD CONSTRAINT "EntryPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draw" ADD CONSTRAINT "Draw_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SportCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawRound" ADD CONSTRAINT "DrawRound_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "Draw"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawSlot" ADD CONSTRAINT "DrawSlot_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "Draw"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawSlot" ADD CONSTRAINT "DrawSlot_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CompetitionEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SportCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "DrawRound"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_entryAId_fkey" FOREIGN KEY ("entryAId") REFERENCES "CompetitionEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_entryBId_fkey" FOREIGN KEY ("entryBId") REFERENCES "CompetitionEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerEntryId_fkey" FOREIGN KEY ("winnerEntryId") REFERENCES "CompetitionEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_nextMatchId_fkey" FOREIGN KEY ("nextMatchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionResult" ADD CONSTRAINT "CompetitionResult_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SportCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitionResult" ADD CONSTRAINT "CompetitionResult_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CompetitionEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
