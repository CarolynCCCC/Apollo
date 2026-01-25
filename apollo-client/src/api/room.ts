import apiClient from './axios';
import {
  Room,
  CreateRoomRequest,
  CreateRoomResponse,
  JoinRoomRequest,
  LeaveRoomRequest,
  LeaveRoomResponse,
  DeleteRoomRequest,
  DeleteRoomResponse,
  GetRoomResponse,
  GetAvailableRoomsResponse, JoinRoomResponse,
} from '@/shared/model/room';
import { API_ROUTES, API_BASE_PATH } from '@/constant/api';

export const roomApi = {
  async createRoom(data: CreateRoomRequest): Promise<CreateRoomResponse> {
    const response = await apiClient.post<CreateRoomResponse>(`${API_BASE_PATH}${API_ROUTES.ROOMS}`, data);
    return response.data;
  },

  async joinRoom(data: JoinRoomRequest): Promise<JoinRoomResponse> {
    const response = await apiClient.post<JoinRoomResponse>(`${API_BASE_PATH}${API_ROUTES.JOIN_ROOM}`, data);
    return response.data;
  },

  async leaveRoom(data: LeaveRoomRequest): Promise<LeaveRoomResponse> {
    const response = await apiClient.post<LeaveRoomResponse>(`${API_BASE_PATH}${API_ROUTES.LEAVE_ROOM}`, data);
    return response.data;
  },

  async getAvailableRooms(): Promise<GetAvailableRoomsResponse> {
    const response = await apiClient.post<Room[]>(`${API_BASE_PATH}${API_ROUTES.ROOMS}`);
    return { rooms: response.data };
  },

  async getRoom(roomId: string): Promise<GetRoomResponse> {
    const response = await apiClient.post<GetRoomResponse>(`${API_BASE_PATH}${API_ROUTES.ROOM_BY_ID.replace(':roomId', roomId)}`);
    return response.data;
  },

  async deleteRoom(data: DeleteRoomRequest): Promise<DeleteRoomResponse> {
    const response = await apiClient.post<DeleteRoomResponse>(`${API_BASE_PATH}${API_ROUTES.DELETE_ROOM}`, data);
    return response.data;
  },
};
