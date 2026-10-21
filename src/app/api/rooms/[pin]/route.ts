import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { pin: string } }
) {
  try {
    const { pin } = params;

    const room = await prisma.room.findUnique({
      where: { pin },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        players: {
          select: {
            id: true,
            name: true,
            score: true,
            streak: true,
            isHost: true,
            joinedAt: true,
          },
          orderBy: {
            score: "desc",
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: room.id,
      name: room.name,
      pin: room.pin,
      status: room.status,
      gameMode: room.gameMode,
      timeBonusEnabled: room.timeBonusEnabled,
      currentRound: room.currentRound,
      maxRounds: room.maxRounds,
      targetScore: room.targetScore,
      settings: {
        genreFilter: room.genreFilter,
        countryFilter: room.countryFilter,
        songFilterType: room.songFilterType,
      },
      host: room.host,
      players: room.players,
      playerCount: room.players.length,
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}
