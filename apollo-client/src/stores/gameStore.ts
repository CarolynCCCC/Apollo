import { defineStore } from 'pinia';
import { Mission, VoteHistory, VoteResult, QuestResultHistory, QuestResult, GameEndedData } from '@/shared/model/game';
import { RoleInfo } from '@/shared/model/role';
import { usePlayerStore } from '@/stores/playerStore.ts';
import { useRoomStore } from '@/stores/roomStore.ts';

export const useGameStore = defineStore('game', {
  state: () => ({
    currentRound: 0 as number,
    leaderId: null as number | null,
    leaderName: null as string | null,
    missions: [] as Mission[],
    currentRole: null as string | null,
    roleInfo: null as RoleInfo | null,
    currentTeamSize: null as number | null,
    questMessage: null as string | null,
    proposedTeam: [] as number[],
    proposedTeamMembers: [] as Array<{ id: number; name?: string }>,
    proposalNumber: 0 as number,
    isVotingPhase: false as boolean,
    hasVoted: false as boolean,
    votedPlayers: [] as Array<{ id: number; name?: string; approve: boolean }>,
    votesCount: 0 as number,
    totalPlayers: 0 as number,
    voteHistory: {} as VoteHistory,
    currentVoteResult: null as Omit<VoteResult, 'proposalNumber'> | null,
    isQuestVotingPhase: false as boolean,
    canFailQuest: false as boolean,
    hasVotedOnQuest: false as boolean,
    questVoteMessage: null as string | null,
    questResultHistory: {} as QuestResultHistory,
    currentQuestResult: null as QuestResult | null,
    gameEnded: null as GameEndedData | null,
    completedQuests: 0 as number,
    failedQuests: 0 as number,
    isAssassinPhase: false as boolean,
    assassinTargets: [] as Array<{ id: number; name?: string }>,
    assassinMessage: null as string | null,
  }),
  persist: true,

  getters: {
    isLeader: (state) => (playerId: number) => state.leaderId === playerId,
    currentMission: (state) => {
      if (!state.currentRound) return null;
      return state.missions.find(m => m.questNumber === state.currentRound);
    },
    hasRole: (state) => state.currentRole !== null,
    voteResult: (state) => state.currentVoteResult,
    currentRoundVoteHistory: (state) => state.voteHistory[state.currentRound] || [],
  },

  actions: {
    setQuestVoteRequest(questNumber: number, canFail: boolean, message: string) {
      console.log('setQuestVoteRequest called:', { questNumber, canFail, message });
      this.isQuestVotingPhase = true;
      this.canFailQuest = canFail;
      this.questVoteMessage = message;
      this.currentRound = questNumber;
      this.hasVotedOnQuest = false;
    },

    setQuestVoteCast() {
      this.hasVotedOnQuest = true;
    },

    setQuestResult(
      questNumber: number,
      result: 'success' | 'fail',
      successCount: number,
      failCount: number,
      votes: Array<{ vote: 'success' | 'fail' }>,
      requiredFails: number
    ) {
      console.log('setQuestResult called:', { questNumber, result });

      const questResult: QuestResult = {
        questNumber,
        result,
        successCount,
        failCount,
        votes,
        requiredFails,
        teamMembers: this.proposedTeamMembers,
        leaderName: this.leaderName || undefined,
      };

      this.questResultHistory[questNumber] = questResult;
      this.currentQuestResult = questResult;
      this.isQuestVotingPhase = false;

      if (result === 'success') {
        this.completedQuests++;
      } else {
        this.failedQuests++;
      }

      console.log('Quest result stored:', questResult);
    },

    setNextRound(
      questNumber: number,
      leaderId: number,
      leaderName: string,
      teamSize: number,
      completedQuests: number,
      failedQuests: number
    ) {
      console.log('setNextRound called:', { questNumber, leaderId, leaderName });

      this.currentRound = questNumber;
      this.leaderId = leaderId;
      this.leaderName = leaderName;
      this.currentTeamSize = teamSize;
      this.completedQuests = completedQuests;
      this.failedQuests = failedQuests;
      this.proposalNumber = 0;
      this.isVotingPhase = false;
      this.hasVoted = false;
      this.votedPlayers = [];
      this.votesCount = 0;
      this.currentVoteResult = null;
      this.proposedTeam = [];
      this.proposedTeamMembers = [];
    },

    setGameEnded(winner: 'good' | 'evil', reason: string, message: string) {
      console.log('setGameEnded called:', { winner, reason, message });

      this.gameEnded = {
        winner,
        reason,
        message,
      };
    },

    setAssassinTargetRequest(eligibleTargets: Array<{ id: number; name?: string }>, message: string) {
      console.log('setAssassinTargetRequest called:', { eligibleTargets, message });

      this.isAssassinPhase = true;
      this.assassinTargets = eligibleTargets;
      this.assassinMessage = message;
    },

    setGameStarted(leaderId: number, currentRound: number, missions: Mission[], questNumber: number, teamSize: number) {
      this.leaderId = leaderId;
      this.currentRound = currentRound;
      this.missions = missions;
      this.currentTeamSize = teamSize;
    },

    addVoteCast(playerId: number, playerName: string | undefined, approve: boolean, votesCount: number, totalPlayers: number) {
      const existingVote = this.votedPlayers.find(p => p.id === playerId);
      if (!existingVote) {
        this.votedPlayers.push({ id: playerId, name: playerName, approve });
      }
      this.votesCount = votesCount;
      this.totalPlayers = totalPlayers;
    },

    setRoleAssigned(role: string, roleInfo: RoleInfo) {
      this.currentRole = role;
      this.roleInfo = roleInfo;
    },

    setTeamProposed(leaderId: number, teamMemberIds: number[], teamMembers: Array<{ id: number; name?: string }>, questNumber: number, proposalNumber: number) {
      this.proposedTeam = teamMemberIds;
      this.proposedTeamMembers = teamMembers;
      this.proposalNumber = proposalNumber;
      this.currentRound = questNumber;
      this.isVotingPhase = true;
      this.hasVoted = false;
      this.votedPlayers = [];
      this.votesCount = 0;
      this.totalPlayers = 0;
      this.currentVoteResult = null;
    },

    setVoteResult(
      approved: boolean,
      approveCount: number,
      rejectCount: number,
      votes: Array<{ playerId: number; playerName?: string; approve: boolean }>,
      nextLeaderId?: number,
      nextLeaderIndex?: number
    ) {
      console.log('setVoteResult called:', { approved, nextLeaderId, nextLeaderIndex });

      const voteResult: VoteResult = {
        proposalNumber: this.proposalNumber,
        approved,
        approveCount,
        rejectCount,
        votes,
        nextLeaderId,
        nextLeaderIndex,
        questLeaderId: this.leaderId ?? 0,
        teamMembers: this.proposedTeam,
      };

      if (!this.voteHistory[this.currentRound]) {
        this.voteHistory[this.currentRound] = [];
      }
      this.voteHistory[this.currentRound].push(voteResult);

      this.currentVoteResult = {
        approved,
        approveCount,
        rejectCount,
        votes,
        nextLeaderId,
        nextLeaderIndex,
      };

      console.log(`Vote added to round ${this.currentRound} history. Total votes this round:`, this.voteHistory[this.currentRound].length);
      console.log('Current vote result set:', this.currentVoteResult);

      if (!approved && nextLeaderId !== undefined) {
        this.leaderId = nextLeaderId;
        console.log('Updated leaderId to:', nextLeaderId);
      }

      if (approved) {
        this.isVotingPhase = false;
      }
    },

    setTeamVoteCast() {
      this.hasVoted = true;
    },

    async proposeTeam(leaderId: number, roomId: string, teamMemberIds: number[]) {
      try {
        const { gameApi } = await import('@/api/game');
        await gameApi.proposeTeam({
          leaderId,
          roomId,
          teamMemberIds
        });
      } catch (error) {
        console.error('Failed to propose team:', error);
        throw error;
      }
    },

    async voteOnTeam(approve: boolean) {
      try {
        const playerStore = usePlayerStore();
        const roomStore = useRoomStore();
        const playerId = playerStore.playerId;
        const roomId = roomStore.currentRoom?.id;
        if (!playerId || !roomId) {
          return;
        }
        const { gameApi } = await import('@/api/game');
        await gameApi.voteOnTeam({
          playerId,
          roomId,
          approve
        });
        this.setTeamVoteCast();
      } catch (error) {
        console.error('Failed to vote on team:', error);
        throw error;
      }
    },

    async voteOnQuest(success: boolean) {
      try {
        const { gameApi } = await import('@/api/game');
        const playerStore = usePlayerStore();
        const roomStore = useRoomStore();
        const playerId = playerStore.playerId;
        const roomId = roomStore.currentRoom?.id;
        if (!playerId || !roomId) {
          return;
        }

        await gameApi.voteOnQuest({
          playerId,
          roomId,
          success
        });
        this.setQuestVoteCast();
      } catch (error) {
        console.error('Failed to vote on quest:', error);
        throw error;
      }
    },

    async fetchRoleInfo(playerId: number, roomId: string) {
      try {
        const { gameApi } = await import('@/api/game');
        const response = await gameApi.getRoleInfo({ playerId, roomId });
        this.setRoleAssigned(response.role, response.roleInfo);
      } catch (error) {
        console.error('Failed to fetch role info:', error);
      }
    },

    async assassinateTarget(assassinId: number, targetId: number, roomId: string) {
      try {
        const { gameApi } = await import('@/api/game');
        await gameApi.assassinateTarget({
          assassinId,
          targetId,
          roomId
        });
        console.log('Assassination attempt sent');
      } catch (error) {
        console.error('Failed to assassinate target:', error);
        throw error;
      }
    },

    clearGameState() {
      this.currentRound = 0;
      this.leaderId = null;
      this.leaderName = null;
      this.missions = [];
      this.currentRole = null;
      this.roleInfo = null;
      this.currentTeamSize = null;
      this.questMessage = null;
      this.proposedTeam = [];
      this.proposedTeamMembers = [];
      this.proposalNumber = 0;
      this.isVotingPhase = false;
      this.hasVoted = false;
      this.votedPlayers = [];
      this.votesCount = 0;
      this.totalPlayers = 0;
      this.voteHistory = {};
      this.currentVoteResult = null;
      this.isQuestVotingPhase = false;
      this.canFailQuest = false;
      this.hasVotedOnQuest = false;
      this.questVoteMessage = null;
      this.questResultHistory = {};
      this.currentQuestResult = null;
      this.gameEnded = null;
      this.completedQuests = 0;
      this.failedQuests = 0;
      this.isAssassinPhase = false;
      this.assassinTargets = [];
      this.assassinMessage = null;
    },
  },
});
