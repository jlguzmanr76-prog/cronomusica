import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleSongs = [
  // Rock Classics
  {
    spotifyId: "spotify:track:0VjIjW4GlUZAMYd2vXMi3b",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    durationMs: 354000,
    spotifyUri: "spotify:track:0VjIjW4GlUZAMYd2vXMi3b",
    popularity: 85,
    releaseYear: 1975,
    genre: ["rock", "classic-rock"],
    country: "GB",
    isVerified: true,
  },
  {
    spotifyId: "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp",
    title: "Stairway to Heaven",
    artist: "Led Zeppelin",
    album: "Led Zeppelin IV",
    durationMs: 482000,
    spotifyUri: "spotify:track:3n3Ppam7vgaVa1iaRUc9Lp",
    popularity: 88,
    releaseYear: 1971,
    genre: ["rock", "classic-rock"],
    country: "GB",
    isVerified: true,
  },
  {
    spotifyId: "spotify:track:432tMhKmXOZVrCkYR8x5Ih",
    title: "Hotel California",
    artist: "Eagles",
    album: "Hotel California",
    durationMs: 391000,
    spotifyUri: "spotify:track:432tMhKmXOZVrCkYR8x5Ih",
    popularity: 86,
    releaseYear: 1976,
    genre: ["rock", "classic-rock"],
    country: "US",
    isVerified: true,
  },

  // Pop Hits
  {
    spotifyId: "spotify:track:4iV5W9uYEdYUVa79Axb7Rh",
    title: "Billie Jean",
    artist: "Michael Jackson",
    album: "Thriller",
    durationMs: 294000,
    spotifyUri: "spotify:track:4iV5W9uYEdYUVa79Axb7Rh",
    popularity: 90,
    releaseYear: 1982,
    genre: ["pop", "r&b"],
    country: "US",
    isVerified: true,
  },
  {
    spotifyId: "spotify:track:2u6cNcwu6y1B7CwUoPeVbR",
    title: "Despacito",
    artist: "Luis Fonsi",
    album: "Vida",
    durationMs: 229000,
    spotifyUri: "spotify:track:2u6cNcwu6y1B7CwUoPeVbR",
    popularity: 92,
    releaseYear: 2017,
    genre: ["pop", "latin", "reggaeton"],
    country: "PR",
    isVerified: true,
  },
  {
    spotifyId: "spotify:track:7hWQlnfPbOq1Z8rxFk6PqS",
    title: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷ (Divide)",
    durationMs: 234000,
    spotifyUri: "spotify:track:7hWQlnfPbOq1Z8rxFk6PqS",
    popularity: 91,
    releaseYear: 2017,
    genre: ["pop"],
    country: "GB",
    isVerified: true,
  },

  // Latin/Reggaeton
  {
    spotifyId: "spotify:track:3jju01WJuFXDlS8mt5CnPw",
    title: "Dákiti",
    artist: "Bad Bunny",
    album: "El Último Tour del Mundo",
    durationMs: 209000,
    spotifyUri: "spotify:track:3jju01WJuFXDlS8mt5CnPw",
    popularity: 89,
    releaseYear: 2020,
    genre: ["latin", "reggaeton", "trap"],
    country: "PR",
    isVerified: true,
  },
  {
    spotifyId: "spotify:track:1pKYYYldlMrT3k4XS3WR3I",
    title: "Mi Gente",
    artist: "J Balvin",
    album: "Vibras",
    durationMs: 196000,
    spotifyUri: "spotify:track:1pKYYYldlMrT3k4XS3WR3I",
    popularity: 87,
    releaseYear: 2017,
    genre: ["latin", "reggaeton"],
    country: "CO",
    isVerified: true,
  },
  {
    spotifyId: "spotify:track:5WTAqJc7rxSJPfR8DZ1ZQl",
    title: "Bichota",
    artist: "KAROL G",
    album: "KG0516",
    durationMs: 199000,
    spotifyUri: "spotify:track:5WTAqJc7rxSJPfR8DZ1ZQl",
    popularity: 85,
    releaseYear: 2021,
    genre: ["latin", "reggaeton"],
    country: "CO",
    isVerified: true,
  },

  // Cumbia
  {
    spotifyId: "spotify:track:5VhCk2Kk4YF2V6t2r1T7pP",
    title: "La Cumbia Cienaguera",
    artist: "Aníbal Velásquez",
    album: "Cumbias de Oro",
    durationMs: 180000,
    spotifyUri: "spotify:track:5VhCk2Kk4YF2V6t2r1T7pP",
    popularity: 70,
    releaseYear: 1960,
    genre: ["cumbia", "latin"],
    country: "CO",
    isVerified: true,
  },
  {
    spotifyId: "spotify:track:7gHs0q2s9j1Y8aM3f4r5tT",
    title: "La Vida es un Carnaval",
    artist: "Celia Cruz",
    album: "Regalo del Alma",
    durationMs: 220000,
    spotifyUri: "spotify:track:7gHs0q2s9j1Y8aM3f4r5tT",
    popularity: 75,
    releaseYear: 2000,
    genre: ["salsa", "latin"],
    country: "CU",
    isVerified: true,
  },

  // Chilean Hits
  {
    spotifyId: "spotify:track:4b8F1Q4R5S6T7U8V9W0X",
    title: "Gracias a la Vida",
    artist: "Violeta Parra",
    album: "Las Últimas Composiciones",
    durationMs: 198000,
    spotifyUri: "spotify:track:4b8F1Q4R5S6T7U8V9W0X",
    popularity: 72,
    releaseYear: 1966,
    genre: ["folk", "chilean"],
    country: "CL",
    isVerified: true,
  },
  {
    spotifyId: "spotify:track:1B2C3D4E5F6G7H8I9J0K",
    title: "Tengo Todo Contigo",
    artist: "Los Ángeles Azules",
    album: "Los Ángeles Azules",
    durationMs: 240000,
    spotifyUri: "spotify:track:1B2C3D4E5F6G7H8I9J0K",
    popularity: 78,
    releaseYear: 1996,
    genre: ["cumbia", "latin"],
    country: "MX",
    isVerified: true,
  },

  // Modern Pop/Rock
  {
    spotifyId: "spotify:track:7qiZfU4dY1lWllzX7mPBI",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    durationMs: 200000,
    spotifyUri: "spotify:track:7qiZfU4dY1lWllzX7mPBI",
    popularity: 93,
    releaseYear: 2019,
    genre: ["pop", "synth-pop"],
    country: "CA",
    isVerified: true,
  },
  {
    spotifyId: "spotify:track:1B2f3g4h5i6j7k8l9m0n",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    durationMs: 203000,
    spotifyUri: "spotify:track:1B2f3g4h5i6j7k8l9m0n",
    popularity: 91,
    releaseYear: 2020,
    genre: ["pop", "disco"],
    country: "GB",
    isVerified: true,
  },

  // Argentine Rock
  {
    spotifyId: "spotify:track:2c3d4e5f6g7h8i9j0k1l",
    title: "Muchacha",
    artist: "Sui Generis",
    album: "Vida",
    durationMs: 260000,
    spotifyUri: "spotify:track:2c3d4e5f6g7h8i9j0k1l",
    popularity: 76,
    releaseYear: 1973,
    genre: ["rock", "argentine-rock"],
    country: "AR",
    isVerified: true,
  },
  {
    spotifyId: "spotify:track:3d4e5f6g7h8i9j0k1l2m",
    title: "She Wolf",
    artist: "Shakira",
    album: "She Wolf",
    durationMs: 217000,
    spotifyUri: "spotify:track:3d4e5f6g7h8i9j0k1l2m",
    popularity: 84,
    releaseYear: 2009,
    genre: ["pop", "latin", "dance"],
    country: "CO",
    isVerified: true,
  },

  // Spanish Pop
  {
    spotifyId: "spotify:track:4e5f6g7h8i9j0k1l2m3n",
    title: "A Dios le Pido",
    artist: "Juanes",
    album: "Un Día Normal",
    durationMs: 201000,
    spotifyUri: "spotify:track:4e5f6g7h8i9j0k1l2m3n",
    popularity: 82,
    releaseYear: 2002,
    genre: ["pop", "rock", "latin"],
    country: "CO",
    isVerified: true,
  },
  {
    spotifyId: "spotify:track:5f6g7h8i9j0k1l2m3n4o",
    title: "Adiós",
    artist: "Ricky Martin",
    album: "A Quien Quiera Escuchar",
    durationMs: 225000,
    spotifyUri: "spotify:track:5f6g7h8i9j0k1l2m3n4o",
    popularity: 79,
    releaseYear: 2015,
    genre: ["pop", "latin"],
    country: "PR",
    isVerified: true,
  },
];

async function main() {
  console.log("🎵 Starting seed...");

  // Delete existing songs (optional - comment out if you want to keep existing data)
  await prisma.song.deleteMany();
  console.log("🗑️  Cleared existing songs");

  // Insert sample songs
  for (const song of sampleSongs) {
    try {
      await prisma.song.create({
        data: song,
      });
      console.log(`✅ Added: ${song.title} - ${song.artist} (${song.releaseYear})`);
    } catch (error) {
      console.error(`❌ Error adding ${song.title}:`, error);
    }
  }

  console.log(`🎉 Seed completed! Added ${sampleSongs.length} songs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
