import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { RoomStatus } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: { pin: string } }
) {
  try {
    const { pin } = params;

    // Check if user is authenticated (host)
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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

    // Verify requester is host
    if (room.hostId !== session.user.id) {
      return NextResponse.json(
        { error: "Only host can start the game" },
        { status: 403 }
      );
    }

    // Check if room is waiting
    if (room.status !== RoomStatus.WAITING) {
      return NextResponse.json(
        { error: "Game already started or finished" },
        { status: 400 }
      );
    }

    // Check if there are enough players (at least 1 besides host)
    if (room.players.length < 1) {
      return NextResponse.json(
        { error: "Need at least 1 player to start" },
        { status: 400 }
      );
    }

    // Update room status
    const updatedRoom = await prisma.room.update({
      where: { id: room.id },
      data: {
        status: RoomStatus.ACTIVE,
        currentRound: 1,
      },
    });

    // Trigger Pusher event
    await pusherServer.trigger(`room-${room.id}`, "game-started", {
      currentRound: 1,
      totalRounds: room.maxRounds,
      gameMode: room.gameMode,
      timeBonusEnabled: room.timeBonusEnabled,
    });

    return NextResponse.json({
      roomId: updatedRoom.id,
      status: updatedRoom.status,
      currentRound: updatedRoom.currentRound,
      totalRounds: room.maxRounds,
    });
  } catch (error) {
    console.error("Error starting game:", error);
    return NextResponse.json(
      { error: "Failed to start game" },
      { status: 500 }
    );
  }
}
