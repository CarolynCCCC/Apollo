import crypto from 'node:crypto';
import {
  CreateRoomRequest,
  JoinRoomRequest,
  LeaveRoomRequest,
  Room,
} from '../model/room';
import { OptionalCharacter } from '../model/role';
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  OPTIONAL_CHARACTERS,
  PLAYER_ALIGNMENT_COUNT,
  ROLES,
} from '../constant/roles';
import { ERROR_MESSAGES, ROOM_STATUS } from '../constant/api';
import { WS_MESSAGE_TYPES } from '../constant/websocket';
import config from '../config/config';
import RoomState from '../state/RoomState';
import GameSocket from '../ws/GameSocket';
import { createInitialGameState } from '../utils/gameStateUtils';

interface ICleanupService {
  clearWarning(playerId: number, roomId: string): void;
}

class RoomService {
  private static instance: RoomService;
  private cleanupService?: ICleanupService;

  private constructor() {}

  static getInstance(): RoomService {
    if (!RoomService.instance) {
      RoomService.instance = new RoomService();
    }
    return RoomService.instance;
  }

  setCleanupService(cleanupService: ICleanupService): void {
    this.cleanupService = cleanupService;
  }

  createRoom(request: CreateRoomRequest): { room: Room; message?: string } {
    this.validateCreateRoomRequest(request);

    const roomId = this.generateRoomId();
    const numberOfPlayers = request.numberOfPlayers;
    const variablePlayers = numberOfPlayers === undefined;

    const validation = this.validateOptionalCharacters(
      request.optionalCharacters || [],
      numberOfPlayers,
    );

    const room: Room = {
      id: roomId,
      hostId: 1,
      nextPlayerId: 1,
      players: [],
      config: {
        numberOfPlayers,
        variablePlayers,
        minPlayers: validation.minPlayers,
        maxPlayers: MAX_PLAYERS,
        optionalCharacters: validation.validCharacters,
        optionalRules: request.optionalRules || {},
      },
      createdAt: new Date(),
      status: ROOM_STATUS.LOBBY,
      gameState: createInitialGameState(roomId),
    };

    RoomState.addRoom(room);
    return { room, message: validation.message };
  }

  getRoom(roomId: string): Room | undefined {
    return RoomState.getRoom(roomId);
  }

  deleteRoom(roomId: string): boolean {
    return RoomState.deleteRoom(roomId);
  }

  deleteRoomByHost(hostId: number, roomId: string): void {
    const room = RoomState.getRoom(roomId);

    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    if (room.hostId !== hostId) {
      throw new Error(ERROR_MESSAGES.NOT_HOST);
    }

    if (room.status === ROOM_STATUS.IN_PROGRESS) {
      throw new Error(ERROR_MESSAGES.CANNOT_DELETE_IN_PROGRESS);
    }

    room.players.forEach((player) => {
      GameSocket.disconnectPlayer(player.id, roomId);
    });

    GameSocket.broadcastToRoom(roomId, {
      type: WS_MESSAGE_TYPES.ROOM_DELETED,
      reason: 'room_deleted',
      message: 'Room has been deleted by the host',
    });

    RoomState.deleteRoom(roomId);
  }

  joinRoom(request: JoinRoomRequest): { room: Room; playerId: number } {
    let room: Room | undefined;

    if (request.roomId) {
      room = RoomState.getRoom(request.roomId);
      if (!room) {
        throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
      }
    } else {
      room = this.findAvailableRoom();
      if (!room) {
        throw new Error(ERROR_MESSAGES.NO_AVAILABLE_ROOMS);
      }
    }

    if (room.status !== ROOM_STATUS.LOBBY) {
      throw new Error(ERROR_MESSAGES.GAME_ALREADY_STARTED);
    }

    if (
      room.config.numberOfPlayers &&
      room.players.length >= room.config.numberOfPlayers
    ) {
      throw new Error(ERROR_MESSAGES.ROOM_FULL);
    }

    if (room.players.length >= MAX_PLAYERS) {
      throw new Error(ERROR_MESSAGES.ROOM_FULL);
    }

    const updatedRoom = RoomState.updateRoom(room.id, (room) => {
      const playerId = room.nextPlayerId++;

      room.players.push({
        id: playerId,
        name: request.playerName,
        isConnected: true,
        lastActivity: new Date(),
        ready: false,
      });
    });

    GameSocket.broadcastToRoom(updatedRoom.id, {
      type: WS_MESSAGE_TYPES.PLAYER_JOINED,
      event: 'player_joined',
      playerName: request.playerName,
      room: updatedRoom,
    });

    return { room: updatedRoom, playerId: updatedRoom.nextPlayerId - 1 };
  }

  leaveRoom(request: LeaveRoomRequest): { roomDeleted: boolean; room?: Room } {
    this.validateLeaveRoomRequest(request);

    const room = RoomState.getRoom(request.roomId);
    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    const player = room.players.find((p) => p.id === request.playerId);
    if (!player) {
      throw new Error(ERROR_MESSAGES.PLAYER_NOT_IN_ROOM);
    }

    GameSocket.disconnectPlayer(request.playerId, request.roomId);

    const updatedRoom = RoomState.updateRoom(request.roomId, (room) => {
      room.players = room.players.filter((p) => p.id !== request.playerId);
      if (room.players.length) {
        room.hostId = room.players[0].id;
      }
    });

    if (updatedRoom.players.length === 0) {
      RoomState.deleteRoom(request.roomId);
      return { roomDeleted: true };
    }

    GameSocket.broadcastToRoom(request.roomId, {
      type: WS_MESSAGE_TYPES.PLAYER_LEFT,
      playerName: player.name,
      room: updatedRoom,
    });

    return { roomDeleted: false, room: updatedRoom };
  }

