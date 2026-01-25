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
  createdAt: string;
  status: RoomStatus;
  gameState: GameState;
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

export interface CreateRoomResponse {
  room: Room;
  message?: string;
}

export interface JoinRoomResponse {
  room: Room;
  playerId: number;
}

export interface LeaveRoomResponse {
  roomDeleted: boolean;
  room?: Room;
  message?: string;
}

export interface DeleteRoomResponse {
  message: string;
}

export interface GetRoomResponse {
  room: Room;
}

export interface GetAvailableRoomsResponse {
  rooms: Room[];
}
