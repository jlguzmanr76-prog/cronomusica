"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Music4, ArrowRight } from "lucide-react";

export default function JoinPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate PIN
      if (pin.length !== 4 || !/^\d+$/.test(pin)) {
        throw new Error("El PIN debe tener 4 dígitos");
      }

      // Validate name
      if (playerName.trim().length < 2) {
        throw new Error("El nombre debe tener al menos 2 caracteres");
      }

      // Generate device ID (simple version)
      const deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);

      // Join room
      const response = await fetch(`/api/rooms/${pin}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: playerName.trim(),
          deviceId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to join room");
      }

      // Store player info in localStorage
      localStorage.setItem("playerId", deviceId);
      localStorage.setItem("playerName", playerName.trim());
      localStorage.setItem("roomPin", pin);

      router.push(`/game/${pin}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Music4 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">CronoMusica</h1>
          <p className="text-purple-200">Únete a una sala</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* PIN Input */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">PIN de la Sala</label>
            <input
              type="text"
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPin(value);
              }}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-center text-3xl tracking-widest placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0000"
              maxLength={4}
              required
            />
          </div>

          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">Tu Nombre</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: Juan"
              required
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
                Uniéndose...
              </>
            ) : (
              <>
                Unirse a la Sala
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Info */}
        <p className="mt-6 text-center text-purple-300 text-sm">
          Pide al host el PIN de 4 dígitos de la sala
        </p>
      </div>
    </div>
  );
}
