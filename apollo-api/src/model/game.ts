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
  hostId: number;
  roomId: string;
}

export interface PlayerReadyRequest {
  playerId: number;
  roomId: string;
  ready: boolean;
}

export interface ProposeTeamRequest {
  leaderId: number;
  roomId: string;
  teamMemberIds: number[];
}

export interface VoteTeamRequest {
  playerId: number;
  roomId: string;
  approve: boolean;
}

export interface VoteQuestRequest {
  playerId: number;
  roomId: string;
  success: boolean;
}

