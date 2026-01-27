<template>
  <div class="max-w-4xl max-h-[80vh]">
    <div v-if="Object.keys(gameStore.questResultHistory).length === 0" class="text-center text-stone-400 py-8">
      <p>No quest results yet</p>
    </div>

    <div v-else class="space-y-4">
      <div
          v-for="(quest, roundNum) in gameStore.questResultHistory"
          :key="roundNum"
      >
        <div class="flex flex-col items-center justify-between mb-4 gap-2">
          <h3 class="text-xl font-semibold text-medieval-parchment border-b w-full text-center border-stone-600 pb-2">
            Quest {{ roundNum }}</h3>
          <span class="text-2xl text-left w-full font-bold"
                :class="{
                  'text-good-400': quest.result === 'success',
                  'text-evil-400': quest.result === 'fail'
                }">
            {{ quest.result === 'success' ? 'SUCCESS' : 'FAILED' }}
          </span>
        </div>

        <div class="flex gap-4 mb-4 justify-between">
          <div class="w-[50%]">
            <p class="text-xs text-stone-400 mb-1">Leader</p>
            <div class="text-medieval-parchment font-semibold break-words">
              <span class="font-bold">{{ quest.leaderId }}</span>-{{ quest.leaderName }}</div>
          </div>

          <div class="mb-4 w-[50%] text-right">
            <div class="text-xs text-stone-400 mb-1 text-right">Team Members</div>
            <div class="flex flex-col text-right flex-wrap">
              <div class="break-words flex justify-end"
                   v-for="member in quest.teamMembers"
                   :key="member.id"
              >
                {{ member.name }}
                <span class="font-bold">-</span>
                <span class="font-bold">{{ member.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-good-400 font-bold">Success: {{ quest.successCount }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-evil-400 font-bold">Fail: {{ quest.failCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useGameStore} from '@/stores/gameStore';

const gameStore = useGameStore();
</script>
