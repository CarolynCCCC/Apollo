import http from 'http';
import { WebSocketServer } from 'ws';
import app from './app';
import config from './config/config';
import CleanupService from './services/cleanupService';
import RoomService from './services/roomService';
import PlayerService from './services/playerService';
import GameSocket from './ws/GameSocket';

RoomService.setCleanupService(CleanupService);
PlayerService.setCleanupService(CleanupService);
GameSocket.setPlayerService(PlayerService);
CleanupService.startCleanupTimer();

const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (socket, request) => {
    GameSocket.handleConnection(socket, request);
});

server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`WebSocket server listening on ws://localhost:${config.port}/ws`);
});