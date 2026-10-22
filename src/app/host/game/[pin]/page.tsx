"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Play, Pause, SkipForward, Trophy, Users, Volume2 } from "lucide-react";

interface Player {
  id: string;
  name: string;
  score: number;
  streak: number;
}

interface RoomData {
  id: string;
  name: string;
  pin: string;
  status: string;
  currentRound: number;
  maxRounds: number;
  players: Player[];
}

export default function HostGamePage() {
  const { pin } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [spotifyReady, setSpotifyReady] = useState(false);
  const [spotifyPlayer, setSpotifyPlayer] = useState<any>(null);
  const [token, setToken] = useState<string>("");
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!pin) return;

    fetchRoom();
    const interval = setInterval(fetchRoom, 3000);

    // Load Spotify Web Playback SDK
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      setSpotifyReady(true);
    };

    return () => {
      clearInterval(interval);
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, [pin]);

  useEffect(() => {
    if (spotifyReady && session?.accessToken) {
      initializeSpotifyPlayer(session.accessToken);
    }
  }, [spotifyReady, session]);

  const initializeSpotifyPlayer = (accessToken: string) => {
    const player = new (window as any).Spotify.Player({
      name: "CronoMusica Host",
      getOAuthToken: (cb: (token: string) => void) => {
        cb(accessToken);
      },
      volume: 0.5,
    });

    player.addListener("ready", ({ device_id }: { device_id: string }) => {
      console.log("Ready with Device ID", device_id);
      setSpotifyPlayer(player);
      playerRef.current = player;
    });

    player.addListener("not_ready", ({ device_id }: { device_id: string }) => {
      console.log("Device ID has gone offline", device_id);
    });

    player.connect();
  };

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
      console.error("Error fetching room:", err);
    }
  };

  const startRound = async () => {
    try {
      const response = await fetch(`/api/rooms/${pin}/rounds`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to start round");
      }

      const data = await response.json();
      setCurrentSong(data);
      setTimeRemaining(data.timeLimit);

      // Play song on Spotify
      if (spotifyPlayer && data.spotifyUri) {
        await spotifyPlayer.activateElement();
        await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${spotifyPlayer._options.id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              uris: [data.spotifyUri],
              position_ms: 0,
            }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.accessToken}`,
            },
          }
        );
        setIsPlaying(true);
      }

      // Start countdown
      const countdownInterval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error("Error starting round:", err);
    }
  };

  const togglePlayback = async () => {
    if (!spotifyPlayer) return;

    try {
      const state = await spotifyPlayer.player.getState();
      if (!state) return;

      if (state.paused) {
        await spotifyPlayer.resume();
        setIsPlaying(true);
      } else {
        await spotifyPlayer.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Error toggling playback:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg">
          Room not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">{room.name}</h1>
            <p className="text-purple-200">
              Ronda {room.currentRound} de {room.maxRounds}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
            <Users className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">{room.players.length}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Song Controls */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <MusicIcon className="w-6 h-6" />
              Canción Actual
            </h2>

            {!currentSong ? (
              <div className="text-center py-12">
                <p className="text-purple-200 mb-4">Esperando iniciar ronda...</p>
                <button
                  onClick={startRound}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                >
                  <Play className="w-5 h-5" />
                  Iniciar Ronda
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-white/5 rounded-xl p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-white font-semibold">
                      Fragmento #{room.currentRound}
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      {timeRemaining}s
                    </div>
                  </div>

                  <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(timeRemaining / 30) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={togglePlayback}
                      className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white" />
                      )}
                    </button>
                    <button
                      onClick={startRound}
                      className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
                    >
                      <SkipForward className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>

                <div className="text-center text-purple-200 text-sm">
                  El audio se reproduce desde tu cuenta de Spotify
                </div>
              </div>
            )}
          </div>

          {/* Right: Leaderboard */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Leaderboard
            </h2>

            <div className="space-y-3">
              {room.players
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-3 bg-white/5 rounded-lg p-3 border ${
                      index === 0 ? "border-yellow-500" : "border-white/10"
                    }`}
                  >
                    <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold">{player.name}</div>
                      {player.streak >= 2 && (
                        <div className="text-green-400 text-sm">
                          🔥 {player.streak} racha
                        </div>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-white">{player.score}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MusicIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
