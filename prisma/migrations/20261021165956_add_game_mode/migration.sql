-- CreateEnum
CREATE TYPE "GameMode" AS ENUM ('TIMELINE', 'TIMELINE_NO_TIME');

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "gameMode" "GameMode" NOT NULL DEFAULT 'TIMELINE',
ADD COLUMN     "timeBonusEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Room_gameMode_idx" ON "Room"("gameMode");