  findAvailableRooms(): Room[] {
    const allRooms = RoomState.getAllRooms();
    const availableRooms: Room[] = [];

    allRooms.forEach((room) => {
      if (
        room.status === ROOM_STATUS.LOBBY ||
        room.status === ROOM_STATUS.FINISHED
      ) {
        const maxPlayers = room.config.numberOfPlayers || MAX_PLAYERS;
        if (room.players.length < maxPlayers) {
          availableRooms.push(room);
        }
      }
    });

    return availableRooms;
  }

  private findAvailableRoom(): Room | undefined {
    const allRooms = RoomState.getAllRooms();

    for (const room of allRooms) {
      if (room.status === ROOM_STATUS.LOBBY) {
        const maxPlayers = room.config.numberOfPlayers || MAX_PLAYERS;
        if (room.players.length < maxPlayers) {
          return room;
        }
      }
    }
    return undefined;
  }

  private validateLeaveRoomRequest(request: LeaveRoomRequest): void {
    if (!request.playerId) {
      throw new Error(ERROR_MESSAGES.PLAYER_ID_REQUIRED);
    }
    if (!request.roomId) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }
  }

  private validateCreateRoomRequest(request: CreateRoomRequest): void {
    const totalRooms = RoomState.getTotalRooms();
    if (totalRooms >= config.maxRooms) {
      throw new Error(ERROR_MESSAGES.MAX_ROOMS_REACHED);
    }

    if (request.numberOfPlayers !== undefined) {
      if (!Number.isInteger(request.numberOfPlayers)) {
        throw new TypeError(ERROR_MESSAGES.PLAYERS_MUST_BE_INTEGER);
      }
      if (
        request.numberOfPlayers < MIN_PLAYERS ||
        request.numberOfPlayers > MAX_PLAYERS
      ) {
        throw new Error(
          `numberOfPlayers must be between ${MIN_PLAYERS} and ${MAX_PLAYERS}`,
        );
      }
    }
  }

  private calculateMinimumPlayers(characters: OptionalCharacter[]): number {
    const goodOptional = characters.filter((c) => c === ROLES.PERCIVAL).length;
    const evilOptional = characters.filter(
      (c) => c === ROLES.MORGANA || c === ROLES.MORDRED || c === ROLES.OBERON,
    ).length;

    for (
      let playerCount = MIN_PLAYERS;
      playerCount <= MAX_PLAYERS;
      playerCount++
    ) {
      const alignment = PLAYER_ALIGNMENT_COUNT[playerCount];
      if (
        alignment.good >= 1 + goodOptional &&
        alignment.evil >= 1 + evilOptional
      ) {
        return playerCount;
      }
    }

    return MAX_PLAYERS;
  }

  private validateOptionalCharacters(
    characters: OptionalCharacter[],
    numberOfPlayers?: number,
  ): {
    validCharacters: OptionalCharacter[];
    minPlayers: number;
    message?: string;
  } {
    const validCharacters = characters.filter((c) =>
      OPTIONAL_CHARACTERS.includes(c),
    );

    if (validCharacters.length === 0) {
      return { validCharacters, minPlayers: MIN_PLAYERS };
    }

    const minPlayersNeeded = this.calculateMinimumPlayers(validCharacters);

    if (numberOfPlayers !== undefined) {
      if (numberOfPlayers < minPlayersNeeded) {
        throw new Error(
          `At least ${minPlayersNeeded} players are required to play with the selected optional characters`,
        );
      }

      const alignment = PLAYER_ALIGNMENT_COUNT[numberOfPlayers];
      const goodOptional = validCharacters.filter(
        (c) => c === ROLES.PERCIVAL,
      ).length;
      const evilOptional = validCharacters.filter(
        (c) => c === ROLES.MORGANA || c === ROLES.MORDRED || c === ROLES.OBERON,
      ).length;

      if (
        alignment.good < 1 + goodOptional ||
        alignment.evil < 1 + evilOptional
      ) {
        throw new Error(
          `Cannot fit selected optional characters with ${numberOfPlayers} players`,
        );
      }

      if (numberOfPlayers === 5 && validCharacters.includes(ROLES.PERCIVAL)) {
        const hasBalancingCharacter =
          validCharacters.includes(ROLES.MORDRED) ||
          validCharacters.includes(ROLES.MORGANA);
        if (!hasBalancingCharacter) {
          throw new Error(ERROR_MESSAGES.PERCIVAL_REQUIRES_BALANCE);
        }
      }
    }

    const message =
      numberOfPlayers === undefined
        ? `A room with at least ${minPlayersNeeded} players is needed to play with the selected characters`
        : undefined;

    return { validCharacters, minPlayers: minPlayersNeeded, message };
  }

  private generateRoomId(): string {
    return crypto.randomBytes(6).toString('base64url');
  }
}

export default RoomService.getInstance();
