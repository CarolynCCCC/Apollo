import express from 'express';
import { updateActivity, getRoleInfo } from '../controller/playerController';
import { API_ROUTES } from '../constant/api';

const router = express.Router();

router.post(API_ROUTES.HEARTBEAT, updateActivity);
router.post(API_ROUTES.GET_ROLE_INFO, getRoleInfo);

export default router;
