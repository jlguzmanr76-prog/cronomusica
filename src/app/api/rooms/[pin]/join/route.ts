import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(
  request: NextRequest,
  { params }: { params: { pin: string } }
) {
  try {
    const { pin } = params;
    const body = await request.json();
    const { playerName, deviceId } = body;

    if (!playerName || !deviceId) {
      return NextResponse.json(
        { error: "Player name and device ID are required" },
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

    // Check if room is waiting for players
    if (room.status !== "WAITING") {
      return NextResponse.json(
        { error: "Room is not accepting new players" },
        { status: 400 }
      );
    }

    // Check if player already exists
    const existingPlayer = await prisma.player.findUnique({
      where: {
        roomId_deviceId: {
          roomId: room.id,
          deviceId,
        },
      },
    });

    if (existingPlayer) {
      return NextResponse.json(
        { error: "Player already in room" },
        { status: 400 }
      );
    }

    // Create player
    const player = await prisma.player.create({
      data: {
        roomId: room.id,
        name: playerName,
        deviceId,
        isHost: false,
      },
    });

    // Trigger Pusher event
    await pusherServer.trigger(`room-${room.id}`, "player-joined", {
      playerId: player.id,
      playerName: player.name,
      isHost: player.isHost,
      playerCount: room.players.length + 1,
    });

    return NextResponse.json({
      playerId: player.id,
      playerName: player.name,
      roomId: room.id,
      roomName: room.name,
      gameMode: room.gameMode,
      timeBonusEnabled: room.timeBonusEnabled,
    });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json(
      { error: "Failed to join room" },
      { status: 500 }
    );
  }
}
