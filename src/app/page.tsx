import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Music4, Users, Clock } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (session) {
    router.push("/host/create-room");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        {/* Logo/Title */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music4 className="w-16 h-16 text-green-400" />
            <h1 className="text-6xl font-bold text-white">CronoMusica</h1>
          </div>
          <p className="text-xl text-purple-200">
            ¡Coloca las canciones en su lugar correcto en la línea del tiempo!
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <Users className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Juega con Amigos</h3>
            <p className="text-purple-200">
              Invita a tus amigos con un código PIN. ¡Todos juegan desde sus celulares!
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <Clock className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Tiempo Real</h3>
            <p className="text-purple-200">
              Compétete simultáneamente. ¡El más rápido gana más puntos!
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <Music4 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Tu Música</h3>
            <p className="text-purple-200">
              Usa Spotify Premium para reproducir fragmentos de tus canciones favoritas.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => router.push("/api/auth/signin")}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/50"
        >
          Crear Sala con Spotify
        </button>

        {/* Info */}
        <p className="mt-6 text-purple-300 text-sm">
          Requiere cuenta Spotify Premium para el host
        </p>
      </div>
    </div>
  );
}
