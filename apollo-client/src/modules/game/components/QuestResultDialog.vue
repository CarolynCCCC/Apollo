<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore();
</script>
<template>
  <div v-if="gameStore.currentQuestResult" class="bg-stone-800/50 backdrop-blur rounded-lg border p-6"
       :class="{
                   'border-good-600': gameStore.currentQuestResult.result === 'success',
                   'border-evil-600': gameStore.currentQuestResult.result === 'fail'
                 }">
    <h2 class="text-2xl font-bold font-cinzel mb-4 text-center"
        :class="{
                    'text-good-400': gameStore.currentQuestResult.result === 'success',
                    'text-evil-400': gameStore.currentQuestResult.result === 'fail'
                  }">
      Quest {{ gameStore.currentQuestResult.questNumber }} Result:
      {{ gameStore.currentQuestResult.result === 'success' ? 'SUCCESS' : 'FAILED' }}
    </h2>

    <div class="space-y-4">
      <div class="flex justify-center gap-8 mb-4">
        <div class="text-center">
          <div class="text-3xl font-bold text-good-400">{{ gameStore.currentQuestResult.successCount }}</div>
          <div class="text-sm text-stone-400">Success</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-evil-400">{{ gameStore.currentQuestResult.failCount }}</div>
          <div class="text-sm text-stone-400">Fail</div>
        </div>
      </div>

      <div class="bg-stone-700/30 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-medieval-parchment mb-4 text-center">Vote Cards</h3>
        <div class="flex justify-center gap-2">
          <div
              v-for="(vote, index) in gameStore.currentQuestResult.votes"
              :key="index"
              class="w-16 h-20 rounded-lg flex items-center justify-center text-2xl font-bold border-4 shadow-lg"
              :class="{
                        'bg-good-900/30 border-good-500 text-good-300': vote.vote === 'success',
                        'bg-evil-900/30 border-evil-500 text-evil-300': vote.vote === 'fail'
                      }"
          >
            {{ vote.vote === 'success' ? '✓' : '✗' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>