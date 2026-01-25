import RoomState from '../state/RoomState';
import GameSocket from '../ws/GameSocket';
import WinConditionService from './winConditionService';
import { Room } from '../model/room';
import { ERROR_MESSAGES, ROOM_STATUS } from '../constant/api';
import { WS_MESSAGE_TYPES } from '../constant/websocket';
import { EVIL_ROLES, ROLES } from '../constant/roles';

const QUEST_FAIL_REQUIREMENTS: Record<number, Record<number, number>> = {
  5: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
  6: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
  7: { 1: 1, 2: 1, 3: 1, 4: 2, 5: 1 },
  8: { 1: 1, 2: 1, 3: 1, 4: 2, 5: 1 },
  9: { 1: 1, 2: 1, 3: 1, 4: 2, 5: 1 },
  10: { 1: 1, 2: 1, 3: 1, 4: 2, 5: 1 },
};

class QuestService {
  private static instance: QuestService;

  private constructor() {}

  static getInstance(): QuestService {
    if (!QuestService.instance) {
      QuestService.instance = new QuestService();
    }
    return QuestService.instance;
  }

  voteOnQuest(playerId: number, roomId: string, success: boolean): void {
    const room = RoomState.getRoom(roomId);
    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    const gameState = room.gameState;
    const currentMission = gameState.missions[gameState.currentRound - 1];

    if (!currentMission.teamMembers || currentMission.teamMembers.length === 0) {
      throw new Error('No team assigned for this quest');
    }

    if (!currentMission.teamMembers.includes(playerId)) {
      throw new Error('Player is not on the quest team');
    }

    const hasVoted = currentMission.votes.some((v) => v.playerId === playerId);
    if (hasVoted) {
      throw new Error(ERROR_MESSAGES.VOTE_ALREADY_CAST);
    }

    const player = room.players.find((p) => p.id === playerId);
    if (!player || !player.role) {
      throw new Error('Player or role not found');
    }

    const isEvil = EVIL_ROLES.includes(player.role);
    const finalVote = isEvil ? success : true;

    const updatedRoom = RoomState.updateRoom(roomId, (room) => {
      const mission = room.gameState.missions[room.gameState.currentRound - 1];
      mission.votes.push({
        playerId,
        vote: finalVote ? 'success' : 'fail',
      });
    });

    GameSocket.broadcastToRoom(updatedRoom.id, {
      type: WS_MESSAGE_TYPES.QUEST_VOTE_CAST,
      playerId,
      playerName: player.name,
      votesCount: updatedRoom.gameState.missions[gameState.currentRound - 1].votes.length,
      totalTeamMembers: currentMission.teamMembers.length,
    });

    const updatedMission = updatedRoom.gameState.missions[gameState.currentRound - 1];
    if (updatedMission.votes.length === currentMission.teamMembers.length) {
      this.resolveQuestVote(updatedRoom);
    }
  }

  private resolveQuestVote(room: Room): void {
    const gameState = room.gameState;
    const currentMission = gameState.missions[gameState.currentRound - 1];

    const shuffledVotes = this.shuffleArray([...currentMission.votes]);

    const failCount = shuffledVotes.filter((v) => v.vote === 'fail').length;
    const successCount = shuffledVotes.filter((v) => v.vote === 'success').length;

    const playerCount = room.players.length;
    const questNumber = gameState.currentRound;
    const requiredFails = QUEST_FAIL_REQUIREMENTS[playerCount]?.[questNumber] || 1;

    const questSucceeded = failCount < requiredFails;

    const updatedRoom = RoomState.updateRoom(room.id, (room) => {
      const mission = room.gameState.missions[room.gameState.currentRound - 1];
      mission.result = questSucceeded ? 'success' : 'fail';

      if (questSucceeded) {
        room.gameState.completedMissions++;
      } else {
        room.gameState.failedMissions++;
      }

      room.gameState.questsCompleted.push(questSucceeded ? 'success' : 'fail');
    });

    GameSocket.broadcastToRoom(updatedRoom.id, {
      type: WS_MESSAGE_TYPES.QUEST_RESULT,
      questNumber,
      result: questSucceeded ? 'success' : 'fail',
      successCount,
      failCount,
      votes: shuffledVotes.map((v) => ({ vote: v.vote })),
      requiredFails,
    });

    this.checkWinCondition(updatedRoom);
  }

  private checkWinCondition(room: Room): void {
    const gameState = room.gameState;

    if (gameState.completedMissions >= 3) {
      this.handleGoodVictoryCondition(room);
    } else if (gameState.failedMissions >= 3) {
      WinConditionService.handleEvilVictory(room, 'three_failed_quests');
    } else {
      this.proceedToNextRound(room);
    }
  }

  private handleGoodVictoryCondition(room: Room): void {
    const assassin = room.players.find((p) => p.role === ROLES.ASSASSIN);

    if (!assassin) {
      WinConditionService.handleGoodVictory(room);
      return;
    }

    const updatedRoom = RoomState.updateRoom(room.id, (room) => {
      room.status = ROOM_STATUS.ASSASSIN_PHASE;
    });

    GameSocket.broadcastToRoom(updatedRoom.id, {
      type: WS_MESSAGE_TYPES.ASSASSIN_PHASE_STARTED,
      message: 'Good has completed 3 quests! The Assassin must now attempt to identify Merlin.',
    });

    GameSocket.sendToPlayer(assassin.id, updatedRoom.id, {
      type: WS_MESSAGE_TYPES.REQUEST_ASSASSIN_TARGET,
      message: 'You are the Assassin. Choose a player to assassinate. If you find Merlin, Evil wins!',
      eligibleTargets: updatedRoom.players
        .filter((p) => p.role && !EVIL_ROLES.includes(p.role))
        .map((p) => ({ id: p.id, name: p.name })),
    });
  }


  private proceedToNextRound(room: Room): void {
    const updatedRoom = RoomState.updateRoom(room.id, (room) => {
      room.gameState.currentRound++;
      room.gameState.currentProposalNumber = 0;
      room.gameState.currentLeaderIndex =
        (room.gameState.currentLeaderIndex + 1) % room.players.length;
      room.gameState.currentTeamProposal = undefined;
    });

    const nextLeader = updatedRoom.players[updatedRoom.gameState.currentLeaderIndex];
    const nextQuestNumber = updatedRoom.gameState.currentRound;
    const nextMission = updatedRoom.gameState.missions[nextQuestNumber - 1];

    GameSocket.broadcastToRoom(updatedRoom.id, {
      type: WS_MESSAGE_TYPES.NEXT_ROUND_STARTED,
      questNumber: nextQuestNumber,
      leaderId: nextLeader.id,
      leaderName: nextLeader.name,
      teamSize: nextMission.teamSize,
      completedQuests: updatedRoom.gameState.completedMissions,
      failedQuests: updatedRoom.gameState.failedMissions,
    });
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export default QuestService.getInstance();
