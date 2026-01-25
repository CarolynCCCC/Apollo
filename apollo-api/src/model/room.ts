import { Player } from './player';
import { OptionalCharacter } from './role';
import { GameState } from './game';

export type RoomStatus = 'lobby' | 'in_progress' | 'finished' | 'assassin_phase';

export interface GameConfig {
  numberOfPlayers?: number;
  variablePlayers: boolean;
  minPlayers: number;
  maxPlayers: number;
  optionalCharacters: OptionalCharacter[];
  optionalRules: {
    targeting?: boolean;
    ladyOfTheLake?: boolean;
  };
}

export interface Room {
  id: string;
  hostId: number;
  players: Player[];
  config: GameConfig;
  createdAt: Date;
  status: RoomStatus;
  gameState: GameState;
  nextPlayerId: number;
}

export interface CreateRoomRequest {
  numberOfPlayers?: number;
  optionalCharacters?: OptionalCharacter[];
  optionalRules?: {
    targeting?: boolean;
    ladyOfTheLake?: boolean;
  };
}

export interface JoinRoomRequest {
  playerName?: string;
  roomId?: string;
}

export interface LeaveRoomRequest {
  playerId: number;
  roomId: string;
}

export interface UpdateActivityRequest {
  playerId: number;
  roomId: string;
}

export interface DeleteRoomRequest {
  hostId: number;
  roomId: string;
}

