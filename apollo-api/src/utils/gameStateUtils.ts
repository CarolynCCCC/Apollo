import { GameState } from '../model/game';

export function createInitialGameState(roomId: string): GameState {
  return {
    roomId,
    currentRound: 0,
    currentLeaderIndex: 0,
    currentProposalNumber: 0,
    missions: [],
    completedMissions: 0,
    failedMissions: 0,
    currentTeamProposal: undefined,
    questsCompleted: [],
    ladyOfTheLakeHolder: undefined,
    ladyOfTheLakeUsedOn: [],
  };
}
