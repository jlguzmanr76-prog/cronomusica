import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { RoomStatus } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pin: string }> }
) {
  try {
    const { pin } = await params;
    const body = await request.json();
    const { playerId, roundNumber, placedPosition, responseTimeMs } = body;

    if (!playerId || !roundNumber || placedPosition === undefined || !responseTimeMs) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find room
    const room = await prisma.room.findUnique({
      where: { pin },
      include: {
        players: true,
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // Check if game is active
    if (room.status !== RoomStatus.ACTIVE) {
      return NextResponse.json(
        { error: "Game is not active" },
        { status: 400 }
      );
    }

    // Find player
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player || player.roomId !== room.id) {
      return NextResponse.json(
        { error: "Player not found in this room" },
        { status: 404 }
      );
    }

    // Check if player already submitted for this round
    const existingResult = await prisma.roundResult.findFirst({
      where: {
        playerId,
        roundNumber,
      },
    });

    if (existingResult) {
      return NextResponse.json(
        { error: "Already submitted for this round" },
        { status: 400 }
      );
    }

    // For now, we'll mark all guesses as correct with a random position
    // In production, this would be calculated based on the actual song's year
    // and the player's timeline state
    const isCorrect = true;
    const correctPosition = placedPosition; // Simplified for now

    // Calculate points
    const basePoints = 100; // Base points for correct answer
    let speedBonus = 0;
    let streakMultiplier = 1.0;

    if (isCorrect) {
      // Calculate speed bonus if enabled
      if (room.timeBonusEnabled) {
        const timeLimit = 30000; // 30 seconds in ms
        const speedRatio = 1 - (responseTimeMs / timeLimit);
        speedBonus = Math.floor(speedRatio * 50); // Max 50 bonus points
      }

      // Calculate streak multiplier
      const newStreak = player.streak + 1;
      if (newStreak >= 5) {
        streakMultiplier = 2.0;
      } else if (newStreak >= 3) {
        streakMultiplier = 1.5;
      } else if (newStreak >= 2) {
        streakMultiplier = 1.2;
      }

      // Update player streak
      await prisma.player.update({
        where: { id: playerId },
        data: { streak: newStreak },
      });
    } else {
      // Reset streak on incorrect answer
      await prisma.player.update({
        where: { id: playerId },
        data: { streak: 0 },
      });
    }

    const totalPoints = Math.floor((basePoints + speedBonus) * streakMultiplier);

    // Create round result
    const roundResult = await prisma.roundResult.create({
      data: {
        roomId: room.id,
        playerId,
        songId: "temp-song-id", // Will be updated when we have real song selection
        roundNumber,
        placedPosition,
        correctPosition,
        isCorrect,
        points: isCorrect ? basePoints : 0,
        speedBonus,
        streakMultiplier,
        responseTimeMs,
      },
    });

    // Update player score
    if (isCorrect) {
      await prisma.player.update({
        where: { id: playerId },
        data: {
          score: {
            increment: totalPoints,
          },
        },
      });
    }

    // Check if all players have submitted
    const allResults = await prisma.roundResult.findMany({
      where: {
        roomId: room.id,
        roundNumber,
      },
    });

    if (allResults.length === room.players.length) {
      // All players submitted - trigger reveal
      // For now, just trigger a basic reveal
      await pusherServer.trigger(`room-${room.id}`, "round-reveal", {
        roundNumber,
        song: {
          title: "Sample Song",
          artist: "Sample Artist",
          releaseYear: 2020,
        },
        correctPosition,
        playerResults: allResults.map((r) => ({
          playerId: r.playerId,
          playerName: "", // Would need to fetch
          placedPosition: r.placedPosition,
          isCorrect: r.isCorrect,
          points: r.points,
          speedBonus: r.speedBonus,
          streakMultiplier: r.streakMultiplier,
          totalPoints: Math.floor((r.points + r.speedBonus) * r.streakMultiplier),
          responseTimeMs: r.responseTimeMs,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      isCorrect,
      points: isCorrect ? basePoints : 0,
      speedBonus,
      streakMultiplier,
      totalPoints,
    });
  } catch (error) {
    console.error("Error submitting guess:", error);
    return NextResponse.json(
      { error: "Failed to submit guess" },
      { status: 500 }
    );
  }
}
