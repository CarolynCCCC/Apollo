import RoomState from '../state/RoomState';
import GameSocket from '../ws/GameSocket';
import WinConditionService from './winConditionService';
import { Room } from '../model/room';
import { ERROR_MESSAGES } from '../constant/api';
import { WS_MESSAGE_TYPES } from '../constant/websocket';
import { EVIL_ROLES } from '../constant/roles';

class VoteService {
  private static instance: VoteService;

  private constructor() {}

  static getInstance(): VoteService {
    if (!VoteService.instance) {
      VoteService.instance = new VoteService();
    }
    return VoteService.instance;
  }

  voteOnTeam(playerId: number, roomId: string, approve: boolean): void {
    const room = RoomState.getRoom(roomId);
    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    const gameState = room.gameState;
    const teamProposal = gameState.currentTeamProposal;

    if (!teamProposal) {
      throw new Error(ERROR_MESSAGES.TEAM_NOT_PROPOSED);
    }

    const hasVoted = teamProposal.votes.some((v) => v.playerId === playerId);
    if (hasVoted) {
      throw new Error(ERROR_MESSAGES.VOTE_ALREADY_CAST);
    }

    const updatedRoom = RoomState.updateRoom(roomId, (room) => {
      const teamProposal = room.gameState.currentTeamProposal;
      if (!teamProposal) {
        throw new Error('Team proposal not found');
      }

      teamProposal.votes.push({
        playerId,
        approve,
      });
    });

    const updatedProposal = updatedRoom.gameState.currentTeamProposal;
    if (!updatedProposal) {
      throw new Error('Team proposal not found after update');
    }

    GameSocket.broadcastToRoom(updatedRoom.id, {
      type: WS_MESSAGE_TYPES.TEAM_VOTE_CAST,
      playerId,
      approve: approve,
      playerName: updatedRoom.players.find((p) => p.id === playerId)?.name,
      votesCount: updatedProposal.votes.length,
      totalPlayers: updatedRoom.players.length,
    });

    if (updatedProposal.votes.length === updatedRoom.players.length) {
      this.resolveTeamVote(updatedRoom);
    }
  }

  private resolveTeamVote(room: Room): void {
    const gameState = room.gameState;
    const teamProposal = gameState.currentTeamProposal;

    if (!teamProposal) {
      throw new Error(ERROR_MESSAGES.TEAM_NOT_PROPOSED);
    }

    const approveCount = teamProposal.votes.filter((v) => v.approve).length;
    const rejectCount = teamProposal.votes.filter((v) => !v.approve).length;
    const approved = approveCount > rejectCount;

    const voteDetails = teamProposal.votes.map((v) => ({
      playerId: v.playerId,
      playerName: room.players.find((p) => p.id === v.playerId)?.name,
      approve: v.approve,
    }));

    if (approved) {
      GameSocket.broadcastToRoom(room.id, {
        type: WS_MESSAGE_TYPES.TEAM_VOTE_RESULT,
        approved,
        approveCount,
        rejectCount,
        votes: voteDetails,
        proposalNumber: teamProposal.proposalNumber,
      });
      this.handleApprovedTeam(room);
    } else {
      const nextLeaderIndex = (room.gameState.currentLeaderIndex + 1) % room.players.length;
      const nextLeaderId = room.players[nextLeaderIndex].id;

      GameSocket.broadcastToRoom(room.id, {
        type: WS_MESSAGE_TYPES.TEAM_VOTE_RESULT,
        approved,
        approveCount,
        rejectCount,
        votes: voteDetails,
        proposalNumber: teamProposal.proposalNumber,
        nextLeaderId,
        nextLeaderIndex,
      });
      this.handleRejectedTeam(room);
    }
  }

  private handleApprovedTeam(room: Room): void {
    const updatedRoom = RoomState.updateRoom(room.id, (room) => {
      const teamProposal = room.gameState.currentTeamProposal;
      if (!teamProposal) {
        throw new Error('Team proposal not found');
      }

      teamProposal.approved = true;
      room.gameState.missions[room.gameState.currentRound - 1].teamMembers = teamProposal.teamMembers;
    });

    const currentMission = updatedRoom.gameState.missions[updatedRoom.gameState.currentRound - 1];
    const teamMemberIds = currentMission.teamMembers;

    teamMemberIds.forEach((memberId) => {
      const member = updatedRoom.players.find((p) => p.id === memberId);
      const isEvil = member?.role && EVIL_ROLES.includes(member.role);

      GameSocket.sendToPlayer(memberId, updatedRoom.id, {
        type: WS_MESSAGE_TYPES.REQUEST_QUEST_VOTE,
        questNumber: updatedRoom.gameState.currentRound,
        canFail: isEvil,
        message: isEvil
          ? `You are on the quest team. Vote Success or Fail.`
          : `You are on the quest team. You must vote Success.`,
      });
    });
  }

  private handleRejectedTeam(room: Room): void {
    const updatedRoom = RoomState.updateRoom(room.id, (room) => {
      room.gameState.currentProposalNumber++;

      if (room.gameState.currentProposalNumber < 5) {
        room.gameState.currentLeaderIndex =
          (room.gameState.currentLeaderIndex + 1) % room.players.length;
        room.gameState.currentTeamProposal = undefined;
      }
    });

    if (updatedRoom.gameState.currentProposalNumber >= 5) {
      this.handleFiveRejections(updatedRoom);
    }
  }

  private handleFiveRejections(room: Room): void {
    WinConditionService.handleEvilVictory(room, 'five_rejections');
  }
}

export default VoteService.getInstance();
