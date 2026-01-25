# WebSocket Connection Guide

## Connection Flow

### 1. Player Joins Room (REST API)
```bash
POST /api/v1/rooms/join
{
  "playerId": "player123",
  "playerName": "Alice",
  "roomId": "room456"
}
```

### 2. Client Opens WebSocket Connection
```javascript
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  // Register player to room
  ws.send(JSON.stringify({
    type: 'register',
    playerId: 'player123',
    roomId: 'room456'
  }));
};
```

### 3. Server Registers Connection
Server maps: `player123-room456` → WebSocket connection

### 4. Client Receives Messages

#### Room Messages (Broadcast to everyone)
```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'player_joined':
      console.log(`${data.playerName} joined the room`);
      break;
    case 'player_left':
      console.log(`Player ${data.playerId} left`);
      break;
    case 'player_ready':
      console.log(`Player ${data.playerId} is ready: ${data.ready}`);
      break;
    case 'game_started':
      console.log('Game has started!');
      break;
  }
};
```

#### Private Messages (Only to specific player)
```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'role_assigned':
      console.log('Your role:', data.role);
      console.log('Role info:', data.roleInfo);
      break;
    case 'inactivity_warning':
      alert(`You'll be disconnected in ${data.timeRemaining} seconds`);
      break;
  }
};
```

### 5. Client Sends Heartbeat
```javascript
setInterval(() => {
  ws.send(JSON.stringify({
    type: 'heartbeat',
    playerId: 'player123',
    roomId: 'room456'
  }));
}, 300000); // Every 5 minutes
```

---

## Architecture: Single Socket Per Player

### Why ONE Socket (Not Two)?

```
❌ BAD - Two Sockets:
Player → Socket 1 (room) ──┐
      → Socket 2 (private) ─┴→ Server (2x resources, 2x auth, complex)

✅ GOOD - One Socket:
Player → Single Socket ──→ Server routes by message type
                            ↓
                            ├─ Broadcast to room
                            └─ Send to player
```

### Message Routing

Server automatically handles routing:

```typescript
// Room broadcast (everyone sees)
GameSocket.broadcastToRoom(roomId, {
  type: 'player_joined',
  playerId: 'player123'
});

// Private message (only one player sees)
GameSocket.sendToPlayer(playerId, roomId, {
  type: 'role_assigned',
  role: 'Merlin'
});
```

---

## When to Open Socket Connection

### Recommended: Immediately After Join

**Client Side Flow:**
```javascript
// 1. Join room via REST
const joinResponse = await fetch('/api/v1/rooms/join', {
  method: 'POST',
  body: JSON.stringify({
    playerId: 'player123',
    playerName: 'Alice',
    roomId: 'room456'
  })
});

const room = await joinResponse.json();

// 2. Immediately open WebSocket
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  // 3. Register connection
  ws.send(JSON.stringify({
    type: 'register',
    playerId: 'player123',
    roomId: room.id
  }));
};
```

### Why Immediately?
- ✅ Receive real-time updates about other players joining
- ✅ See ready status changes
- ✅ Get notified when game starts
- ✅ Stay connected for entire game session

---

## Complete Client Example

```javascript
class AvalonClient {
  constructor() {
    this.ws = null;
    this.playerId = null;
    this.roomId = null;
  }

  async joinRoom(playerName, roomId = null) {
    // Join via REST API
    const response = await fetch('/api/v1/rooms/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: this.playerId,
        playerName: playerName,
        roomId: roomId
      })
    });

    const room = await response.json();
    this.roomId = room.id;

    // Open WebSocket
    this.connectWebSocket();
  }

  connectWebSocket() {
    this.ws = new WebSocket('ws://localhost:3000');

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      
      // Register to room
      this.send({
        type: 'register',
        playerId: this.playerId,
        roomId: this.roomId
      });

      // Start heartbeat
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed');
      this.stopHeartbeat();
    };
  }

  handleMessage(data) {
    switch(data.type) {
      case 'player_joined':
        this.onPlayerJoined(data);
        break;
      case 'player_left':
        this.onPlayerLeft(data);
        break;
      case 'player_ready':
        this.onPlayerReady(data);
        break;
      case 'game_started':
        this.onGameStarted(data);
        break;
      case 'role_assigned':
        this.onRoleAssigned(data);
        break;
      case 'inactivity_warning':
        this.onInactivityWarning(data);
        break;
    }
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.send({
        type: 'heartbeat',
        playerId: this.playerId,
        roomId: this.roomId
      });
    }, 300000); // 5 minutes
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  setReady(ready) {
    fetch('/api/v1/rooms/ready', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId: this.playerId,
        roomId: this.roomId,
        ready: ready
      })
    });
  }

  // Event handlers (override these)
  onPlayerJoined(data) {}
  onPlayerLeft(data) {}
  onPlayerReady(data) {}
  onGameStarted(data) {}
  onRoleAssigned(data) {}
  onInactivityWarning(data) {}
}
```

---

## Usage Example

```javascript
const client = new AvalonClient();
client.playerId = 'player123';

// Join room
await client.joinRoom('Alice', 'room456');

// Set ready
client.setReady(true);

// Listen to events
client.onPlayerJoined = (data) => {
  console.log(`${data.playerName} joined!`);
  updatePlayerList(data.room.players);
};

client.onRoleAssigned = (data) => {
  console.log('You are:', data.role);
  displayRole(data.role, data.roleInfo);
};
```

---

## Summary

**Architecture: Single WebSocket per Player**
- ✅ Server handles routing (broadcast vs private)
- ✅ Less resource usage
- ✅ Industry standard (Discord, Slack, etc.)
- ✅ Already implemented in your GameSocket!

**When to Connect: Immediately After Join**
1. Player joins room (REST API)
2. Client opens WebSocket
3. Client sends 'register' message
4. Server maps connection
5. Player receives real-time updates

**No need for two sockets!** Your current architecture is correct.
