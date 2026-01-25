# Avalon Frontend – AI Coding Template

You are a senior frontend engineer.

Your task is to generate a **production-ready Avalon game frontend** using **Vue 3, TypeScript, Pinia, and WebSocket**.

The project folder is `apollo-client`

You do not need to generate documentation for your steps and codes, do not generate any .md files.

You must prioritize:
- speed
- correctness
- maintainability (easy to change characters, rules, UI, or features)
- clean architecture
- best practices in Vue, TypeScript, Pinia, and WebSocket
- reduce code duplication
- strict typing and type sharing with backend models

Do not include comments in the code.

---

## Tech Stack

- Vue 3
- TypeScript
- Pinia
- Vue Router
- Vite
- WebSocket (use vue native useWebSocket())
- Axios (for REST calls)
- Tailwind CSS (optional but recommended)
- SCSS support (optional)

---

## Project Structure

Follow this structure:

src/
    api/
        axios.ts
        room.ts
        player.ts
        game.ts
    assets/
        fonts/
        images/
        icons/
    shared/
        components/
        composables/
        model/
    modules/
        lobby/
            pages/
            components/
        game/
            pages/
            components/
        room/
            pages/
            components/
routes.ts
index.ts
    stores/
        roomStore.ts
        playerStore.ts
        gameStore.ts
        uiStore.ts
    styles/
        fonts.scss
        index.scss
    ws/
        GameSocket.ts
    App.vue
    main.ts
---

## Rules & Requirements

### TypeScript & Types
- All types must be defined in `src/models`
- No `any`
- Types should match backend models and be shared via copy/paste or shared package

### API Layer
- Use Axios for REST calls
- Create separate API modules for each entity
- Handle errors with typed responses
- Use interceptors for auth token injection
- Always call APIs from Pinia actions and save results to stores

### WebSocket Layer
- Implement `GameSocket.ts` as a reusable WebSocket client
- Use a Pinia store to manage WebSocket events
- Validate all incoming messages and use strict typing
- Handle reconnect logic and event buffering

### State Management (Pinia)
- Use Pinia for global state
- Each store should have:
    - state
    - getters
    - actions
- import { defineStore } from 'pinia'
- example
export const useCounterStore = defineStore('counter', {
state: () => {
return { count: 0 }
},
// could also be defined as
// state: () => ({ count: 0 })
actions: {
increment() {
this.count++
},
},
})
- No business logic in components
- Components should only dispatch actions and read state
- refer https://vuejs.org/guide/scaling-up/state-management for best practice

### Routing
- Use Vue Router for navigation
- Route guard to ensure players join a room before entering game page
- Route paths:
    - `/` → Lobby
    - `/room/:roomId` → Room
    - `/game/:roomId` → Game
    - `/end/:roomId` → End
      https://vuejs.org/guide/scaling-up/routing

### UI & Components
- UI must be component-driven
- Use Tailwind SCSS for styling
- UI components should be reusable
- Use Headless UI
- Ensure mobile responsiveness

---

## Game Logic & UI Flow

### Lobby
- Create room
- Join room
- Display room ID and player list
- Room owner can start game
- Use REST for join/create

### Room
- Show player list
- Show ready status
- Show current leader
- Allow team selection (if leader)
- Allow mission vote
- Use WebSocket to sync state

### Game
- Phase-based UI (Role reveal, Team select, Voting, Mission, Assassin)
- All state updates via WebSocket
- Use Pinia actions to update state

### End
- Show final result and roles
- Option to restart or return to lobby

---

## Architectural Rules

- No business logic inside components
- Pinia is the single source of truth
- WebSocket is the single source for game state updates during gameplay
- REST is used only for lobby and room actions
- Avoid circular dependencies
- Prefer composition API and `<script setup>`
- Use composables for reusable logic

---

## Output Rules

- Generate all necessary files
- Use TypeScript everywhere
- No comments in code
- Clean formatting
- Consistent naming
- Deterministic behavior
- Start by generating the full project structure and core files

