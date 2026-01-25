<script setup lang="ts">
import AvalonButton from '@/shared/components/AvalonButton.vue'
import { useRoomStore } from '@/stores/roomStore'
import { useGameStore } from '@/stores/gameStore'

// emits
const emit = defineEmits<{
  close: []
}>()

// stores
const roomStore = useRoomStore()
const gameStore = useGameStore()

// methods
function closeDialog() {
  emit('close')
}

function getPlayerName(playerId: number): string {
  const player = roomStore.currentRoom?.players.find(
    p => p.id === playerId
  )
  return player?.name || `Player ${playerId}`
}
</script>

<template>
  <div class="bg-stone-900 rounded-lg border border-gold-600 p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
    <h2 class="text-3xl font-bold text-gold-400 font-cinzel mb-6 text-center">
      Vote History
    </h2>

    <div
      v-if="Object.keys(gameStore.voteHistory).length === 0"
      class="text-center text-stone-400 py-8"
    >
      <p>No vote history yet</p>
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="(roundVotes, roundNum) in gameStore.voteHistory"
        :key="roundNum"
        class="space-y-3"
      >
        <h3
          class="text-xl font-semibold text-medieval-parchment border-b border-stone-600 pb-2"
        >
          Round {{ roundNum }}
        </h3>

        <div class="space-y-3">
          <div
            v-for="(vote, index) in roundVotes"
            :key="index"
            class="bg-stone-800/50 rounded-lg p-4 border-2"
            :class="{
              'border-good-600': vote.approved,
              'border-evil-600': !vote.approved
            }"
          >
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm text-stone-400">
                Proposal #{{ vote.proposalNumber }}
              </span>
              <span
                class="text-xl font-bold"
                :class="{
                  'text-good-400': vote.approved,
                  'text-evil-400': !vote.approved
                }"
              >
                {{ vote.approved ? 'APPROVED' : 'REJECTED' }}
              </span>
              <span class="text-sm text-stone-400">
                {{ vote.approveCount }}-{{ vote.rejectCount }}
              </span>
            </div>

            <div class="flex flex-wrap gap-2 justify-center">
              <div
                v-for="voter in vote.votes"
                :key="voter.playerId"
                class="flex flex-col items-center gap-1"
              >
                <div
                  class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-4"
                  :class="{
                    'bg-good-900/30 border-good-500 text-good-300': voter.approve,
                    'bg-evil-900/30 border-evil-500 text-evil-300': !voter.approve
                  }"
                  :title="voter.playerName || `Player ${voter.playerId}`"
                >
                  {{ voter.approve ? '✓' : '✗' }}
                </div>
                <div
                  class="text-xs text-center text-stone-300 max-w-[60px] truncate"
                >
                  {{ voter.playerName || `Player ${voter.playerId}` }}
                </div>
              </div>
            </div>

            <div
              v-if="!vote.approved && vote.nextLeaderId"
              class="mt-3 text-center text-sm text-stone-400"
            >
              Next Leader: {{ getPlayerName(vote.nextLeaderId) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-center mt-6">
      <AvalonButton
        class="bg-stone-700 hover:bg-stone-600"
        @click="closeDialog"
      >
        Close
      </AvalonButton>
    </div>
  </div>
</template>
