import { Request, Response, NextFunction } from 'express';
import RoomService from '../services/roomService';
import { CreateRoomRequest, JoinRoomRequest, LeaveRoomRequest, DeleteRoomRequest } from '../model/room';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constant/api';

export const createRoom = (
  req: Request<{}, {}, CreateRoomRequest>,
  res: Response,
  next: NextFunction
): void => {
  try {
    const request = req.body;
    const result = RoomService.createRoom(request);
    res.status(HTTP_STATUS.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

export const getRoom = (
  req: Request<{ roomId: string }>,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { roomId } = req.params;
    const room = RoomService.getRoom(roomId);

    if (!room) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.ROOM_NOT_FOUND });
      return;
    }

    res.status(HTTP_STATUS.OK).json(room);
  } catch (error) {
    next(error);
  }
};

export const joinRoom = (
  req: Request<{}, {}, JoinRoomRequest>,
  res: Response,
  next: NextFunction
): void => {
  try {
    const request = req.body;
    const response = RoomService.joinRoom(request);
    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    next(error);
  }
};

export const leaveRoom = (
  req: Request<{}, {}, LeaveRoomRequest>,
  res: Response,
  next: NextFunction
): void => {
  try {
    const request = req.body;
    const result = RoomService.leaveRoom(request);

    if (result.roomDeleted) {
      res.status(HTTP_STATUS.OK).json({ message: 'Left room successfully. Room was deleted as it became empty.' });
      return;
    }

    res.status(HTTP_STATUS.OK).json(result.room);
  } catch (error) {
    next(error);
  }
};

export const getAvailableRooms = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const rooms = RoomService.findAvailableRooms();

    if (rooms.length === 0) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ error: ERROR_MESSAGES.NO_AVAILABLE_ROOMS });
      return;
    }

    res.status(HTTP_STATUS.OK).json(rooms);
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = (
  req: Request<{}, {}, DeleteRoomRequest>,
  res: Response,
  next: NextFunction
): void => {
  try {
    const request = req.body;
    RoomService.deleteRoomByHost(request.hostId, request.roomId);
    res.status(HTTP_STATUS.OK).json({ message: 'Room deleted successfully' });
  } catch (error) {
    next(error);
  }
};

