import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { WS_MESSAGE_TYPES, WS_SOCKET_EVENTS, WS_ERROR_MESSAGES, WS_CONNECTION_KEY_SEPARATOR } from '../constant/websocket';

interface PlayerConnection {
  playerId: number;
  roomId: string;
  socket: WebSocket;
}

interface IPlayerService {
  updateActivity(playerId: number, roomId: string): void;
}

class GameSocket {
  private static instance: GameSocket;
  private connections = new Map<string, PlayerConnection>();
  private playerService?: IPlayerService;

  private constructor() {}

  static getInstance(): GameSocket {
    if (!GameSocket.instance) {
      GameSocket.instance = new GameSocket();
    }
    return GameSocket.instance;
  }

  setPlayerService(playerService: IPlayerService): void {
    this.playerService = playerService;
  }

  handleConnection(socket: WebSocket, request: IncomingMessage): void {
    socket.on(WS_SOCKET_EVENTS.MESSAGE, (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(socket, message);
      } catch (error) {
        socket.send(JSON.stringify({ error: WS_ERROR_MESSAGES.INVALID_MESSAGE_FORMAT }));
      }
    });

    socket.on(WS_SOCKET_EVENTS.CLOSE, () => {
      this.handleDisconnection(socket);
    });
  }

  private handleMessage(socket: WebSocket, message: any): void {
    if (message.type === WS_MESSAGE_TYPES.REGISTER) {
      this.registerPlayer(socket, message.playerId, message.roomId);
    } else if (message.type === WS_MESSAGE_TYPES.HEARTBEAT) {
      this.handleHeartbeat(message.playerId, message.roomId);
    }
  }

  private handleHeartbeat(playerId: number, roomId: string): void {
    if (this.playerService) {
      this.playerService.updateActivity(playerId, roomId);
    }
  }

  registerPlayer(socket: WebSocket, playerId: number, roomId: string): void {
    const connectionKey = `${playerId}${WS_CONNECTION_KEY_SEPARATOR}${roomId}`;

    const existingConnection = this.connections.get(connectionKey);
    if (existingConnection) {
      console.log(`Closing existing connection for player ${playerId} in room ${roomId}`);
      existingConnection.socket.close();
    }

    this.connections.set(connectionKey, {
      playerId,
      roomId,
      socket,
    });

    console.log(`Player ${playerId} registered in room ${roomId}. Total connections: ${this.connections.size}`);
    console.log(`Connections in room ${roomId}:`, Array.from(this.connections.values()).filter(c => c.roomId === roomId).map(c => c.playerId));
  }

  disconnectPlayer(playerId: number, roomId: string): void {
    const connectionKey = `${playerId}${WS_CONNECTION_KEY_SEPARATOR}${roomId}`;
    const connection = this.connections.get(connectionKey);

    if (connection) {
      connection.socket.close();
      this.connections.delete(connectionKey);
    }
  }

  private handleDisconnection(socket: WebSocket): void {
    for (const [key, connection] of this.connections.entries()) {
      if (connection.socket === socket) {
        this.connections.delete(key);
        break;
      }
    }
  }

  broadcastToRoom(roomId: string, message: any): void {
    const messageString = JSON.stringify(message);
    console.log(`Broadcasting to room ${roomId}:`, message.type, `to ${Array.from(this.connections.values()).filter(c => c.roomId === roomId).length} connections`);

    for (const connection of this.connections.values()) {
      if (connection.roomId === roomId && connection.socket.readyState === WebSocket.OPEN) {
        console.log(`  -> Sending to player ${connection.playerId}`);
        connection.socket.send(messageString);
      }
    }
  }

  sendToPlayer(playerId: number, roomId: string, message: any): void {
    const connectionKey = `${playerId}${WS_CONNECTION_KEY_SEPARATOR}${roomId}`;
    const connection = this.connections.get(connectionKey);

    if (connection && connection.socket.readyState === WebSocket.OPEN) {
      connection.socket.send(JSON.stringify(message));
    }
  }
}

export default GameSocket.getInstance();
