# CronoMusica - Music Trivia Party Game
## Estado del Proyecto y Plan de Acción

---

## 📋 Visión del Producto

Juego de trivia musical inspirado en Hitster y Timeline, con dinámica competitiva en tiempo real estilo Kahoot! y Jackbox Games.

- **Arquitectura**: Host/Móvil (un dispositivo reproduce, todos juegan desde sus celulares)
- **Mecánica**: Todos posicionan canciones en una línea de tiempo cronológica simultáneamente
- **Audio**: Spotify Premium del Host (reproduce fragmentos sin revelar datos)
- **Jugadores**: Se unen con QR o PIN desde su navegador (sin cuenta de Spotify)

---

## 🛠 Stack Tecnológico Confirmado

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Estilos**: Tailwind CSS + Lucide React
- **Base de Datos**: PostgreSQL (Neon Serverless) + Prisma ORM
- **Autenticación**: NextAuth.js v4 (Spotify OAuth 2.0 solo para Host)
- **Real-time**: Pusher Channels (WebSockets)
- **Hosting**: Vercel (Frontend + API Routes) + Neon DB

---

## ✅ Fase 1 Completada (Oct 20, 2026)

### 1. Schema de Prisma (`prisma/schema.prisma`)

**Entidades creadas:**
- `Song`: Metadatos de canciones (Spotify ID, título, artista, año de MusicBrainz, géneros, país, popularidad)
- `Room`: Salas de juego con filtros (género, país, rondas, puntuación objetivo)
- `Player`: Jugadores con dispositivo móvil, score, streak (racha de aciertos)
- `RoundResult`: Resultados por ronda (posición, puntos, bonus velocidad, multiplicador)
- Modelos NextAuth: Account, Session, User, VerificationToken

**Enums:**
- `RoomStatus`: WAITING, ACTIVE, COMPLETED
- `SongFilterType`: POPULAR, ALL, CUSTOM

### 2. Tipos TypeScript para Pusher (`src/types/pusher-events.ts`)

**Eventos WebSocket estructurados:**
- **Gestión de Salas**: room-created, player-join, player-joined, player-left
- **Estado del Juego**: game-start, game-started, game-ended
- **Eventos de Ronda**: round-started, round-countdown, submit-guess, round-reveal
- **Timeline**: timeline-update
- **Playback**: playback-started, playback-ended
- **Errores**: error

### 3. Configuración NextAuth v4 con Spotify OAuth

**Archivos creados:**
- `src/lib/auth.ts`: Configuración completa con Spotify Provider, refresh token automático, scopes para playback SDK
- `src/app/api/auth/[...nextauth]/route.ts`: API route handler
- `src/lib/prisma.ts`: Singleton de Prisma Client
- `src/lib/pusher.ts`: Cliente servidor y cliente de Pusher
- `.env.example`: Plantilla de variables de entorno

**Spotify Scopes configurados:**
- user-read-email, user-read-private
- user-library-read
- user-read-playback-state, user-modify-playback-state
- user-read-currently-playing
- app-remote-control, streaming

### 4. Estructura del Proyecto

```
cronomusica/
├── prisma/
│   └── schema.prisma          # Schema de base de datos
├── src/
│   ├── app/
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts
│   ├── lib/
│   │   ├── auth.ts            # Configuración NextAuth
│   │   ├── prisma.ts          # Prisma Client singleton
│   │   └── pusher.ts          # Pusher server/client
│   └── types/
│       └── pusher-events.ts   # Tipos de eventos WebSocket
├── .env.example               # Template de variables de entorno
└── package.json
```

---

## ✅ Fase 2: Configuración de Servicios Externos (COMPLETADA)

### Cuenta configurada: jlguzmanr76@gmail.com

