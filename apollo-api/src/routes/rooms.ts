import express from 'express';
import {
  createRoom,
  getRoom,
  joinRoom,
  getAvailableRooms,
  leaveRoom,
  deleteRoom,
} from '../controller/roomController';
import { API_ROUTES } from '../constant/api';

const router = express.Router();

router.post(API_ROUTES.ROOMS, createRoom);
router.post(API_ROUTES.JOIN_ROOM, joinRoom);
router.post(API_ROUTES.LEAVE_ROOM, leaveRoom);
router.post(API_ROUTES.DELETE_ROOM, deleteRoom);
router.post(API_ROUTES.GET_AVAILABLE_ROOMS, getAvailableRooms);
router.post(API_ROUTES.ROOM_BY_ID, getRoom);

export default router;
