import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { GameMode, RoomStatus, SongFilterType } from "@prisma/client";

// Helper function to generate a 4-digit PIN
function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Helper function to check if PIN is unique
async function isPinUnique(pin: string): Promise<boolean> {
  const existingRoom = await prisma.room.findUnique({
    where: { pin },
  });
  return !existingRoom;
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated (host)
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized. Host must be logged in with Spotify." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      gameMode = "TIMELINE",
      timeBonusEnabled = true,
      genreFilter = [],
      countryFilter = null,
      maxRounds = 10,
      targetScore = null,
      songFilterType = "POPULAR",
    } = body;

    // Validate game mode
    if (!Object.values(GameMode).includes(gameMode as GameMode)) {
      return NextResponse.json(
        { error: "Invalid game mode" },
        { status: 400 }
      );
    }

    // Validate song filter type
    if (!Object.values(SongFilterType).includes(songFilterType as SongFilterType)) {
      return NextResponse.json(
        { error: "Invalid song filter type" },
        { status: 400 }
      );
    }

    // Generate unique PIN
    let pin: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      pin = generatePin();
      attempts++;
      if (attempts >= maxAttempts) {
        return NextResponse.json(
          { error: "Could not generate unique PIN" },
          { status: 500 }
        );
      }
    } while (!(await isPinUnique(pin)));

    // Create room
    const room = await prisma.room.create({
      data: {
        name,
        pin,
        hostId: session.user.id,
        status: RoomStatus.WAITING,
        gameMode: gameMode as GameMode,
        timeBonusEnabled,
        genreFilter,
        countryFilter,
        maxRounds,
        targetScore,
        songFilterType: songFilterType as SongFilterType,
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create host player entry
    await prisma.player.create({
      data: {
        roomId: room.id,
        name: session.user.name || "Host",
        deviceId: session.user.id, // Use user ID as device ID for host
        isHost: true,
      },
    });

    // Trigger Pusher event
    await pusherServer.trigger(`room-${room.id}`, "room-created", {
      roomId: room.id,
      pin: room.pin,
      hostName: room.host.name,
      gameMode: room.gameMode,
      timeBonusEnabled: room.timeBonusEnabled,
      settings: {
        genreFilter: room.genreFilter,
        countryFilter: room.countryFilter,
        maxRounds: room.maxRounds,
        targetScore: room.targetScore,
        songFilterType: room.songFilterType,
      },
    });

    return NextResponse.json({
      roomId: room.id,
      pin: room.pin,
      name: room.name,
      gameMode: room.gameMode,
      timeBonusEnabled: room.timeBonusEnabled,
      host: room.host,
      settings: {
        genreFilter: room.genreFilter,
        countryFilter: room.countryFilter,
        maxRounds: room.maxRounds,
        targetScore: room.targetScore,
        songFilterType: room.songFilterType,
      },
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
