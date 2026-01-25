import express from 'express';
import { setPlayerReady, startGame, proposeTeam } from '../controller/gameController';
import { voteOnTeam } from '../controller/voteController';
import { voteOnQuest } from '../controller/questController';
import { assassinateTarget } from '../controller/assassinController';
import { API_ROUTES } from '../constant/api';

const router = express.Router();

router.post(API_ROUTES.PLAYER_READY, setPlayerReady);
router.post(API_ROUTES.START_GAME, startGame);
router.post(API_ROUTES.PROPOSE_TEAM, proposeTeam);
router.post(API_ROUTES.VOTE_TEAM, voteOnTeam);
router.post(API_ROUTES.VOTE_QUEST, voteOnQuest);
router.post(API_ROUTES.ASSASSINATE_TARGET, assassinateTarget);

export default router;
