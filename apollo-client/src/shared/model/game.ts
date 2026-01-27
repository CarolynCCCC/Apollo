export interface Mission {
  questNumber: number;
  teamSize: number;
  requiredPlayers: number;
  requiresTwoFails: boolean;
  teamMembers: number[];
  votes: MissionVote[];
  result?: 'success' | 'fail';
}

export interface MissionVote {
  playerId: number;
  vote: 'success' | 'fail';
}

export interface TeamProposal {
  proposalNumber: number;
  leaderId: number;
  teamMembers: number[];
  votes: ProposalVote[];
  approved: boolean;
}

export interface ProposalVote {
  playerId: number;
  approve: boolean;
}

export interface GameState {
  roomId: string;
  currentRound: number;
  currentLeaderIndex: number;
  currentProposalNumber: number;
  missions: Mission[];
  completedMissions: number;
  failedMissions: number;
  currentTeamProposal?: TeamProposal;
  questsCompleted: ('success' | 'fail')[];
  ladyOfTheLakeHolder?: string;
  ladyOfTheLakeUsedOn: string[];
}

export interface StartGameRequest {
  hostId: string;
  roomId: string;
}

export interface PlayerReadyRequest {
  playerId: string;
  roomId: string;
  ready: boolean;
}

export interface ProposeTeamRequest {
  leaderId: string;
  roomId: string;
  teamMemberIds: string[];
}

export interface VoteTeamRequest {
  playerId: string;
  roomId: string;
  approve: boolean;
}

export interface VoteQuestRequest {
  playerId: string;
  roomId: string;
  success: boolean;
}

export interface VoteResult {
  proposalNumber: number;
  approved: boolean;
  approveCount: number;
  rejectCount: number;
  votes: Array<{ playerId: number; playerName?: string; approve: boolean }>;
  nextLeaderId?: number;
  nextLeaderIndex?: number;
  teamMembers?: number[];
  questLeaderId?: number;
  leaderName?: string | null;
}

export interface VoteHistory {
  [roundNumber: number]: VoteResult[];
}

export interface QuestVoteState {
  isQuestVotingPhase: boolean;
  canFailQuest: boolean;
  hasVotedOnQuest: boolean;
  questVoteMessage: string | null;
}

export interface QuestResult {
  questNumber: number;
  result: 'success' | 'fail';
  successCount: number;
  failCount: number;
  votes: Array<{ vote: 'success' | 'fail' }>;
  requiredFails: number;
  teamMembers: Array<{ id: number; name?: string }>;
  leaderName?: string;
  leaderId?: number | null;
}

export interface QuestResultHistory {
  [questNumber: number]: QuestResult;
}

export interface GameEndedData {
  winner: 'good' | 'evil';
  reason: string;
  message: string;
}

