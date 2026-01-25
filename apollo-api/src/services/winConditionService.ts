import RoomState from '../state/RoomState';
import GameSocket from '../ws/GameSocket';
import { Room } from '../model/room';
import { ROOM_STATUS } from '../constant/api';
import { WS_MESSAGE_TYPES } from '../constant/websocket';
import { TEAM } from '../constant/roles';

class WinConditionService {
  private static instance: WinConditionService;

  private constructor() {}

  static getInstance(): WinConditionService {
    if (!WinConditionService.instance) {
      WinConditionService.instance = new WinConditionService();
    }
    return WinConditionService.instance;
  }

  handleGoodVictory(room: Room): void {
    const updatedRoom = RoomState.updateRoom(room.id, (room) => {
      room.status = ROOM_STATUS.FINISHED;
    });

    GameSocket.broadcastToRoom(updatedRoom.id, {
      type: WS_MESSAGE_TYPES.GAME_ENDED,
      winner: TEAM.GOOD,
      reason: 'three_successful_quests',
      message: 'Good wins! Three quests completed successfully.',
    });
  }

  handleEvilVictory(room: Room, reason: string): void {
    const updatedRoom = RoomState.updateRoom(room.id, (room) => {
      room.status = ROOM_STATUS.FINISHED;
    });

    GameSocket.broadcastToRoom(updatedRoom.id, {
      type: WS_MESSAGE_TYPES.GAME_ENDED,
      winner: TEAM.EVIL,
      reason,
      message: this.getEvilVictoryMessage(reason),
    });
  }

  private getEvilVictoryMessage(reason: string): string {
    switch (reason) {
      case 'three_failed_quests':
        return 'Evil wins! Three quests have failed.';
      case 'five_rejections':
        return 'Evil wins! Five teams were rejected in a row.';
      case 'merlin_assassinated':
        return 'Evil wins! The Assassin has found and killed Merlin.';
      default:
        return 'Evil wins!';
    }
  }
}

export default WinConditionService.getInstance();
