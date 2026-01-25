tally # Assassin Service & Win Condition Service - Complete Implementation

## ✅ Complete - Endgame & Win Condition System

Successfully implemented the assassin's target selection and extracted win condition logic into a reusable service.

---

## New Services Created

### 1. **`winConditionService.ts`** ✅ (65 lines)

**Purpose:** Centralized win condition handling for reusability across services

**Methods:**
- `handleGoodVictory(room)` - Good team wins
- `handleEvilVictory(room, reason)` - Evil team wins  
- `getEvilVictoryMessage(reason)` - Generate victory message

**Win Reasons:**
- `three_successful_quests` - Good completes 3 quests
- `three_failed_quests` - Evil fails 3 quests
- `five_rejections` - Evil wins by 5 team rejections
- `merlin_assassinated` - Assassin finds Merlin

**Used By:**
- `questService` - Quest completion wins
- `voteService` - Five rejection wins
- `assassinService` - Assassination wins

---

### 2. **`assassinService.ts`** ✅ (73 lines)

**Purpose:** Handle assassin's target selection in endgame

**Endpoint:** `POST /api/v1/game/assassinate`

**Request:**
```json
{
  "assassinId": "player5",
  "targetId": "player2",
  "roomId": "room123"
}
```

**Validations:**
✅ Room must exist  
✅ Game must be in `ASSASSIN_PHASE`  
✅ Requester must be the Assassin  
✅ Target must exist in room  
✅ Assassin cannot target themselves  

**Logic Flow:**
```typescript
1. Validate all conditions
2. Check if target is Merlin
3. Broadcast assassination result (with target's role)
4. If Merlin → Evil wins
5. If not Merlin → Good wins
```

**WebSocket Broadcast:**
```json
{
  "type": "assassin_result",
  "assassinId": "player5",
  "assassinName": "Eve",
  "targetId": "player2",
  "targetName": "Bob",
  "success": true,
  "targetRole": "merlin",
  "message": "The Assassin has found Merlin! Bob was Merlin."
}
```

---

### 3. **`assassinController.ts`** ✅ (21 lines)

**Purpose:** HTTP controller for assassination endpoint

**Interface:**
```typescript
export interface AssassinateTargetRequest {
  assassinId: string;
  targetId: string;
  roomId: string;
}
```

**Response:**
```json
{
  "message": "Assassination attempt completed"
}
```

---

## Service Architecture - Before vs After

### Before (Duplicated Logic):
```
questService
├── checkWinCondition()
├── handleGoodVictory() ❌ Duplicated
├── handleEvilVictory() ❌ Duplicated
└── getEvilVictoryMessage() ❌ Duplicated

voteService
├── handleFiveRejections()
├── handleEvilVictory() ❌ Duplicated
└── getEvilVictoryMessage() ❌ Duplicated
```

### After (DRY Principle):
```
winConditionService ✅ Single source of truth
├── handleGoodVictory()
├── handleEvilVictory()
└── getEvilVictoryMessage()

questService ✅ Uses winConditionService
├── checkWinCondition()
└── handleGoodVictoryCondition()

voteService ✅ Uses winConditionService
└── handleFiveRejections()

assassinService ✅ Uses winConditionService
└── assassinateTarget()
```

---

## Complete Game Flow (End-to-End)

```
1. Game Starts
   ↓
2. Leader Proposes Team (teamService)
   ↓
3. All Players Vote on Team (voteService)
   ↓
4. Team Approved?
   → No: Next Leader
      - 5 rejections? → Evil Wins (voteService → winConditionService) ✅
   → Yes: Continue ↓
   
5. Team Members Vote on Quest (questService)
   ↓
6. Quest Result Calculated (questService)
   ↓
7. Check Win Condition (questService → winConditionService) ✅
   ↓
   
8a. Good Wins (3 Successes)
    ↓
    Assassin Exists?
    → Yes: Assassin Phase (questService) ✅
       ↓
       Assassin Selects Target (assassinService) ✅
       ↓
       Target = Merlin?
       → Yes: Evil Wins (assassinService → winConditionService) ✅
       → No: Good Wins (assassinService → winConditionService) ✅
    → No: Good Wins (questService → winConditionService) ✅
    
8b. Evil Wins (3 Failures)
    ↓
    Game Over (questService → winConditionService) ✅
    
8c. No Winner Yet
    ↓
    Next Round (questService)
    ↓
    Go to Step 2
```

---

## All Win Conditions Implemented

### ✅ **1. Good Wins - 3 Successful Quests**
```typescript
// questService checks after each quest
if (gameState.completedMissions >= 3) {
  handleGoodVictoryCondition(room); // Triggers assassin phase
}
```

### ✅ **2. Good Wins - Assassin Misses Merlin**
```typescript
// assassinService
if (!isMerlin) {
  WinConditionService.handleGoodVictory(room);
}
```

### ✅ **3. Evil Wins - 3 Failed Quests**
```typescript
// questService checks after each quest
if (gameState.failedMissions >= 3) {
  WinConditionService.handleEvilVictory(room, 'three_failed_quests');
}
```

### ✅ **4. Evil Wins - 5 Team Rejections**
```typescript
// voteService handles rejection counter
if (updatedRoom.gameState.currentProposalNumber >= 5) {
  WinConditionService.handleEvilVictory(room, 'five_rejections');
}
```

### ✅ **5. Evil Wins - Assassin Finds Merlin**
```typescript
// assassinService
if (isMerlin) {
  WinConditionService.handleEvilVictory(room, 'merlin_assassinated');
}
```

---

## WebSocket Events

### New Event Added