#### 2.1 Neon PostgreSQL - ✅ COMPLETADO
- [x] Crear cuenta en https://neon.tech con jlguzmanr76@gmail.com
- [x] Crear proyecto: `cronomusica`
- [x] Obtener connection string (DATABASE_URL)
- [x] Configurar en .env.local
- **Connection String**: `postgresql://neondb_owner:npg_dJ7RgMBCGH5v@ep-holy-boat-b7mty21n-pooler.c-13.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

#### 2.2 Spotify Developer - ✅ COMPLETADO
- [x] Crear cuenta en https://developer.spotify.com/dashboard
- [x] Crear nueva app: "CronoMusica"
- [x] Configurar Redirect URIs:
  - https://cronomusica.vercel.app/api/auth/callback/spotify
- [x] Obtener Client ID y Client Secret
- [x] Configurar en .env.local y Vercel
- **Client ID**: `a870fe0f80f34a59bff16495e97a9e11`
- **Client Secret**: `d21fee663db04065919b421d7105e749`

#### 2.3 Pusher Channels - ✅ COMPLETADO
- [x] Crear cuenta en https://pusher.com/channels
- [x] Crear nueva app: "CronoMusica"
- [x] Obtener App ID, Key, Secret, Cluster
- [x] Configurar en .env.local y Vercel
- **App ID**: `2203913`
- **Key**: `7f27652b7d658dc4d45e`
- **Secret**: `d3c61060e8b738acdde1`
- **Cluster**: `us2`

#### 2.4 Variables de Entorno - ✅ COMPLETADO
- [x] Crear `.env.local` con todas las credenciales
- [x] Generar NEXTAUTH_SECRET: `/d4689nfzQpUnsKXit8l2m9TCwuwzUEcRlZXcjeuaYo=`
- [x] Configurar todas las variables en Vercel
- [x] NEXTAUTH_URL actualizado a: `https://cronomusica.vercel.app`

#### 2.5 GitHub y Vercel - ✅ COMPLETADO
- [x] Crear cuenta GitHub: jlguzmanr76-prog
- [x] Subir código a GitHub: https://github.com/jlguzmanr76-prog/cronomusica
- [x] Crear proyecto en Vercel
- [x] Conectar repo de GitHub a Vercel
- [x] Deploy exitoso: https://cronomusica.vercel.app
- [x] Corregir errores de build (Prisma, TypeScript, Pusher)
- [x] Downgrade Prisma de v8 a v5 (versión estable)
- [x] Temporalmente deshabilitar Prisma adapter (usando JWT por ahora)

---

## 📝 Fase 3: Migraciones y Testing (COMPLETADA)

### 3.1 Base de Datos
- [x] Ejecutar: `npx prisma migrate dev --name init`
- [x] Ejecutar: `npx prisma migrate dev --name add_game_mode`
- [x] Verificar tablas creadas en Neon dashboard
- [x] Prisma Client generado correctamente

### 3.2 Testing de Conexión
- [x] Verificar Prisma Client funciona correctamente
- [x] Migraciones aplicadas exitosamente

### 3.3 Prisma Adapter
- [x] Prisma adapter deshabilitado (causa build issues en Vercel)
- [x] Usando JWT adapter para sesiones
- [x] Database tables existentes para uso directo con Prisma queries

---

## 🔮 Fase 4: API Routes Core (COMPLETADA)

### 4.1 Gestión de Salas
- [x] `POST /api/rooms` - Crear nueva sala (requiere auth)
- [x] `GET /api/rooms/[pin]` - Obtener información de sala
- [x] `POST /api/rooms/[pin]/join` - Unirse a sala (jugadores)
- [x] `POST /api/rooms/[pin]/start` - Iniciar juego (solo host)

### 4.2 Gestión de Rondas
- [x] `POST /api/rooms/[pin]/rounds` - Iniciar nueva ronda
- [x] `POST /api/rooms/[pin]/rounds/guess` - Enviar respuesta del jugador
- [ ] `GET /api/rooms/[pin]/rounds/[roundId]/results` - Obtener resultados de ronda

### 4.3 Integración Pusher
- [x] Implementar triggers de eventos en API routes
- [x] Eventos: room-created, player-joined, game-started, round-started, round-reveal
- [ ] Testing de eventos WebSocket en tiempo real

---

## 🎨 Fase 5: Frontend (Pendiente)

