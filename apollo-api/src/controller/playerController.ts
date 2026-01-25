import { Request, Response, NextFunction } from 'express';
import PlayerService from '../services/playerService';
import GameService from '../services/gameService';
import { UpdateActivityRequest } from '../model/room';
import { HTTP_STATUS } from '../constant/api';

export const updateActivity = (
  req: Request<{}, {}, UpdateActivityRequest>,
  res: Response,
  next: NextFunction
): void => {
  try {
    const request = req.body;
    PlayerService.updateActivity(request.playerId, request.roomId);
    res.status(HTTP_STATUS.OK).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getRoleInfo = (
  req: Request<{}, {}, { playerId: number; roomId: string }>,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { playerId, roomId } = req.body;
    const roleInfo = GameService.getRoleInfo(playerId, roomId);
    res.status(HTTP_STATUS.OK).json(roleInfo);
  } catch (error) {
    next(error);
  }
};
