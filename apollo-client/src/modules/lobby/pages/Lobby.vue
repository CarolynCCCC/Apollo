<script setup lang="ts">
import {onMounted, watch} from 'vue';
import {useRouter} from 'vue-router';
import AvalonButton from '@/shared/components/AvalonButton.vue';
import {useDialog} from '@/shared/composables/useDialog';
import {useRoomStore} from '@/stores/roomStore';
import CreateRoomModal from '@/modules/lobby/components/CreateRoomModal.vue';
import JoinRoomModal from '@/modules/lobby/components/JoinRoomModal.vue';
import {roomPath} from '@/routes';

const {open} = useDialog();
const router = useRouter();
const roomStore = useRoomStore();

function openCreateRoomDialog() {
  open(CreateRoomModal, {
    title: 'New Room',
    width: '600px',
  });
}

function openJoinRoomDialog() {
  open(JoinRoomModal, {
    title: 'Join Room',
    width: '480px',
  });
}

onMounted(() => {
  roomStore.clearState();
  roomStore.fetchAvailableRooms();
})

function fetchRooms() {
  roomStore.fetchAvailableRooms()
}

function joinRoom(roomId: string) {
  roomStore.setRoomIdToJoin(roomId);
  openJoinRoomDialog();
}

watch(
    () => roomStore.joinRoomSuccess,
    (success) => {
      if (success && roomStore.currentRoom) {
        router.push({
          name: roomPath.room,
          params: {
            roomId: roomStore.currentRoom.id
          }
        })
      }
    },
);
</script>

<template>
  <div class="p-6 flex h-[100dvh] flex-col items-center justify-between space-y-4">
    <div>
      <h1 class="text-4xl font-bold mb-4">Welcome to Avalon Lobby</h1>
      <p class="text-lg">Join an existing room or create a new one to start playing!</p>
    </div>
    <div class="flex flex-col gap-3">
      <div class="flex justify-between">
        <span class="text-lg">Rooms</span>
        <span @click="fetchRooms()" class="cursor-pointer text-gold-600 text-lg">&#x21bb;</span>
      </div>

      <div class="flex flex-col gap-3">
        <div v-if="roomStore.availableRooms.length" v-for="availableRoom in roomStore.availableRooms">
          <div @click="joinRoom(availableRoom.id)" class="text-md">
            <span class="text-gold-600 font-bold">{{ availableRoom.id }}</span> - Players: {{
              availableRoom.players.length
            }}/{{
              availableRoom.config.maxPlayers
            }}</div>
        </div>
        <div v-else>
          No available rooms at the moment.
        </div>
      </div>


    </div>
    <div class="flex flex-col space-y-4 pb-8">
      <avalon-button @button-clicked="openCreateRoomDialog()">
        Create Room
      </avalon-button>
      <avalon-button @button-clicked="openJoinRoomDialog()">
        Join Room
      </avalon-button>
    </div>
  </div>
</template>