### 5.1 Páginas Host
- [ ] Landing page con botón "Crear Sala"
- [ ] Login con Spotify (solo host)
- [ ] Sala de espera (mostrar QR/PIN)
- [ ] Pantalla de juego (reproducir audio, mostrar leaderboard)
- [ ] Pantalla de resultados finales

### 5.2 Páginas Jugadores (Mobile-first)
- [ ] Pantalla de unión (ingresar PIN y nombre)
- [ ] Pantalla de espera
- [ ] Timeline interactivo (drag & drop para posicionar canción)
- [ ] Feedback de respuesta (correcto/incorrecto, puntos ganados)
- [ ] Leaderboard en tiempo real

### 5.3 Componentes
- [ ] TimelineCard (carta de canción)
- [ ] TimelineRow (fila horizontal de cartas)
- [ ] Leaderboard
- [ ] Countdown timer
- [ - QR Code generator

---

## 📊 Fase 6: Lógica de Juego (Pendiente)

### 6.1 Scoring System
- [ ] Implementar cálculo de puntos base por acierto
- [ ] Implementar bonus por velocidad
- [ ] Implementar multiplicador por racha (streak)
- [ ] Lógica de condición de victoria (rondas o puntuación)

### 6.2 Selección de Canciones
- [ ] Algoritmo de filtrado por género/país
- [ ] Algoritmo de filtrado por popularidad
- [ ] Random selection con pesos
- [ ] Evitar repetición de canciones en misma sesión

### 6.3 MusicBrainz Integration
- [ ] API client para obtener first-release-date
- [ ] Caché de resultados en DB
- [ ] Fallback a Spotify release year si MusicBrainz falla

---

## 🎵 Fase 7: Spotify Web Playback SDK (Pendiente)

- [ ] Integrar Spotify Web Playback SDK en página del host
- [ ] Manejo de tokens de acceso OAuth
- [ ] Reproducción de fragmentos (30s)
- [ ] Control de play/pause/volume
- [ ] Manejo de errores de playback

---

## 🧪 Fase 8: Testing y Debugging (Pendiente)

- [ ] Testing unitario de lógica de scoring
- [ ] Testing de integración con APIs externas
- [ ] Testing de WebSocket con múltiples clientes
- [ ] Testing de responsive design (móviles)
- [ ] Load testing (múltiples jugadores simultáneos)

---

## 🚀 Fase 9: Deploy a Producción (Pendiente)

- [ ] Configurar proyecto en Vercel
- [ ] Conectar a GitHub repository
- [ ] Configurar variables de entorno en Vercel
- [ ] Deploy inicial
- [ ] Testing en producción
- [ ] Configurar dominio personalizado (opcional)

---

## 📌 Notas Importantes

### Separación de Proyectos
- Este proyecto usa cuenta separada: jlguzmanr76@gmail.com
- Independiente de otras apps en producción
- Credenciales nuevas para Neon, Spotify, Pusher, Vercel

### Variables de Entorno Críticas
- `DATABASE_URL`: Connection string de Neon
- `SPOTIFY_CLIENT_ID`: De Spotify Developer Dashboard
- `SPOTIFY_CLIENT_SECRET`: De Spotify Developer Dashboard
- `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`: De Pusher
- `NEXTAUTH_SECRET`: Generar con `openssl rand -base64 32`
- `NEXTAUTH_URL`: http://localhost:3000 (local) o dominio de Vercel (prod)

### Próximo Paso Inmediato
**Completar Fase 2.1**: Crear cuenta de Neon y obtener connection string.

---

## 📞 Para Continuar en Otro Chat

1. Este archivo `PROJECT_STATUS.md` contiene todo el contexto
2. El stack está configurado y los archivos base creados
3. Próxima tarea: Configurar servicios externos (Neon, Spotify, Pusher)
4. Después: Ejecutar migraciones de Prisma
5. Luego: Implementar API routes

**Pregunta clave para continuar**: ¿En qué fase quedamos? (Revisar checklist de la fase correspondiente)
