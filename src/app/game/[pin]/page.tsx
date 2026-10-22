"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, Send, Trophy, Music, ChevronLeft, ChevronRight } from "lucide-react";

interface TimelineCard {
  songId: string;
  title: string;
  artist: string;
  releaseYear: number;
  position: number;
}

interface PlayerData {
  id: string;
  name: string;
  score: number;
  streak: number;
}

export default function PlayerGamePage() {
  const { pin } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [roomStatus, setRoomStatus] = useState<"WAITING" | "ACTIVE" | "COMPLETED">("WAITING");
  const [currentRound, setCurrentRound] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [timeline, setTimeline] = useState<TimelineCard[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<PlayerData[]>([]);
  const [gameMode, setGameMode] = useState<"TIMELINE" | "TIMELINE_NO_TIME">("TIMELINE");
  const [timeBonusEnabled, setTimeBonusEnabled] = useState(true);

  // Load player info from localStorage
  const playerId = typeof window !== "undefined" ? localStorage.getItem("playerId") : "";
  const playerName = typeof window !== "undefined" ? localStorage.getItem("playerName") : "";

  useEffect(() => {
    if (!pin || !playerId) {
      router.push("/join");
      return;
    }

    fetchRoom();
    const interval = setInterval(fetchRoom, 2000);

    return () => clearInterval(interval);
  }, [pin, playerId]);

  const fetchRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${pin}`);
      if (!response.ok) {
        throw new Error("Failed to fetch room");
      }
      const data = await response.json();
      setRoomStatus(data.status);
      setCurrentRound(data.currentRound);
      setGameMode(data.gameMode);
      setTimeBonusEnabled(data.timeBonusEnabled);
      setLeaderboard(data.players);
      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching room:", err);
    }
  };

  const handleSubmitGuess = async () => {
    if (selectedPosition === null || submitted) return;

    const responseTimeMs = (30 - timeRemaining) * 1000;

    try {
      const response = await fetch(`/api/rooms/${pin}/rounds/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          roundNumber: currentRound,
          placedPosition: selectedPosition,
          responseTimeMs,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit guess");
      }

      const data = await response.json();
      setResult(data);
      setSubmitted(true);
    } catch (err: any) {
      console.error("Error submitting guess:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (roomStatus === "WAITING") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="text-center">
          <Music className="w-16 h-16 text-green-400 mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-bold text-white mb-2">Esperando al Host</h1>
          <p className="text-purple-200">El juego comenzará pronto...</p>
        </div>
      </div>
    );
  }

  if (roomStatus === "COMPLETED") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">¡Juego Terminado!</h1>
            <div className="mb-6">
              <p className="text-purple-200 mb-2">Tu puntaje final:</p>
              <p className="text-5xl font-bold text-white">
                {leaderboard.find((p) => p.id === playerId)?.score || 0}
              </p>
            </div>
            <button
              onClick={() => router.push("/join")}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-all"
            >
              Jugar de Nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-purple-200 text-sm">Hola, {playerName}</p>
          <p className="text-white font-semibold">
            Ronda {currentRound} • {gameMode === "TIMELINE" ? "Cronológico" : "Sin Tiempo"}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
          <Clock className="w-4 h-4 text-white" />
          <span className="text-white font-bold">{timeRemaining}s</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Song Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <Music className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-white font-semibold">Fragmento #{currentRound}</p>
              <p className="text-purple-200 text-sm">
                {timeBonusEnabled ? "¡Responde rápido para bonus!" : "Sin límite de tiempo"}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 flex-1">
          <p className="text-white font-semibold mb-3 text-center">
            ¿Dónde va esta canción en tu timeline?
          </p>

          <div className="flex items-center justify-between mb-4">
            <ChevronLeft className="w-6 h-6 text-purple-300" />
            <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto py-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setSelectedPosition(pos)}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-white font-bold transition-all shrink-0 ${
                    selectedPosition === pos
                      ? "border-green-500 bg-green-500/30 scale-110"
                      : "border-white/20 bg-white/5 hover:border-white/40"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
            <ChevronRight className="w-6 h-6 text-purple-300" />
          </div>

          <div className="flex justify-between text-xs text-purple-300 px-2">
            <span>Más antigua</span>
            <span>Más reciente</span>
          </div>
        </div>

        {/* Current Timeline */}
        {timeline.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-white font-semibold mb-2">Tu Timeline:</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {timeline.map((card) => (
                <div
                  key={card.songId}
                  className="bg-white/10 rounded-lg p-2 min-w-[120px] border border-white/20"
                >
                  <p className="text-white text-sm font-medium truncate">{card.title}</p>
                  <p className="text-purple-300 text-xs">{card.releaseYear}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {!submitted ? (
          <button
            onClick={handleSubmitGuess}
            disabled={selectedPosition === null}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Enviar Respuesta
          </button>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            {result && (
              <div className="text-center">
                <p className={`text-2xl font-bold mb-2 ${result.isCorrect ? "text-green-400" : "text-red-400"}`}>
                  {result.isCorrect ? "¡Correcto!" : "Incorrecto"}
                </p>
                <p className="text-white">
                  Puntos: {result.totalPoints}
                  {result.speedBonus > 0 && (
                    <span className="text-green-400 ml-2">(+{result.speedBonus} bonus)</span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Mini Leaderboard */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <p className="text-white font-semibold mb-2">Leaderboard:</p>
          <div className="space-y-2">
            {leaderboard.slice(0, 3).map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between bg-white/5 rounded-lg p-2 ${
                  player.id === playerId ? "border border-green-500" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">#{index + 1}</span>
                  <span className="text-purple-200">{player.name}</span>
                </div>
                <span className="text-white font-bold">{player.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
