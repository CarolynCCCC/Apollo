import { Request, Response, NextFunction } from 'express';
import QuestService from '../services/questService';
import { VoteQuestRequest } from '../model/game';
import { HTTP_STATUS } from '../constant/api';

export const voteOnQuest = (
  req: Request<{}, {}, VoteQuestRequest>,
  res: Response,
  next: NextFunction
): void => {
  try {
    const request = req.body;
    QuestService.voteOnQuest(request.playerId, request.roomId, request.success);
    res.status(HTTP_STATUS.OK).json({ message: 'Quest vote cast successfully' });
  } catch (error) {
    next(error);
  }
};
