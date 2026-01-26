<script setup lang="ts">
import {computed} from 'vue';

interface Props {
  open?: boolean;
  width?: string;
  height?: string;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  open: true,
  width: '500px',
  height: 'auto',
});

const emit = defineEmits<{
  close: [];
}>();

const dialogStyle = computed(() => ({
  width: props.width,
  height: props.height === 'auto' ? 'auto' : props.height,
  maxWidth: 'calc(100vw - 4rem)',
  maxHeight: 'calc(100dvh - 1rem)',
}));

function handleClose() {
  emit('close');
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    handleClose();
  }
}
</script>

<template>
  <Teleport to="body">
    <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        @click="handleBackdropClick"
    >
      <div
          class="card relative overflow-hidden"
          :style="dialogStyle"
          @click.stop
      >
        <button
            class="absolute right-4 top-4 text-gold-400 hover:text-gold-300 transition-colors text-2xl leading-none cursor-pointer"
            @click="handleClose"
        >
          ×
        </button>

        <div v-if="title" class="card-header">
          {{ title }}
        </div>

        <div class="dialog-content overflow-y-auto" :class="{ 'pt-4': !title }">
          <slot></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dialog-content {
  max-height: calc(90vh - 8rem);
}
</style>
