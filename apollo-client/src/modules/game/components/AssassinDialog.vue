<template>
  <div class="bg-red-950/95 rounded-lg border-4 border-red-600 p-8 max-w-3xl shadow-2xl">
    <h2 class="text-4xl font-bold text-red-400 font-cinzel mb-6 text-center">
      ⚔️ ASSASSIN PHASE ⚔️
    </h2>

    <div class="space-y-6">
      <div class="text-center mb-6">
        <p class="text-red-300 text-lg mb-3 font-semibold">
          {{ message }}
        </p>
        <p class="text-red-400/70 text-sm">
          Choose wisely... The fate of the game rests on this decision.
        </p>
      </div>

      <div class="bg-stone-900/50 rounded-lg p-6">
        <h3 class="text-xl font-semibold text-red-300 mb-4 text-center">Select Your Target</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            v-for="target in targets"
            :key="target.id"
            @click="selectTarget(target.id)"
            class="p-4 rounded-lg border-2 transition-all font-semibold text-lg"
            :class="{
              'border-red-500 bg-red-900/40 text-red-200 shadow-lg shadow-red-500/50 scale-105': selectedTargetId === target.id,
              'border-stone-600 bg-stone-800/30 text-stone-300 hover:border-red-700 hover:bg-stone-700/40': selectedTargetId !== target.id
            }"
          >
            <div class="flex flex-col items-center gap-2">
              <div v-if="selectedTargetId === target.id" class="text-red-400 text-2xl">💀</div>
              <div>{{ target.name }}</div>
            </div>
          </button>
        </div>
      </div>

      <div class="flex justify-center gap-4 mt-6">
        <avalon-button
          @click="handleAssassinate"
          :disabled="!selectedTargetId || isAssassinating"
          class="bg-red-700 hover:bg-red-800 border-red-600 text-xl px-8 py-4"
          :class="{ 'opacity-50 cursor-not-allowed': !selectedTargetId || isAssassinating }"
        >
          <span v-if="isAssassinating">Assassinating...</span>
          <span v-else>💀 KILL TARGET 💀</span>
        </avalon-button>
        <avalon-button
          @click="closeDialog"
          class="bg-stone-700 hover:bg-stone-600 border-stone-600"
        >
          Close
        </avalon-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AvalonButton from '@/shared/components/AvalonButton.vue';

const props = defineProps<{
  targets: Array<{ id: number; name?: string }>;
  message: string;
  onClose: () => void;
  onAssassinate: (targetId: number) => Promise<void>;
}>();

const emit = defineEmits<{
  close: []
}>();

const selectedTargetId = ref<number | null>(null);
const isAssassinating = ref(false);

function selectTarget(targetId: number) {
  selectedTargetId.value = targetId;
}

async function handleAssassinate() {
  if (!selectedTargetId.value || isAssassinating.value) return;

  isAssassinating.value = true;

  try {
    await props.onAssassinate(selectedTargetId.value);
    selectedTargetId.value = null;
  } catch (error) {
    console.error('Failed to assassinate target:', error);
  } finally {
    isAssassinating.value = false;
  }
}

function closeDialog() {
  emit('close');
  props.onClose();
}
</script>
