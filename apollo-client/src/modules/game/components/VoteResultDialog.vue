<script setup lang="ts">
import {useGameStore} from "@/stores/gameStore.ts";
import {computed} from "vue";
import {useRoomStore} from "@/stores/roomStore.ts";

const gameStore = useGameStore();
const roomStore = useRoomStore();
const allPlayers = computed(() => roomStore.currentRoom?.players || []);

</script>

<template>
  <div v-if="gameStore.voteResult" class="flex flex-col gap-3">
    <h2 class="text-2xl font-bold font-cinzel text-center">
      Vote Result
    </h2>
    <div
        class="text-xl font-bold text-center"
        :class="{
                  'text-good-400': gameStore.voteResult.approved,
                  'text-evil-400': !gameStore.voteResult.approved
                }">
      {{ gameStore.voteResult.approved ? 'APPROVED' : 'REJECTED' }}
    </div>

    <div class="space-y-4">
      <div class="flex justify-center gap-8 mb-4">
        <div class="text-center">
          <div class="text-3xl font-bold text-good-400">{{ gameStore.voteResult.approveCount }}</div>
          <div class="text-sm text-stone-400">Approve</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-evil-400">{{ gameStore.voteResult.rejectCount }}</div>
          <div class="text-sm text-stone-400">Reject</div>
        </div>
      </div>

      <div class="bg-stone-700/30 rounded-lg p-6">
        <div class="flex flex-wrap justify-center gap-4">
          <div
              v-for="vote in gameStore.voteResult.votes"
              :key="vote.playerId"
              class="flex flex-col items-center gap-2"
          >
            <div
                class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all"
                :class="{
                          'bg-good-900/30 border-good-500 text-good-300': vote.approve,
                          'bg-evil-900/30 border-evil-500 text-evil-300': !vote.approve
                        }"
            >
              {{ vote.approve ? '✓' : '✗' }}
            </div>
            <div class="text-xs text-center text-stone-300 max-w-[80px] truncate">
              {{ vote.playerName || `Player ${vote.playerId}` }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>