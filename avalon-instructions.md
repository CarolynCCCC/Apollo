# Avalon Backend – AI Coding Template

You are a senior backend engineer.

Your task is to generate a **production-ready Avalon game backend** using **Node.js, Express, and TypeScript**.

You do not need to generate documentation for your steps and codes.

You must prioritize:
- speed
- correctness
- maintainability, make it easy if future want to change a character setting, or enhancements
- clean architecture
- best practices in Node.js, Express, and TypeScript
- reduce code duplication

Do not include comments in the code.

---

## Tech Stack

- Node.js
- Express
- TypeScript
- dotenv
- WebSocket (ws)

---

## Project Structure

Follow this structure exactly:

src/
- config/
    - config.ts
- constant/
- controller/
- middleware/
- model/
- routes/
- state/
- ws/
    - GameSocket.ts
- app.ts
- server.ts

---

## Configuration Rules

- All environment variables must be read from `.env`
- `config/config.ts` must expose typed configuration values
- No hardcoded port numbers or secrets

---

## Game Rules

Implement the game logic based strictly on the official Avalon rules in `rules.md` that is passed together.

You must support:
- game room configuration (optional characters and rules)
- role assignment
- good vs evil team balance
- role abilities and visibility rules
- mission voting and outcomes
- 
- assassin endgame condition

---

## Core Requirements

### Rooms
- Players can create a room
- Players can join a room using a `roomId`
- Each room has isolated game state
- Room lifecycle must be clearly defined
- Room creater can specify some optional 

### Players
- Each player has a unique id
- Each player belongs to exactly one room
- Player state must be synchronized through WebSocket during gameplay

---

## Folder Responsibilities

### config/
- Application configuration
- Environment variable parsing
- Strong typing

### constant/
- Role definitions
- Team alignment
- Player count to role mapping
- Mission requirements
- Any static game data

### model/
- TypeScript interfaces and types only
- No logic
- Covers Player, Room, GameState, Role, Mission

### state/
- Central game state service
- One instance per room
- Handles all game transitions
- No direct HTTP or WebSocket access

### controller/
- REST endpoints only
- Thin controllers
- No business logic
- One controller per entity

### routes/
- Route definitions
- Maps routes to controllers
- Versioned API structure

### middleware/
- Only include if required
- Must be reusable and generic

### ws/
- `GameSocket.ts` manages all WebSocket connections
- Handles player connection, disconnection, and events
- Delegates game logic to state layer only

### .env
- you can declare environment variables here like PORT, SECRET_KEY, etc. in the .env file which is outside of the src/ folder

## Application Entry

### app.ts
- Express app setup
- Middleware registration
- Route registration
- No server listen logic

### server.ts
- HTTP server creation
- WebSocket server initialization
- Starts listening on configured port

---

## Architectural Rules

- Controllers must never mutate game state directly
- State layer is the single source of truth
- WebSocket events must be validated
- All public APIs must be typed
- Avoid circular dependencies
- Prefer composition over inheritance

---

## Output Rules

- Generate all necessary files
- Use TypeScript everywhere
- No comments in code
- Clean formatting
- Consistent naming
- Deterministic behavior

Start by scanning through the project structure in src/ to understand and start planning and generating code.