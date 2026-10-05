-- CreateEnum
CREATE TYPE "CategoryRegistrationStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "SportCategory" ADD COLUMN     "registrationEnds" TIMESTAMP(3),
ADD COLUMN     "registrationStatus" "CategoryRegistrationStatus" NOT NULL DEFAULT 'CLOSED';
