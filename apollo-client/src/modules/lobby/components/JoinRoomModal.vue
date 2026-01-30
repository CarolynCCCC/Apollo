<script setup lang="ts">
import {ref, computed, watch, onMounted} from 'vue';
import {useDialog} from '@/shared/composables/useDialog';
import {useRoomStore} from '@/stores/roomStore';
import type {JoinRoomRequest} from '@/shared/model/room';
import AvalonButton from '@/shared/components/AvalonButton.vue';

const {close} = useDialog();
const roomStore = useRoomStore();

const roomId = ref(roomStore.roomIdToJoin);
const playerName = ref('');

const isLoading = computed(() => roomStore.isLoading);

function submit() {
  console.log(roomId.value, playerName.value);
  const payload: JoinRoomRequest = {
    roomId: roomId.value.trim(),
    playerName: playerName.value.trim() || 'Anonymous',
  };
  roomStore.joinRoom(payload);
}

onMounted(() => {
})

watch(
    () => roomStore.joinRoomSuccess,
    (success) => {
      if (success) {
        close();
      }
    }
);
</script>

<template>
  <div class="space-y-6 flex flex-col">
    <div class="px-2">
      <div class="mb-3">
        <label class="block text-gold-400 text-sm font-semibold mb-2">Room Id *</label>
        <input v-model="roomId" type="text" class="input-field w-full" placeholder="Enter room id"/>
      </div>
    </div>
    <div class="px-2">
      <div class="mb-4">
        <label class="block text-gold-400 text-sm font-semibold mb-2">Player Name *</label>
        <input v-model="playerName" type="text" class="input-field w-full" placeholder="Enter Your Name"/>
      </div>
    </div>
    <div class="flex flex-col justify-end flex-wrap gap-5 sm:flex-row py-2">
      <AvalonButton
          variant="secondary"
          :disabled="isLoading"
          @button-clicked="close()"
      >
        Cancel
      </AvalonButton>
      <AvalonButton
          :disabled="isLoading"
          @button-clicked="submit()"
      >
        Join
      </AvalonButton>
    </div>
    <transition name="float-out">
      <div v-if="roomStore.error" class="text-sm text-red-600 mt-3">
        {{ roomStore.error }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
</style>
