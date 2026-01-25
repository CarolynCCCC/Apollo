import { Request, Response, NextFunction } from 'express';
import GameService from '../services/gameService';
import TeamService from '../services/teamService';
import { StartGameRequest, PlayerReadyRequest, ProposeTeamRequest } from '../model/game';
import { HTTP_STATUS } from '../constant/api';

export const setPlayerReady = (
  req: Request<{}, {}, PlayerReadyRequest>,
  res: Response,
  next: NextFunction
): void => {
  console.log('🎮 setPlayerReady called with:', req.body);
  console.log('🎮 Request headers:', req.headers);
  console.log('🎮 Request path:', req.path);
  console.log('🎮 Request URL:', req.url);

  try {
    const request = req.body;
    console.log('🎮 Calling GameService.setPlayerReady with:', {
      playerId: request.playerId,
      roomId: request.roomId,
      ready: request.ready
    });
    const room = GameService.setPlayerReady(request.playerId, request.roomId, request.ready);
    console.log('🎮 GameService returned room:', room.id);
    res.status(HTTP_STATUS.OK).json(room);
  } catch (error) {
    console.error('🎮 Error in setPlayerReady:', error);
    next(error);
  }
};

export const startGame = (
  req: Request<{}, {}, StartGameRequest>,
  res: Response,
  next: NextFunction
): void => {
  try {
    const request = req.body;
    const room = GameService.startGame(request.hostId, request.roomId);
    res.status(HTTP_STATUS.OK).json({ message: 'Game started successfully', roomStatus: room.status });
  } catch (error) {
    next(error);
  }
};

export const proposeTeam = (
  req: Request<{}, {}, ProposeTeamRequest>,
  res: Response,
  next: NextFunction
): void => {
  try {
    const request = req.body;
    const room = TeamService.proposeTeam(request.leaderId, request.roomId, request.teamMemberIds);
    res.status(HTTP_STATUS.OK).json({ message: 'Team proposed successfully', room });
  } catch (error) {
    next(error);
  }
};

