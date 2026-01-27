<script setup lang="ts">
import {useGameStore} from '@/stores/gameStore';
import {computed} from "vue";

const gameStore = useGameStore();
const success = computed(() => gameStore.currentQuestResult?.result === 'success');

</script>
<template>
  <div v-if="gameStore.currentQuestResult" class="flex flex-col gap-3"
       :class="{
                   'border-good-600': gameStore.currentQuestResult.result === 'success',
                   'border-evil-600': gameStore.currentQuestResult.result === 'fail'
                 }">
    <div class="flex flex-col gap-3">
      <h2 class="text-2xl font-bold font-cinzel text-center">
        Quest {{ gameStore.currentQuestResult.questNumber }}
      </h2>
      <div
          class="text-center text-xl font-bold"
          :class="{
                  'text-good-400': success,
                  'text-evil-400': !success
                }"
      >
        {{ success ? 'SUCCESS' : 'FAIL' }}
      </div>
    </div>

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
    </div>
  </div>
</template>