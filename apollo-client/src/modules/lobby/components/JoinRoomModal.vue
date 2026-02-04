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
const touched = ref(false);

const errors = computed(() => ({
  roomId: (roomId.value.trim() === '' && touched.value) ? 'Room Id is required.' : '',
  playerName: (playerName.value.trim() === '' && touched.value) ? 'Player Name is required.' : '',
}))

function submit() {
  touched.value = true;
  if (errors.value.roomId || errors.value.playerName) {
    return;
  }
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
    <form>
      <div class="px-2">
        <div class="mb-3">
          <label for="roomId" class="block text-gold-400 text-sm font-semibold mb-2">Room Id *</label>
          <input name="roomId" v-model="roomId" type="text" class="input-field w-full" placeholder="Enter room id"/>
          <p v-if="errors.roomId" class="text-evil-500 text-xs mt-1 font-semibold">
            ⚠ {{ errors.roomId }}
          </p>
        </div>
      </div>
      <div class="px-2">
        <div class="mb-4">
          <label for="playerName" class="block text-gold-400 text-sm font-semibold mb-2">Player Name *</label>
          <input name="playerName" v-model="playerName" type="text" class="input-field w-full"
                 placeholder="Enter Your Name"/>
          <p v-if="errors.playerName" class="text-evil-500 text-xs mt-1 font-semibold">
            ⚠ {{ errors.playerName }}
          </p>
        </div>
      </div>
    </form>

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
  </div>
</template>
