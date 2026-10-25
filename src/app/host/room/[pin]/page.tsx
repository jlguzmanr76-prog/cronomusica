"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Users, Play, Copy, Check, X } from "lucide-react";
import Pusher from "pusher-js";

interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
  isHost: boolean;
}

interface RoomData {
  id: string;
  name: string;
  pin: string;
  status: string;
  gameMode: string;
  timeBonusEnabled: boolean;
  currentRound: number;
  maxRounds: number;
  players: Player[];
  playerCount: number;
}

export default function HostRoomPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [pin, setPin] = useState<string>("");

  useEffect(() => {
    const pathParts = window.location.pathname.split("/");
    const pinParam = pathParts[pathParts.length - 1];
    if (pinParam) {
      setPin(pinParam);
    }
  }, []);

  useEffect(() => {
    if (!pin) return;

    fetchRoom();

    // Initialize Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`room-${room?.id || pin}`);

    channel.bind("player-joined", (data: any) => {
      fetchRoom(); // Refresh room when player joins
    });

    channel.bind("game-started", (data: any) => {
      router.push(`/host/game/${pin}`);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [pin, room?.id]);

  const fetchRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${pin}`);
      if (!response.ok) {
        throw new Error("Failed to fetch room");
      }
      const data = await response.json();
      setRoom(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCopyPin = () => {
    if (room?.pin) {
      navigator.clipboard.writeText(room.pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartGame = async () => {
    try {
      const response = await fetch(`/api/rooms/${pin}/start`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to start game");
      }

      router.push(`/host/game/${pin}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg">
          {error || "Room not found"}
        </div>
      </div>
    );
  }

  const canStart = room.players.length >= 1 && room.status === "WAITING";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{room.name}</h1>
          <p className="text-purple-200">
            {room.gameMode === "TIMELINE" ? "Modo Cronológico" : "Modo Sin Tiempo"}
          </p>
        </div>

        {/* PIN Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-6">
          <div className="text-center">
            <p className="text-purple-200 mb-4">Comparte este PIN con tus amigos:</p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-6xl font-bold text-white tracking-widest bg-white/10 px-8 py-4 rounded-xl">
                {room.pin}
              </div>
              <button
                onClick={handleCopyPin}
                className="p-3 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-6 h-6 text-white" /> : <Copy className="w-6 h-6 text-white" />}
              </button>
            </div>
            <p className="text-purple-300 text-sm mt-4">
              Los jugadores pueden unirse escaneando el QR o ingresando el PIN
            </p>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6" />
              Jugadores ({room.playerCount})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {room.players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10"
              >
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">{player.name}</div>
                  {player.isHost && <div className="text-green-400 text-sm">Host</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Button */}
        <div className="text-center">
          {!canStart && room.status === "WAITING" && (
            <p className="text-purple-200 mb-4">
              Necesitas al menos 1 jugador para comenzar
            </p>
          )}
          {room.status === "ACTIVE" && (
            <p className="text-green-400 mb-4 font-semibold">El juego está en progreso</p>
          )}
          <button
            onClick={handleStartGame}
            disabled={!canStart}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
          >
            <Play className="w-6 h-6" />
            Iniciar Juego
          </button>
        </div>
      </div>
    </div>
  );
}
