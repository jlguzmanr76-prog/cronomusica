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
        roundResults: {
          select: {
            songId: true,
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

    // Verify requester is host
    if (room.hostId !== session.user.id) {
      return NextResponse.json(
        { error: "Only host can start a round" },
        { status: 403 }
      );
    }

    // Check if game is active
    if (room.status !== RoomStatus.ACTIVE) {
      return NextResponse.json(
        { error: "Game is not active" },
        { status: 400 }
      );
    }

    // Check if max rounds reached
    if (room.currentRound > room.maxRounds) {
      return NextResponse.json(
        { error: "Maximum rounds reached" },
        { status: 400 }
      );
    }

    // Get song IDs already used in this room
    const usedSongIds = room.roundResults.map((r) => r.songId);

    // Build filter conditions
    const where: any = {};

    // Exclude already used songs
    if (usedSongIds.length > 0) {
      where.id = { notIn: usedSongIds };
    }

    // Genre filter
    if (room.genreFilter && room.genreFilter.length > 0) {
      where.genre = {
        hasSome: room.genreFilter,
      };
    }

    // Country filter
    if (room.countryFilter) {
      where.country = room.countryFilter;
    }

    // Popularity filter for POPULAR mode
    if (room.songFilterType === "POPULAR") {
      where.popularity = {
        gte: 50, // Songs with popularity >= 50
      };
    }

    // Select random song
    const songs = await prisma.song.findMany({
      where,
      take: 100, // Get up to 100 candidates
    });

    if (songs.length === 0) {
      return NextResponse.json(
        { error: "No songs available with current filters" },
        { status: 400 }
      );
    }

    const randomSong = songs[Math.floor(Math.random() * songs.length)];

    // Update room current round
    await prisma.room.update({
      where: { id: room.id },
      data: {
        currentRound: room.currentRound + 1,
      },
    });

    // Trigger Pusher event (song info only for host)
    await pusherServer.trigger(`room-${room.id}`, "round-started", {
      roundNumber: room.currentRound,
      songId: randomSong.id,
      songDuration: Math.floor(randomSong.durationMs / 1000), // Convert to seconds
      timeLimit: 30, // 30 seconds to answer
      spotifyUri: randomSong.spotifyUri, // Only host sees this
    });

    return NextResponse.json({
      roundNumber: room.currentRound,
      songId: randomSong.id,
      songDuration: Math.floor(randomSong.durationMs / 1000),
      timeLimit: 30,
      spotifyUri: randomSong.spotifyUri,
    });
  } catch (error) {
    console.error("Error starting round:", error);
    return NextResponse.json(
      { error: "Failed to start round" },
      { status: 500 }
    );
  }
}
