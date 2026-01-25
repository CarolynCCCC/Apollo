import { Request, Response, NextFunction } from 'express';
import VoteService from '../services/voteService';
import { VoteTeamRequest } from '../model/game';
import { HTTP_STATUS } from '../constant/api';

export const voteOnTeam = (
  req: Request<{}, {}, VoteTeamRequest>,
  res: Response,
  next: NextFunction
): void => {
  try {
    const request = req.body;
    VoteService.voteOnTeam(request.playerId, request.roomId, request.approve);
    res.status(HTTP_STATUS.OK).json({ message: 'Vote cast successfully' });
  } catch (error) {
    next(error);
  }
};
