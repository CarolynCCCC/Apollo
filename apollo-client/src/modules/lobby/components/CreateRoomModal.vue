<script setup lang="ts">
import { reactive, computed } from 'vue';
import AvalonButton from '@/shared/components/AvalonButton.vue';
import { useRoomStore } from '@/stores/roomStore';
import { usePlayerStore } from '@/stores/playerStore';
import { MIN_PLAYERS, MAX_PLAYERS, PLAYER_ALIGNMENT_COUNT, ROLES } from '@/constant/roles';

const emit = defineEmits<{
  close: [];
}>();

const roomStore = useRoomStore();
const playerStore = usePlayerStore();
const isSubmitting = false;

const form = reactive({
  playerName: '',
  numberOfPlayers: null as number | null,
  optionalCharacters: [] as string[],
});

const optionalCharactersOptions = [
  { value: 'Percival', label: 'Percival' },
  { value: 'Morgana', label: 'Morgana' },
  { value: 'Mordred', label: 'Mordred' },
  { value: 'Oberon', label: 'Oberon' },
];

const isFormValid = computed(() => {
  return form.playerName.trim() !== '';
});

const minimumPlayers = computed(() => {
  if (form.optionalCharacters.length === 0) {
    return MIN_PLAYERS;
  }

  const goodOptional = form.optionalCharacters.filter(c => c === ROLES.PERCIVAL).length;
  const evilOptional = form.optionalCharacters.filter(c =>
    c === ROLES.MORGANA || c === ROLES.MORDRED || c === ROLES.OBERON
  ).length;

  for (let playerCount = MIN_PLAYERS; playerCount <= MAX_PLAYERS; playerCount++) {
    const alignment = PLAYER_ALIGNMENT_COUNT[playerCount];
    if (alignment.good >= (1 + goodOptional) && alignment.evil >= (1 + evilOptional)) {
      return playerCount;
    }
  }

  return MAX_PLAYERS;
});

const showMinPlayerWarning = computed(() => {
  return form.optionalCharacters.length > 0 && minimumPlayers.value > MIN_PLAYERS;
});

function toggleCharacter(character: string) {
  const index = form.optionalCharacters.indexOf(character);
  if (index > -1) {
    form.optionalCharacters.splice(index, 1);
  } else {
    form.optionalCharacters.push(character);
  }
}

function handleCreateRoom() {
  if (!isFormValid.value || roomStore.isLoading) {
    return;
  }

  roomStore.clearError();

  roomStore.createRoomAndJoin(
    {
      numberOfPlayers: form.numberOfPlayers ?? undefined,
      optionalCharacters: form.optionalCharacters.length > 0 ? form.optionalCharacters : [],
    },
    form.playerName
  );

  emit('close')
}

function handleCancel() {
  emit('close');
}
</script>

<template>
  <div class="space-y-6 flex flex-col">
    <div class="px-2">
      <label class="block text-gold-400 text-sm font-semibold mb-2">
        Player Name *
      </label>
      <input
        v-model="form.playerName"
        type="text"
        class="input-field w-full"
        placeholder="Enter your name"
        :disabled="roomStore.isLoading"
      />
    </div>

    <div class="px-2">
      <label class="block text-gold-400 text-sm font-semibold mb-2">
        Number of Players
      </label>
      <input
        v-model.number="form.numberOfPlayers"
        type="number"
        :min="minimumPlayers"
        max="10"
        class="input-field w-full"
        :placeholder="`${minimumPlayers}-10 (optional, dynamic if not set)`"
        :disabled="roomStore.isLoading"
      />
      <p class="text-stone-400 text-xs mt-1">
        Leave empty for dynamic player count ({{ minimumPlayers }}-10)
      </p>
      <p v-if="showMinPlayerWarning" class="text-gold-500 text-xs mt-1 font-semibold">
        ⚠ Minimum {{ minimumPlayers }} players required for selected characters
      </p>
    </div>

    <div class="px-2">
      <label class="block text-gold-400 text-sm font-semibold mb-3">
        Optional Characters
      </label>
      <div class="space-y-2">
        <div
          v-for="option in optionalCharactersOptions"
          :key="option.value"
          class="flex items-center"
        >
          <input
            :id="option.value"
            type="checkbox"
            :checked="form.optionalCharacters.includes(option.value)"
            :disabled="roomStore.isLoading"
            class="w-4 h-4 text-gold-500 bg-stone-700 border-stone-600 rounded focus:ring-gold-500 focus:ring-2"
            @change="toggleCharacter(option.value)"
          />
          <label
            :for="option.value"
            class="ml-2 text-sm text-medieval-parchment cursor-pointer"
          >
            {{ option.label }}
          </label>
        </div>
      </div>
      <p class="text-stone-400 text-xs mt-2">
        Select optional characters to include in the game
      </p>
    </div>

    <div class="flex flex-col justify-end flex-wrap gap-5 sm:flex-row">
      <AvalonButton
        variant="secondary"
        :disabled="isSubmitting"
        @button-clicked="handleCancel"
      >
        Cancel
      </AvalonButton>
      <AvalonButton
        :disabled="!isFormValid || isSubmitting"
        @button-clicked="handleCreateRoom"
      >
        {{ isSubmitting ? 'Creating...' : 'Create & Join' }}
      </AvalonButton>
    </div>
  </div>
</template>
