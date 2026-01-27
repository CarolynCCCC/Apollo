<script setup lang="ts">
import AvalonButton from '@/shared/components/AvalonButton.vue'
import {useRoomStore} from '@/stores/roomStore'
import {useGameStore} from '@/stores/gameStore'
import {ref} from "vue";
import QuestHistoryDialog from "@/modules/game/components/QuestHistoryDialog.vue";

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

const isViewingVoteHistory = ref(false)

function getPlayerName(playerId: number): string {
  const player = roomStore.currentRoom?.players.find(
      p => p.id === playerId
  )
  return player?.name || `Player ${playerId}`
}
</script>

<template>
  <div>
    <div class="flex gap-3 justify-between mb-6">
      <AvalonButton
          class="flex-1"
          :class="{
          'bg-stone-700 text-stone-500 hover:bg-stone-600': isViewingVoteHistory,
          'bg-gold-600 hover:bg-gold-700': !isViewingVoteHistory
        }"
          @click="isViewingVoteHistory = false"
      >
        Quest
      </AvalonButton>
      <AvalonButton
          class="flex-1"
          :class="{
          'bg-stone-700 text-stone-500 hover:bg-stone-600': !isViewingVoteHistory,
          'bg-gold-600 hover:bg-gold-700': isViewingVoteHistory
        }"
          @click="isViewingVoteHistory = true"
      >
        Vote
      </AvalonButton>
    </div>
  </div>
  <div v-if="isViewingVoteHistory" class="max-w-4xl max-h-[80vh]">
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
            class="text-xl text-center font-semibold text-medieval-parchment border-b border-stone-600 pb-2"
        >
          Round {{ roundNum }}
        </h3>

        <div class="space-y-3">
          <div
              v-for="(vote, index) in roundVotes"
              :key="index"
          >
            <div class="flex flex-col gap-3 justify-between mb-3">
              <div class="flex flex-row justify-between">
                <span class="text-sm text-stone-400">
                Proposal #{{ vote.proposalNumber }}
              </span>
                <span class="text-sm text-stone-400">
                {{ vote.approveCount }}-{{ vote.rejectCount }}
              </span>
              </div>
              <div
                  class="text-xl font-bold"
                  :class="{
                  'text-good-400': vote.approved,
                  'text-evil-400': !vote.approved
                }"
              >
                {{ vote.approved ? 'APPROVED' : 'REJECTED' }}
              </div>
            </div>

            <div class="flex gap-4 justify-between">
              <div class=" w-[50%] ">
                <p class="text-xs text-stone-400 mb-1">Leader</p>
                <div class="break-words">
                  <span class="font-bold">{{ vote.questLeaderId}}</span>-{{ vote.leaderName }}
                </div>
              </div>

              <div class="mb-4 w-[50%] text-right">
                <p class="text-xs text-stone-400 mb-1">Team Members</p>
                <div class="flex flex-wrap flex-col text-right">
                  <div class="break-words flex flex-row justify-end"
                      v-for="member in vote.teamMembers"
                      :key="member"
                  >
                    {{ useRoomStore().getPlayerNameById(member) }}
                    <span class="font-bold">-</span>
                    <span class="font-bold">{{ member}}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 justify-center">
              <div
                  v-for="voter in vote.votes"
                  :key="voter.playerId"
                  class="flex flex-col items-center gap-1"
              >
                <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
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
                  {{ `${voter.playerId}` }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <quest-history-dialog></quest-history-dialog>
  </div>
</template>
