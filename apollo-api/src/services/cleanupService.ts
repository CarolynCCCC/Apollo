import RoomState from '../state/RoomState';
import GameSocket from '../ws/GameSocket';
import config from '../config/config';
import { WS_MESSAGE_TYPES } from '../constant/websocket';

class CleanupService {
  private static instance: CleanupService;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private warnedPlayers = new Set<string>();

  private constructor() {}

  static getInstance(): CleanupService {
    if (!CleanupService.instance) {
      CleanupService.instance = new CleanupService();
    }
    return CleanupService.instance;
  }

  startCleanupTimer(): void {
    if (this.cleanupInterval) {
      return;
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanupInactivePlayers();
    }, config.cleanupInterval);
  }

  stopCleanupTimer(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  clearWarning(playerId: number, roomId: string): void {
    const playerKey = `${playerId}-${roomId}`;
    this.warnedPlayers.delete(playerKey);
  }

  private cleanupInactivePlayers(): void {
    const now = new Date();
    const allRooms = RoomState.getAllRooms();

    allRooms.forEach((room) => {
      const playersToRemove: number[] = [];

      room.players.forEach((player) => {
        const timeSinceLastActivity = now.getTime() - player.lastActivity.getTime();
        const playerKey = `${player.id}-${room.id}`;

        if (timeSinceLastActivity > config.inactivityTimeout) {
          playersToRemove.push(player.id);
          this.warnedPlayers.delete(playerKey);
        } else if (
          timeSinceLastActivity > config.inactivityWarning &&
          !this.warnedPlayers.has(playerKey)
        ) {
          const timeRemaining = Math.floor((config.inactivityTimeout - timeSinceLastActivity) / 1000);

          GameSocket.sendToPlayer(player.id, room.id, {
            type: WS_MESSAGE_TYPES.INACTIVITY_WARNING,
            timeRemaining,
            message: `You will be disconnected in ${timeRemaining} seconds due to inactivity`,
          });

          this.warnedPlayers.add(playerKey);
        }
      });

      if (playersToRemove.length > 0) {
        const updatedRoom = RoomState.updateRoom(room.id, (room) => {
          room.players = room.players.filter((p) => !playersToRemove.includes(p.id));
        });

        playersToRemove.forEach((playerId) => {
          GameSocket.disconnectPlayer(playerId, room.id);

          GameSocket.broadcastToRoom(room.id, {
            type: WS_MESSAGE_TYPES.PLAYER_LEFT,
            playerId,
            reason: 'inactivity',
            room: updatedRoom,
          });
        });

        if (updatedRoom.players.length === 0) {
          RoomState.deleteRoom(room.id);
        }
      }
    });
  }
}

export default CleanupService.getInstance();
