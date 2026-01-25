import RoomState from '../state/RoomState';
import GameSocket from '../ws/GameSocket';
import RoleService from './roleService';
import { Room } from '../model/room';
import { GameState, Mission } from '../model/game';
import {
  MAX_PLAYERS,
  QUEST_TEAM_SIZES,
} from '../constant/roles';
import { ERROR_MESSAGES, ROOM_STATUS } from '../constant/api';
import { WS_MESSAGE_TYPES } from '../constant/websocket';

class GameService {
  private static instance: GameService;

  private constructor() {}

  static getInstance(): GameService {
    if (!GameService.instance) {
      GameService.instance = new GameService();
    }
    return GameService.instance;
  }

  setPlayerReady(playerId: number, roomId: string, ready: boolean): Room {
    const room = RoomState.getRoom(roomId);
    console.log(roomId)
    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    if (room.status !== ROOM_STATUS.LOBBY) {
      throw new Error(ERROR_MESSAGES.GAME_NOT_IN_LOBBY);
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error(ERROR_MESSAGES.PLAYER_NOT_IN_ROOM);
    }

    const updatedRoom = RoomState.updateRoom(roomId, (room) => {
      const player = room.players.find((p) => p.id === playerId);
      if (player) {
        player.ready = ready;
      }
    });

    GameSocket.broadcastToRoom(roomId, {
      type: WS_MESSAGE_TYPES.PLAYER_READY,
      playerId,
      ready,
      room: updatedRoom,
    });

    return updatedRoom;
  }

  startGame(hostId: number, roomId: string): Room {
    const room = RoomState.getRoom(roomId);
    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    if (room.hostId !== hostId) {
      throw new Error(ERROR_MESSAGES.NOT_HOST);
    }

    if (room.status !== ROOM_STATUS.LOBBY) {
      throw new Error(ERROR_MESSAGES.GAME_NOT_IN_LOBBY);
    }

    this.validateGameStart(room);

    const roles = RoleService.assignRoles(room);
    const gameState = this.initializeGameState(room);

    const updatedRoom = RoomState.updateRoom(roomId, (room) => {
      roles.forEach((role, index) => {
        room.players[index].role = role;
      });
      room.gameState = gameState;
      room.status = ROOM_STATUS.IN_PROGRESS;
    });

    this.broadcastGameStart(updatedRoom);

    return updatedRoom;
  }

  private validateGameStart(room: Room): void {
    const playerCount = room.players.length;

    if (playerCount < room.config.minPlayers) {
      throw new Error(`At least ${room.config.minPlayers} players are required for this room configuration`);
    }

    if (room.config.numberOfPlayers && playerCount !== room.config.numberOfPlayers) {
      if (playerCount < room.config.numberOfPlayers) {
        throw new Error(ERROR_MESSAGES.NOT_ENOUGH_PLAYERS);
      } else {
        throw new Error(ERROR_MESSAGES.TOO_MANY_PLAYERS);
      }
    }

    if (playerCount > MAX_PLAYERS) {
      throw new Error(ERROR_MESSAGES.TOO_MANY_PLAYERS);
    }

    const allReady = room.players.every((p) => p.ready);
    if (!allReady) {
      throw new Error(ERROR_MESSAGES.NOT_ALL_PLAYERS_READY);
    }
  }


  private initializeGameState(room: Room): GameState {
    const playerCount = room.players.length;
    const teamSizes = QUEST_TEAM_SIZES[playerCount];

    const missions: Mission[] = teamSizes.map((size, index) => ({
      questNumber: index + 1,
      teamSize: size,
      requiredPlayers: size,
      requiresTwoFails: playerCount >= 7 && index === 3,
      teamMembers: [],
      votes: [],
    }));

    const randomLeaderIndex = Math.floor(Math.random() * playerCount);

    return {
      roomId: room.id,
      currentRound: 1,
      currentLeaderIndex: randomLeaderIndex,
      currentProposalNumber: 0,
      missions,
      completedMissions: 0,
      failedMissions: 0,
      questsCompleted: [],
      ladyOfTheLakeUsedOn: [],
    };
  }

  private broadcastGameStart(room: Room): void {
    const currentLeader = room.players[room.gameState.currentLeaderIndex];
    const firstMission = room.gameState.missions[0];

    GameSocket.broadcastToRoom(room.id, {
      type: WS_MESSAGE_TYPES.GAME_STARTED,
      roomId: room.id,
      currentRound: room.gameState.currentRound,
      questNumber: 1,
      leaderId: currentLeader.id,
      leaderName: currentLeader.name,
      teamSize: firstMission.teamSize,
      missions: room.gameState.missions,
    });
  }

  getRoleInfo(playerId: number, roomId: string) {
    const room = RoomState.getRoom(roomId);
    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error(ERROR_MESSAGES.PLAYER_NOT_IN_ROOM);
    }

    if (!player.role) {
      throw new Error('Player role not assigned');
    }

    const roleInfo = RoleService.getRoleInfo(player.role, room);

    return {
      role: player.role,
      roleInfo,
    };
  }

}

export default GameService.getInstance();
