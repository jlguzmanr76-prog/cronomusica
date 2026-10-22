"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Music4, Users, Filter, Trophy } from "lucide-react";

type GameMode = "TIMELINE" | "TIMELINE_NO_TIME";

export default function CreateRoomPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    gameMode: "TIMELINE" as GameMode,
    genreFilter: [] as string[],
    countryFilter: "",
    maxRounds: 10,
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/api/auth/signin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create room");
      }

      const room = await response.json();
      router.push(`/host/room/${room.pin}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const genres = [
    "rock",
    "pop",
    "latin",
    "reggaeton",
    "cumbia",
    "folk",
    "salsa",
    "dance",
  ];

  const toggleGenre = (genre: string) => {
    setFormData((prev) => ({
      ...prev,
      genreFilter: prev.genreFilter.includes(genre)
        ? prev.genreFilter.filter((g) => g !== genre)
        : [...prev.genreFilter, genre],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Crear Nueva Sala</h1>
          <p className="text-purple-200">Configura tu partida de CronoMusica</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Room Name */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">Nombre de la Sala</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: Cumpleaños de Juan"
              required
            />
          </div>

          {/* Game Mode */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Modo de Juego
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gameMode: "TIMELINE" })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.gameMode === "TIMELINE"
                    ? "border-green-500 bg-green-500/20"
                    : "border-white/20 bg-white/5 hover:border-white/40"
                }`}
              >
                <div className="text-white font-semibold mb-1">Cronológico</div>
                <div className="text-sm text-purple-200">Tiempo = Puntos</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gameMode: "TIMELINE_NO_TIME" })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.gameMode === "TIMELINE_NO_TIME"
                    ? "border-green-500 bg-green-500/20"
                    : "border-white/20 bg-white/5 hover:border-white/40"
                }`}
              >
                <div className="text-white font-semibold mb-1">Sin Tiempo</div>
                <div className="text-sm text-purple-200">Sin bonus de velocidad</div>
              </button>
            </div>
          </div>

          {/* Genre Filter */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Géneros (opcional)
            </label>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    formData.genreFilter.includes(genre)
                      ? "bg-green-500 text-white"
                      : "bg-white/10 text-purple-200 hover:bg-white/20"
                  }`}
                >
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Max Rounds */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">Número de Rondas</label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.maxRounds}
              onChange={(e) => setFormData({ ...formData, maxRounds: parseInt(e.target.value) })}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-lg text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creando sala...
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                Crear Sala
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
