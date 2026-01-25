<template>
  <div class="bg-stone-900 rounded-lg border border-gold-600 p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
    <h2 class="text-3xl font-bold text-gold-400 font-cinzel mb-6 text-center">Quest History</h2>

    <div v-if="Object.keys(gameStore.questResultHistory).length === 0" class="text-center text-stone-400 py-8">
      <p>No quest results yet</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="(quest, roundNum) in gameStore.questResultHistory"
        :key="roundNum"
        class="bg-stone-800/50 rounded-lg p-5 border-2"
        :class="{
          'border-good-600': quest.result === 'success',
          'border-evil-600': quest.result === 'fail'
        }"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-medieval-parchment">Quest {{ roundNum }}</h3>
          <span class="text-2xl font-bold"
                :class="{
                  'text-good-400': quest.result === 'success',
                  'text-evil-400': quest.result === 'fail'
                }">
            {{ quest.result === 'success' ? 'SUCCESS' : 'FAILED' }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="bg-stone-700/30 rounded p-3">
            <p class="text-xs text-stone-400 mb-1">Leader</p>
            <p class="text-medieval-parchment font-semibold">{{ quest.leaderName }}</p>
          </div>
          <div class="bg-stone-700/30 rounded p-3">
            <p class="text-xs text-stone-400 mb-1">Required Fails</p>
            <p class="text-medieval-parchment font-semibold">{{ quest.requiredFails }}</p>
          </div>
        </div>

        <div class="mb-4">
          <h4 class="text-sm text-stone-400 mb-2">Team Members</h4>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="member in quest.teamMembers"
              :key="member.id"
              class="px-3 py-1 bg-gold-900/30 border border-gold-600 rounded text-gold-300 text-sm"
            >
              {{ member.name }}
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-sm text-stone-400 mb-2">Vote Results</h4>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-good-400 font-bold">Success: {{ quest.successCount }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-evil-400 font-bold">Fail: {{ quest.failCount }}</span>
            </div>
          </div>
          <div class="flex gap-2 mt-2">
            <div
              v-for="(vote, index) in quest.votes"
              :key="index"
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
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

    <div class="flex justify-center mt-6">
      <avalon-button @click="closeDialog" class="bg-stone-700 hover:bg-stone-600">
        Close
      </avalon-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore';
import AvalonButton from '@/shared/components/AvalonButton.vue';

const emit = defineEmits<{
  close: []
}>();

const gameStore = useGameStore();

function closeDialog() {
  emit('close');
}
</script>
