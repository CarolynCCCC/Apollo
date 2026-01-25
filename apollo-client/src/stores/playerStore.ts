import { defineStore } from 'pinia';

export const usePlayerStore = defineStore('player', {
  state: () => ({
    currentPlayer: 0 as number | null,
  }),
  persist: true,

  getters: {
    isLoggedIn: (state) => state.currentPlayer !== null,
    playerId: (state) => state.currentPlayer
  },

  actions: {
    setPlayer(playerId: number) {
      this.currentPlayer = playerId
    },

    clearPlayer() {
      this.currentPlayer = null;
    },
  },
});
