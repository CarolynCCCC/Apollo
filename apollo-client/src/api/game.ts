import apiClient from './axios';
import { API_ROUTES, API_BASE_PATH } from '@/constant/api';
import { Room } from '@/shared/model/room';
import { RoleInfo } from '@/shared/model/role';

export interface PlayerReadyRequest {
  playerId: number;
  roomId: string;
  ready: boolean;
}

export interface StartGameRequest {
  hostId: number;
  roomId: string;
}

export interface GetRoleInfoRequest {
  playerId: number;
  roomId: string;
}

export interface GetRoleInfoResponse {
  role: string;
  roleInfo: RoleInfo;
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

export interface AssassinateTargetRequest {
  assassinId: number;
  targetId: number;
  roomId: string;
}

export const gameApi = {
  async setPlayerReady(data: PlayerReadyRequest): Promise<Room> {
    const response = await apiClient.post<Room>(`${API_BASE_PATH}${API_ROUTES.PLAYER_READY}`, data);
    return response.data;
  },

  async startGame(data: StartGameRequest): Promise<{ message: string; roomId: string }> {
    const response = await apiClient.post<{ message: string; roomId: string }>(`${API_BASE_PATH}${API_ROUTES.START_GAME}`, data);
    return response.data;
  },

  async getRoleInfo(data: GetRoleInfoRequest): Promise<GetRoleInfoResponse> {
    const response = await apiClient.post<GetRoleInfoResponse>(`${API_BASE_PATH}${API_ROUTES.GET_ROLE_INFO}`, data);
    return response.data;
  },

  async proposeTeam(data: ProposeTeamRequest): Promise<{ message: string; room: Room }> {
    const response = await apiClient.post<{ message: string; room: Room }>(`${API_BASE_PATH}${API_ROUTES.PROPOSE_TEAM}`, data);
    return response.data;
  },

  async voteOnTeam(data: VoteTeamRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`${API_BASE_PATH}${API_ROUTES.VOTE_TEAM}`, data);
    return response.data;
  },

  async voteOnQuest(data: VoteQuestRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`${API_BASE_PATH}${API_ROUTES.VOTE_QUEST}`, data);
    return response.data;
  },

  async assassinateTarget(data: AssassinateTargetRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`${API_BASE_PATH}${API_ROUTES.ASSASSINATE_TARGET}`, data);
    return response.data;
  },
};
