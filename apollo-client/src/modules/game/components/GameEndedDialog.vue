<template>
  <div class="max-w-2xl"
       :class="{
         'border-good-600': winner === 'good',
         'border-evil-600': winner === 'evil'
       }">
    <div class="text-center space-y-6">
      <h2 class="text-5xl font-bold font-cinzel"
          :class="{
            'text-good-400': winner === 'good',
            'text-evil-400': winner === 'evil'
          }">
        {{ winner === 'good' ? 'GOOD WINS!' : 'EVIL WINS!' }}
      </h2>
      <div class="bg-stone-800/50 rounded-lg p-6">
        <p class="text-xl text-medieval-parchment mb-2">{{ message }}</p>
        <p class="text-sm text-stone-400">Reason: {{ formatReason(reason) }}</p>
      </div>

      <div class="flex flex-col gap-4 justify-center">
        <avalon-button @click="viewResults" class="bg-gold-600 hover:bg-gold-700">
          View Results
        </avalon-button>
        <avalon-button @click="backToLobby" class="bg-stone-500 hover:bg-stone-600">
          Back to Lobby
        </avalon-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import AvalonButton from '@/shared/components/AvalonButton.vue';

const props = defineProps<{
  winner: 'good' | 'evil';
  reason: string;
  message: string;
}>();

const emit = defineEmits<{
  close: []
}>();

const router = useRouter();

function formatReason(reason: string): string {
  return reason.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function viewResults() {
  emit('close');
}

function backToLobby() {
  router.push('/');
  emit('close');
}
</script>
