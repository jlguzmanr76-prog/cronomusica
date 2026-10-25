"use client";

import { signIn } from "next-auth/react";
import { Music4 } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Music4 className="w-20 h-20 text-green-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">CronoMusica</h1>
          <p className="text-purple-200">Inicia sesión para crear una sala</p>
        </div>

        <button
          onClick={() => signIn("spotify")}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-3"
        >
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719.9.419 1.38-.299.42-.899.6-1.38.3z" />
          </svg>
          Iniciar con Spotify
        </button>

        <p className="mt-6 text-purple-300 text-sm">
          Requiere cuenta Spotify Premium
        </p>
      </div>
    </div>
  );
}