**`ASSASSIN_RESULT`** - Broadcast assassination outcome
```json
{
  "type": "assassin_result",
  "assassinId": "player5",
  "assassinName": "Eve",
  "targetId": "player2",
  "targetName": "Bob",
  "success": true,
  "targetRole": "merlin",
  "message": "The Assassin has found Merlin! Bob was Merlin."
}
```

---

## Files Created/Modified

### New Files ✅
1. `src/services/winConditionService.ts` (65 lines)
2. `src/services/assassinService.ts` (73 lines)
3. `src/controller/assassinController.ts` (21 lines)

### Modified Files ✅
4. `src/services/questService.ts` - Uses winConditionService, removed duplicate logic
5. `src/services/voteService.ts` - Uses winConditionService, removed duplicate logic
6. `src/constant/websocket.ts` - Added `ASSASSIN_RESULT` message type
7. `src/constant/api.ts` - Added `ASSASSINATE_TARGET` route
8. `src/routes/game.ts` - Added assassination route

---

## Validation Logic

### AssassinService Validations:

```typescript
// 1. Room exists
if (!room) {
  throw new Error('Room not found');
}

// 2. Game is in assassin phase
if (room.status !== ROOM_STATUS.ASSASSIN_PHASE) {
  throw new Error('Game is not in assassin phase');
}

// 3. Requester is the assassin
if (assassin.role !== ROLES.ASSASSIN) {
  throw new Error('Only the Assassin can perform this action');
}

// 4. Target exists
if (!target) {
  throw new Error('Target player not found');
}

// 5. Cannot self-target
if (target.id === assassin.id) {
  throw new Error('Assassin cannot target themselves');
}
```

---

## Frontend Integration

### Assassin Phase Flow:

```javascript
// 1. Assassin receives request
ws.onmessage = (event) => {
  if (data.type === 'assassin_phase_started') {
    showAssassinPhaseNotification();
  }
  
  if (data.type === 'request_assassin_target') {
    showTargetSelectionUI(data.eligibleTargets);
  }
};

// 2. Assassin selects target
function assassinateTarget(targetId) {
  fetch('/api/v1/game/assassinate', {
    method: 'POST',
    body: JSON.stringify({
      assassinId: currentPlayerId,
      targetId: targetId,
      roomId: currentRoomId
    })
  });
}

// 3. All players see result
ws.onmessage = (event) => {
  if (data.type === 'assassin_result') {
    showAssassinationResult({
      assassin: data.assassinName,
      target: data.targetName,
      targetRole: data.targetRole,
      success: data.success,
      message: data.message
    });
  }
  
  if (data.type === 'game_ended') {
    showGameOver(data.winner, data.reason, data.message);
  }
};
```

---

## Architecture Summary

```
Current Service Structure (9 services):
├── gameService (172 lines) - Game lifecycle
├── roleService (146 lines) - Role assignment
├── teamService (106 lines) - Team proposals
├── voteService (165 lines) - Team voting
├── questService (178 lines) - Quest execution
├── winConditionService (65 lines) - Win detection ✅ NEW
├── assassinService (73 lines) - Assassin targeting ✅ NEW
├── roomService (322 lines) - Room management
├── playerService (50 lines) - Player activity
└── cleanupService (96 lines) - Inactivity cleanup
```

---

## Benefits of This Architecture

### ✅ **1. DRY Principle**
- Win condition logic in ONE place
- No code duplication
- Easy to modify win messages

### ✅ **2. Single Responsibility**
- `winConditionService` - Only handles win/loss
- `assassinService` - Only handles assassination
- `questService` - Only handles quests
- `voteService` - Only handles voting

### ✅ **3. Reusability**
- Any service can check win conditions
- Easy to add new win conditions
- Consistent win messaging

### ✅ **4. Testability**
- Test win conditions independently
- Mock winConditionService easily
- Test assassination logic separately

### ✅ **5. Maintainability**
- Change win message? Edit one file
- Add new win condition? Add to winConditionService
- Clear separation of concerns

---

## Complete Features Implemented

### ✅ Game Setup
- [x] Room creation & configuration
- [x] Player joining & leaving
- [x] Role assignment
- [x] Ready system
- [x] Game initialization

### ✅ Game Flow
- [x] Leader rotation
- [x] Team proposals
- [x] Team voting
- [x] Quest execution
- [x] Quest voting
- [x] Round progression

### ✅ Win Conditions
- [x] Good wins (3 successes)
- [x] Evil wins (3 failures)
- [x] Evil wins (5 rejections)
- [x] Assassin phase
- [x] Assassin targeting
- [x] Merlin assassination

### ✅ Special Features
- [x] Role visibility rules
- [x] Vote shuffling
- [x] Quest fail requirements
- [x] Inactivity cleanup

---

## Build Status

✅ **Build successful** - Zero errors  
✅ **All win conditions implemented**  
✅ **No code duplication**  
✅ **Clean architecture**  

---

## What's Left (Optional Features)

### From rules.md:

1. **Lady of the Lake** (Optional Rule)
   - Loyalty checking ability
   - Used after quests 2, 3, and 4

2. **Quest Targeting** (Optional Rule)
   - Choose quest order
   - Strategic planning

3. **Plot Cards** (Optional Rule)
   - From "The Resistance" expansion
   - Requires loyalty cards

These are optional enhancements and not required for core gameplay!

---

## Summary

The Avalon game backend is now **feature-complete** for standard gameplay! 

✅ All core mechanics implemented  
✅ All win conditions working  
✅ Clean, maintainable architecture  
✅ Production-ready code  
✅ Full validation  
✅ Comprehensive WebSocket events  

**Your game is ready to play!** 🎉🎯
