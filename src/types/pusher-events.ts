// Base event structure
export interface PusherEvent<T = any> {
  event: string;
  data: T;
}

// ============ ROOM MANAGEMENT EVENTS ============

// Client -> Server: Create a new room
export interface RoomCreatedEvent {
  roomId: string;
  pin: string;
  hostName: string;
  settings: {
    genreFilter: string[];
    countryFilter: string | null;
    maxRounds: number;
    targetScore: number | null;
    songFilterType: 'POPULAR' | 'ALL' | 'CUSTOM';
  };
}

// Server -> All: Room created successfully
export interface RoomCreatedResponse {
  roomId: string;
  pin: string;
  hostName: string;
  status: 'WAITING';
}

// Client -> Server: Player joins room
export interface PlayerJoinEvent {
  pin: string;
  playerName: string;
  deviceId: string;
}

// Server -> All: Player joined
export interface PlayerJoinedEvent {
  playerId: string;
  playerName: string;
  isHost: boolean;
  playerCount: number;
}

// Server -> All: Player left
export interface PlayerLeftEvent {
  playerId: string;
  playerName: string;
  playerCount: number;
}

// ============ GAME STATE EVENTS ============

// Host -> Server: Start the game
export interface GameStartEvent {
  roomId: string;
}

// Server -> All: Game started
export interface GameStartedEvent {
  currentRound: number;
  totalRounds: number;
}

// Server -> All: Game ended
export interface GameEndedEvent {
  winner: {
    playerId: string;
    playerName: string;
    score: number;
  };
  finalRankings: Array<{
    playerId: string;
    playerName: string;
    score: number;
  }>;
}

// ============ ROUND EVENTS ============

// Server -> All: New round started (song info for host only)
export interface RoundStartedEvent {
  roundNumber: number;
  songId: string;
  songDuration: number; // in seconds
  timeLimit: number; // in seconds
  // Host gets Spotify URI to play
  spotifyUri?: string;
  // Players don't get song info
}

// Server -> All: Countdown for round
export interface RoundCountdownEvent {
  timeRemaining: number; // seconds
}

// ============ PLAYER GUESS EVENTS ============

// Player -> Server: Submit timeline position guess
export interface SubmitGuessEvent {
  roomId: string;
  playerId: string;
  roundNumber: number;
  placedPosition: number; // Position in player's timeline (0-indexed)
  responseTimeMs: number;
}

// Server -> All: All guesses submitted (reveal answer)
export interface RoundRevealEvent {
  roundNumber: number;
  song: {
    title: string;
    artist: string;
    releaseYear: number;
    albumCover?: string;
  };
  correctPosition: number;
  playerResults: Array<{
    playerId: string;
    playerName: string;
    placedPosition: number;
    isCorrect: boolean;
    points: number;
    speedBonus: number;
    streakMultiplier: number;
    totalPoints: number;
    responseTimeMs: number;
  }>;
  currentRankings: Array<{
    playerId: string;
    playerName: string;
    score: number;
    position: number;
  }>;
}

// ============ ERROR EVENTS ============

export interface ErrorEvent {
  message: string;
  code?: string;
}

// ============ TIMELINE SYNC EVENTS ============

// Server -> Player: Update player's timeline state
export interface TimelineUpdateEvent {
  playerId: string;
  timeline: Array<{
    songId: string;
    title: string;
    artist: string;
    releaseYear: number;
    position: number;
  }>;
}

// ============ HOST PLAYBACK EVENTS ============

// Host -> Server: Notify song playback started
export interface PlaybackStartedEvent {
  songId: string;
  startTime: number; // Unix timestamp
}

// Host -> Server: Notify song playback ended
export interface PlaybackEndedEvent {
  songId: string;
  duration: number; // Actual playback duration
}

// ============ EXPORT TYPE UNION ============

export type PusherEventData =
  | RoomCreatedResponse
  | PlayerJoinedEvent
  | PlayerLeftEvent
  | GameStartedEvent
  | GameEndedEvent
  | RoundStartedEvent
  | RoundCountdownEvent
  | RoundRevealEvent
  | TimelineUpdateEvent
  | ErrorEvent;

// Event names constants
export const EVENT_NAMES = {
  // Room management
  ROOM_CREATED: 'room-created',
  PLAYER_JOIN: 'player-join',
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',

  // Game state
  GAME_START: 'game-start',
  GAME_STARTED: 'game-started',
  GAME_ENDED: 'game-ended',

  // Round events
  ROUND_STARTED: 'round-started',
  ROUND_COUNTDOWN: 'round-countdown',
  SUBMIT_GUESS: 'submit-guess',
  ROUND_REVEAL: 'round-reveal',

  // Timeline
  TIMELINE_UPDATE: 'timeline-update',

  // Playback
  PLAYBACK_STARTED: 'playback-started',
  PLAYBACK_ENDED: 'playback-ended',

  // Error
  ERROR: 'error',
} as const;

export type EventName = typeof EVENT_NAMES[keyof typeof EVENT_NAMES];
