import RoomState from '../state/RoomState';
import { randomUUID } from 'node:crypto';

interface ICleanupService {
  clearWarning(playerId: number, roomId: string): void;
}

class PlayerService {
  private static instance: PlayerService;
  private cleanupService?: ICleanupService;

  private constructor() {}

  static getInstance(): PlayerService {
    if (!PlayerService.instance) {
      PlayerService.instance = new PlayerService();
    }
    return PlayerService.instance;
  }

  setCleanupService(cleanupService: ICleanupService): void {
    this.cleanupService = cleanupService;
  }

  createPlayer(playerName: string): { id: string; name: string } {
    const playerId = `player-` + randomUUID();

    return {
      id: playerId,
      name: playerName,
    };
  }

  updateActivity(playerId: number, roomId: string): void {
    const room = RoomState.getRoom(roomId);
    if (!room) {
      return;
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      return;
    }

    RoomState.updateRoom(roomId, (room) => {
      const player = room.players.find((p) => p.id === playerId);
      if (player) {
        player.lastActivity = new Date();
      }
    });

    if (this.cleanupService) {
      this.cleanupService.clearWarning(playerId, roomId);
    }
  }
}

export default PlayerService.getInstance();
