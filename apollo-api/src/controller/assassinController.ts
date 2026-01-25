import { Request, Response, NextFunction } from 'express';
import AssassinService from '../services/assassinService';
import { HTTP_STATUS } from '../constant/api';

export interface AssassinateTargetRequest {
  assassinId: number;
  targetId: number;
  roomId: string;
}

export const assassinateTarget = (
  req: Request<{}, {}, AssassinateTargetRequest>,
  res: Response,
  next: NextFunction
): void => {
  try {
    const request = req.body;
    AssassinService.assassinateTarget(request.assassinId, request.targetId, request.roomId);
    res.status(HTTP_STATUS.OK).json({ message: 'Assassination attempt completed' });
  } catch (error) {
    next(error);
  }
};
