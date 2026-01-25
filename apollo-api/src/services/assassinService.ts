import RoomState from '../state/RoomState';
import GameSocket from '../ws/GameSocket';
import WinConditionService from './winConditionService';
import { Room } from '../model/room';
import { ERROR_MESSAGES, ROOM_STATUS } from '../constant/api';
import { WS_MESSAGE_TYPES } from '../constant/websocket';
import { ROLES } from '../constant/roles';

class AssassinService {
  private static instance: AssassinService;

  private constructor() {}

  static getInstance(): AssassinService {
    if (!AssassinService.instance) {
      AssassinService.instance = new AssassinService();
    }
    return AssassinService.instance;
  }

  assassinateTarget(assassinId: number, targetId: number, roomId: string): void {
    const room = RoomState.getRoom(roomId);
    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    if (room.status !== ROOM_STATUS.ASSASSIN_PHASE) {
      throw new Error('Game is not in assassin phase');
    }

    const assassin = room.players.find((p) => p.id === assassinId);
    if (!assassin) {
      throw new Error('Assassin player not found');
    }

    if (assassin.role !== ROLES.ASSASSIN) {
      throw new Error('Only the Assassin can perform this action');
    }

    const target = room.players.find((p) => p.id === targetId);
    if (!target) {
      throw new Error('Target player not found');
    }

    if (target.id === assassin.id) {
      throw new Error('Assassin cannot target themselves');
    }

    const isMerlin = target.role === ROLES.MERLIN;

    GameSocket.broadcastToRoom(room.id, {
      type: WS_MESSAGE_TYPES.ASSASSIN_RESULT,
      assassinId,
      assassinName: assassin.name,
      targetId,
      targetName: target.name,
      success: isMerlin,
      targetRole: target.role,
      message: isMerlin
        ? `The Assassin has found Merlin! ${target.name} was Merlin.`
        : `The Assassin failed! ${target.name} was not Merlin.`,
    });

    if (isMerlin) {
      WinConditionService.handleEvilVictory(room, 'merlin_assassinated');
    } else {
      WinConditionService.handleGoodVictory(room);
    }
  }
}

export default AssassinService.getInstance();
