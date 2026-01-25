# Quest Execution Service - Complete Implementation

## ✅ Complete - Quest Voting & Win Condition System

Successfully implemented quest execution logic with automatic win detection and game flow management.

---

## Implementation Overview

### **`questService.ts`** - Core Quest Logic

**Responsibilities:**
- Quest vote collection from team members
- Vote validation (only team members can vote)
- Good player enforcement (always vote success)
- Vote shuffling for anonymity
- Quest result calculation
- Win condition checking
- Game flow orchestration

---

## Key Features

### 1. **Quest Voting** ✅

**Endpoint:** `POST /api/v1/game/vote-quest`

**Request:**
```json
{
  "playerId": "player3",
  "roomId": "room123",
  "success": false
}
```

**Validation:**
- ✅ Player must be on the quest team
- ✅ Player can only vote once
- ✅ Good players ALWAYS vote success (enforced server-side)
- ✅ Evil players can choose success or fail

**Good Player Protection:**
```typescript
const isEvil = EVIL_ROLES.includes(player.role);
const finalVote = isEvil ? success : true;
```
Even if a Good player tries to send `success: false`, the server enforces `success: true`.

---

### 2. **Quest Fail Requirements** ✅

Implemented as a constant map per Avalon rules:

```typescript
const QUEST_FAIL_REQUIREMENTS = {
  5:  { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
  6:  { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
  7:  { 1: 1, 2: 1, 3: 1, 4: 2, 5: 1 },  // Quest 4 requires 2 fails
  8:  { 1: 1, 2: 1, 3: 1, 4: 2, 5: 1 },  // Quest 4 requires 2 fails
  9:  { 1: 1, 2: 1, 3: 1, 4: 2, 5: 1 },  // Quest 4 requires 2 fails
  10: { 1: 1, 2: 1, 3: 1, 4: 2, 5: 1 },  // Quest 4 requires 2 fails
};
```

**From rules.md:**
> "The quest is completed successfully only if all the cards revealed are success cards."
> "The 4th quest (and only the 4th quest) in games of 7 or more players require at least two Quest failed cards to be a failed Quest."

---

### 3. **Vote Shuffling** ✅

Votes are shuffled before being revealed to maintain anonymity:

```typescript
const shuffledVotes = this.shuffleArray([...currentMission.votes]);
```

**Broadcast format:**
```json
{
  "type": "quest_result",
  "questNumber": 2,
  "result": "fail",
  "successCount": 2,
  "failCount": 1,
  "votes": [
    { "vote": "success" },
    { "vote": "fail" },
    { "vote": "success" }
  ],
  "requiredFails": 1
}
```

Players see the vote distribution but cannot identify who voted what.

---

### 4. **Win Condition Checking** ✅

Automatically checks after each quest resolution:

#### **Good Team Wins (3 successful quests)**
```typescript
if (gameState.completedMissions >= 3) {
  this.handleGoodVictoryCondition(room);
}
```

**Flow:**
1. Check if Assassin exists in the game
2. If yes → Enter **Assassin Phase**
3. If no → Good wins immediately

#### **Evil Team Wins (3 failed quests)**
```typescript
if (gameState.failedMissions >= 3) {
  this.handleEvilVictory(room, 'three_failed_quests');
}
```

Game ends immediately with Evil victory.

---

### 5. **Assassin Phase** ✅

When Good completes 3 quests, the game enters Assassin Phase:

**Public Broadcast (All Players):**
```json
{
  "type": "assassin_phase_started",
  "message": "Good has completed 3 quests! The Assassin must now attempt to identify Merlin."
}
```

**Private Message (Assassin Only):**
```json
{
  "type": "request_assassin_target",
  "message": "You are the Assassin. Choose a player to assassinate. If you find Merlin, Evil wins!",
  "eligibleTargets": [
    { "id": "player1", "name": "Alice" },
    { "id": "player2", "name": "Bob" },
    { "id": "player4", "name": "Diana" }
  ]
}
```

**Room Status Changes:**
- `LOBBY` → `IN_PROGRESS` (game starts)
- `IN_PROGRESS` → `ASSASSIN_PHASE` (good completes 3 quests)
- `ASSASSIN_PHASE` → `FINISHED` (assassin makes choice)

---

### 6. **Next Round Progression** ✅

If neither team has won (< 3 quests completed/failed):

```typescript
private proceedToNextRound(room: Room): void {
  // Increment round
  // Reset proposal number
  // Clear team proposal
  // Notify next leader
}
```

**Public Broadcast:**
```json
{
  "type": "next_round_started",
  "questNumber": 3,
  "leaderId": "player4",
  "leaderName": "Diana",
  "teamSize": 3,
  "completedQuests": 1,
  "failedQuests": 1
}
```

**Private Message (Next Leader):**
```json
{
  "type": "request_team_selection",
  "questNumber": 3,
  "teamSize": 3,
  "message": "You are the leader! Select 3 players for Quest 3"
}
```

---

## Complete Game Flow

```
1. Game Starts
   ↓
2. Leader Proposes Team (teamService)
   ↓
3. All Players Vote on Team (voteService)
   ↓
4. Team Approved? 
   → No: Next Leader (voteService)
   → Yes: Continue ↓
   
5. Team Members Vote on Quest (questService) ✅ NEW
   ↓
6. Quest Result Calculated (questService) ✅ NEW
   ↓
7. Check Win Condition (questService) ✅ NEW
   ↓
   
8a. Good Wins (3 Successes)
    ↓
    Assassin Phase (questService) ✅ NEW
    ↓
    Assassin Targets Player (assassinService - TODO)
    
8b. Evil Wins (3 Failures)
    ↓
    Game Over (questService) ✅ NEW
    
8c. No Winner Yet
    ↓
    Next Round (questService) ✅ NEW
    ↓
    Go to Step 2
```

