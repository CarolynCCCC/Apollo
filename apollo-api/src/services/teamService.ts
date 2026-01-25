import RoomState from '../state/RoomState';
import GameSocket from '../ws/GameSocket';
import { Room } from '../model/room';
import { ERROR_MESSAGES } from '../constant/api';
import { WS_MESSAGE_TYPES } from '../constant/websocket';

class TeamService {
  private static instance: TeamService;

  private constructor() {}

  static getInstance(): TeamService {
    if (!TeamService.instance) {
      TeamService.instance = new TeamService();
    }
    return TeamService.instance;
  }

  proposeTeam(leaderId: number, roomId: string, teamMemberIds: number[]): Room {
    const room = RoomState.getRoom(roomId);
    if (!room) {
      throw new Error(ERROR_MESSAGES.ROOM_NOT_FOUND);
    }

    const gameState = room.gameState;
    const currentLeaderId = room.players[gameState.currentLeaderIndex].id;

    if (leaderId !== currentLeaderId) {
      throw new Error(ERROR_MESSAGES.NOT_LEADER);
    }

    this.validateTeamProposal(room, teamMemberIds);

    const updatedRoom = RoomState.updateRoom(roomId, (room) => {
      const gameState = room.gameState;

      if (!gameState.currentTeamProposal) {
        gameState.currentTeamProposal = {
          proposalNumber: gameState.currentProposalNumber + 1,
          leaderId: currentLeaderId,
          teamMembers: teamMemberIds,
          votes: [],
          approved: false,
        };
      } else {
        gameState.currentTeamProposal.teamMembers = teamMemberIds;
        gameState.currentTeamProposal.votes = [];
      }

      gameState.currentProposalNumber = gameState.currentTeamProposal.proposalNumber;
    });

    this.broadcastTeamProposal(updatedRoom, currentLeaderId, teamMemberIds);

    return updatedRoom;
  }

  private validateTeamProposal(room: Room, teamMemberIds: number[]): void {
    const gameState = room.gameState;
    const currentQuestNumber = gameState.currentRound;
    const mission = gameState.missions[currentQuestNumber - 1];
    const requiredTeamSize = mission.teamSize;

    if (teamMemberIds.length !== requiredTeamSize) {
      throw new Error(ERROR_MESSAGES.INVALID_TEAM_SIZE);
    }

    const uniqueMembers = new Set(teamMemberIds);
    if (uniqueMembers.size !== teamMemberIds.length) {
      throw new Error(ERROR_MESSAGES.DUPLICATE_TEAM_MEMBERS);
    }

    const validPlayers = teamMemberIds.every((id) =>
      room.players.some((p) => p.id === id)
    );
    if (!validPlayers) {
      throw new Error(ERROR_MESSAGES.INVALID_TEAM_MEMBERS);
    }
  }

  private broadcastTeamProposal(room: Room, leaderId: number, teamMemberIds: number[]): void {
    const currentQuestNumber = room.gameState.currentRound;

    GameSocket.broadcastToRoom(room.id, {
      type: WS_MESSAGE_TYPES.TEAM_PROPOSED,
      leaderId: leaderId,
      leaderName: room.players.find((p) => p.id === leaderId)?.name,
      teamMemberIds,
      teamMembers: teamMemberIds.map((id) => ({
        id,
        name: room.players.find((p) => p.id === id)?.name,
      })),
      questNumber: currentQuestNumber,
      proposalNumber: room.gameState.currentProposalNumber,
    });

    room.players.forEach((player) => {
      GameSocket.sendToPlayer(player.id, room.id, {
        type: WS_MESSAGE_TYPES.REQUEST_TEAM_VOTE,
        questNumber: currentQuestNumber,
        proposalNumber: room.gameState.currentProposalNumber,
        message: 'Vote to approve or reject the proposed team',
      });
    });
  }
}

export default TeamService.getInstance();
