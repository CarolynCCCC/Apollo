<script setup lang="ts">
import { computed, watch, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRoomStore } from '@/stores/roomStore';
import { usePlayerStore } from '@/stores/playerStore';
import AvalonButton from '@/shared/components/AvalonButton.vue';
import { gamePath, lobbyPath, roomPath } from '@/routes';
import { ROOM_STATUS } from '@/constant/api.ts';

const route = useRoute();
const router = useRouter();
const roomStore = useRoomStore();
const playerStore = usePlayerStore();

const notificationMessage = ref('');
const notificationVisible = ref(false);
let notificationTimeout: number | null = null;


const numberOfPlayers = computed(() =>
  roomStore.currentRoom?.config.variablePlayers ? `${roomStore.currentRoom?.config.minPlayers}-${roomStore.currentRoom?.config.maxPlayers}` : roomStore.currentRoom?.config.numberOfPlayers
);

const isHost = computed(() => {
  return playerStore.playerId === roomStore.currentRoom?.hostId;
});

const currentPlayer = computed(() => {
  return roomStore.currentRoom?.players.find(p => p.id === playerStore.playerId);
});

const canStartGame = computed(() => {
  if (
    !roomStore.currentRoom ||
    !isHost.value ||
    !roomStore.currentRoom.players.every(player =>
      player.id === roomStore.currentRoom?.hostId || player.ready
    )
  ) return false;

  const playerCount = roomStore.currentRoom.players.length;
  const minPlayers = roomStore.currentRoom.config.minPlayers;
  return playerCount >= minPlayers;
});

function showNotification(message: string, duration = 3000) {
  notificationMessage.value = message;
  notificationVisible.value = true;
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
  notificationTimeout = window.setTimeout(() => {
    notificationVisible.value = false;
    notificationTimeout = null;
  }, duration);
}

function handleNotification(event: Event) {
  const customEvent = event as CustomEvent;
  const message = customEvent.detail?.message;
  if (message) {
    showNotification(message);
  }
}

function handleLeaveRoom() {
  roomStore.leaveRoom();
}

function toggleReady() {
  roomStore.togglePlayerReady();
}

function handleStartGame() {
  roomStore.startGame();
}

watch(
  () => roomStore.currentRoom,
  (room) => {
    if (room === null) {
      router.push(lobbyPath.home);
    }
  }
);

watch(
  () => roomStore.currentRoom?.status,
  (status) => {
    if (status === ROOM_STATUS.IN_PROGRESS && roomStore.currentRoom) {
      router.push({
        name: gamePath.game,
        params: {
          roomId: roomStore.currentRoom.id
        }
      })
    }
  }
);

onMounted(() => {
  window.addEventListener('ws:notification', handleNotification);
});

onUnmounted(() => {
  window.removeEventListener('ws:notification', handleNotification);
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
});
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center">
    <Transition name="fade">
      <div v-if="notificationVisible" class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-6 py-3 rounded-lg shadow-lg z-50">
        {{ notificationMessage }}
      </div>
    </Transition>

    <div class="card max-w-4xl mx-auto w-full">
      <div class="flex items-center justify-between mb-6">
        <div>
          <p v-if="roomStore.currentRoom" class="text-xl text-medieval-parchment">
            Room ID: <span class="font-mono text-gold-500">{{ roomStore.currentRoom.id }}</span>
          </p>
        </div>
        <button class="cursor-pointer text-gold-400" @click="handleLeaveRoom">
          <font-awesome-icon icon="arrow-right-from-bracket" />
        </button>
      </div>

      <div v-if="roomStore.currentRoom" class="space-y-6">
        <div>
          <div class="mb-4">
            <h2 class="text-2xl font-semibold text-gold-400">
              Players ({{ roomStore.currentRoom.players.length }})
            </h2>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-5 gap-4 items-stretch">
            <div
              v-for="(player, index) in roomStore.currentRoom.players"
              :key="player.id"
              class="bg-stone-700/50 rounded-lg p-4 flex flex-col justify-center items-center w-full"
            >
              <div class="flex flex-col justify-center gap-2 items-center">
                <div class="w-10 h-10 rounded-full bg-gold-600 flex items-center justify-center text-stone-900 font-bold">
                  {{ index + 1 }}
                </div>
                <div class="flex flex-col items-center">
                  <span class="font-semibold" :class="{
                    'text-medieval-parchment': !roomStore.isRoomHost(player.id),
                    'text-gold-500': roomStore.isRoomHost(player.id)
                  }">
                    {{ player.name }}
                  </span>
                  <span v-if="roomStore.isRoomHost(player.id)" class="text-xs text-gold-400 font-semibold">
                    Host
                  </span>
                  <span v-else-if="player.ready" class="text-xs text-stone-400 font-semibold">
                    Ready
                  </span>
                  <span v-else class="text-xs font-semibold text-red-600">
                    Not Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!isHost && currentPlayer" class="flex justify-center">
          <avalon-button @click="toggleReady">
            {{ currentPlayer.ready ? 'Not Ready' : 'Ready' }}
          </avalon-button>
        </div>

        <div v-if="isHost" class="flex justify-center">
          <avalon-button
            @click="handleStartGame"
            :disabled="!canStartGame"
            :class="{ 'opacity-50 cursor-not-allowed': !canStartGame }"
          >
            Start Game
          </avalon-button>
        </div>

        <div v-if="roomStore.error" class="bg-evil-900/30 border border-evil-500 text-evil-300 px-4 py-3 rounded">
          {{ roomStore.error }}
        </div>

        <div class="border-t border-stone-600 pt-6">
          <h3 class="text-xl font-semibold text-gold-400 mb-3">Room Configuration</h3>
          <div class="space-y-2 text-medieval-parchment">
            <p>
              <span class="text-stone-400">Status:</span>
              <span class="ml-2 font-semibold">{{ roomStore.currentRoom.status }}</span>
            </p>
            <p>
              <span class="text-stone-400">Players:</span>
              <span class="ml-2 font-semibold">
                {{numberOfPlayers}}
              </span>
            </p>
            <p v-if="roomStore.currentRoom.config.optionalCharacters.length > 0">
              <span class="text-stone-400">Optional Characters:</span>
              <span class="ml-2 font-semibold">{{ roomStore.currentRoom.config.optionalCharacters.join(', ') }}</span>
            </p>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8">
        <p class="text-stone-400">Room not found</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active {
  transition: opacity 0.3s ease-out;
}

.fade-leave-active {
  transition: opacity 0.5s ease-in;
}

.fade-enter-from {
  opacity: 0;
}

.fade-leave-to {
  opacity: 0;
}
</style>