---

## WebSocket Events Added

### Public Events (Broadcast to All)

1. **`QUEST_VOTE_CAST`** - Player has voted
```json
{
  "type": "quest_vote_cast",
  "playerId": "player2",
  "playerName": "Bob",
  "votesCount": 2,
  "totalTeamMembers": 3
}
```

2. **`QUEST_RESULT`** - Quest outcome revealed
```json
{
  "type": "quest_result",
  "questNumber": 2,
  "result": "fail",
  "successCount": 2,
  "failCount": 1,
  "votes": [{ "vote": "success" }, { "vote": "fail" }, { "vote": "success" }],
  "requiredFails": 1
}
```

3. **`NEXT_ROUND_STARTED`** - Next quest begins
```json
{
  "type": "next_round_started",
  "questNumber": 3,
  "leaderId": "player4",
  "leaderName": "Diana",
  "teamSize": 3,
  "completedQuests": 1,
  "failedQuests": 1
}
```

4. **`ASSASSIN_PHASE_STARTED`** - Assassin phase triggered
```json
{
  "type": "assassin_phase_started",
  "message": "Good has completed 3 quests! The Assassin must now attempt to identify Merlin."
}
```

5. **`GAME_ENDED`** - Game over
```json
{
  "type": "game_ended",
  "winner": "good" | "evil",
  "reason": "three_successful_quests" | "three_failed_quests" | "five_rejections" | "merlin_assassinated",
  "message": "Good wins! Three quests completed successfully."
}
```

### Private Events (Send to Specific Player)

1. **`REQUEST_ASSASSIN_TARGET`** - Sent to Assassin only
```json
{
  "type": "request_assassin_target",
  "message": "You are the Assassin. Choose a player to assassinate...",
  "eligibleTargets": [...]
}
```

---

## Files Created/Modified

### New Files ✅
1. `src/services/questService.ts` (267 lines)
2. `src/controller/questController.ts` (17 lines)

### Modified Files ✅
3. `src/constant/websocket.ts` - Added 5 new message types
4. `src/constant/api.ts` - Added VOTE_QUEST route, ASSASSIN_PHASE status
5. `src/model/game.ts` - Added VoteQuestRequest interface
6. `src/routes/game.ts` - Added quest vote route

---

## Architecture Summary

```
Current Service Structure:
├── gameService (172 lines) - Game lifecycle
├── roleService (146 lines) - Role assignment
├── teamService (106 lines) - Team proposals
├── voteService (165 lines) - Team voting
├── questService (267 lines) - Quest execution ✅ NEW
├── roomService (322 lines) - Room management
├── playerService (50 lines) - Player activity
└── cleanupService (96 lines) - Inactivity cleanup

Total: 8 well-organized services
```

---

## What's Left to Implement

### ✅ DONE:
- Game start & role assignment
- Team proposals
- Team voting & rejection handling
- Quest execution & voting
- Win condition detection
- Assassin phase initiation

### ⚠️ TODO:
1. **`assassinService.ts`** - Handle assassin's target selection
2. **Quest targeting (optional rule)** - Allow choosing quest order
3. **Lady of the Lake (optional rule)** - Loyalty checking ability

---

## Testing the Flow

### Frontend Flow for Quest Voting:

```javascript
// 1. Team approved, members receive quest vote request
ws.onmessage = (event) => {
  if (data.type === 'request_quest_vote') {
    if (data.canFail) {
      showQuestVoteUI(); // Success or Fail buttons
    } else {
      showQuestVoteUI(); // Success only (auto-vote for Good)
    }
  }
};

// 2. Player votes
function voteOnQuest(success) {
  fetch('/api/v1/game/vote-quest', {
    method: 'POST',
    body: JSON.stringify({
      playerId: currentPlayerId,
      roomId: currentRoomId,
      success: success
    })
  });
}

// 3. See vote progress
ws.onmessage = (event) => {
  if (data.type === 'quest_vote_cast') {
    updateVoteCounter(data.votesCount, data.totalTeamMembers);
  }
};

// 4. See quest result
ws.onmessage = (event) => {
  if (data.type === 'quest_result') {
    displayQuestResult(data.result, data.votes, data.failCount);
  }
};

// 5. Game ends or continues
ws.onmessage = (event) => {
  if (data.type === 'assassin_phase_started') {
    showAssassinPhase();
  } else if (data.type === 'next_round_started') {
    showNextRound(data.questNumber, data.leaderName);
  } else if (data.type === 'game_ended') {
    showGameOver(data.winner, data.reason);
  }
};
```

---

## Summary

✅ **Quest voting fully implemented**  
✅ **Good players protected** (server enforces success vote)  
✅ **Quest fail requirements** per official rules  
✅ **Vote shuffling** for anonymity  
✅ **Win condition detection** automatic  
✅ **Assassin phase** properly initiated  
✅ **Game flow** seamless progression  
✅ **Build successful** - Zero errors  

**Next:** Implement `assassinService.ts` to handle the assassin's target selection and complete the game! 🎯
