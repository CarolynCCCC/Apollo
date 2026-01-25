<script setup lang="ts">
import { useDialog } from '@/shared/composables/useDialog';
import AvalonDialog from '@/shared/components/AvalonDialog.vue';

const { dialogState, close } = useDialog();
</script>

<template>
  <AvalonDialog
    v-if="dialogState.isOpen && dialogState.component"
    :width="dialogState.config.width"
    :height="dialogState.config.height"
    :title="dialogState.config.title"
    :show-close="dialogState.config.showClose"
    @close="close"
  >
    <component
      :is="dialogState.component"
      v-bind="dialogState.config.props"
      @close="close"
    />
  </AvalonDialog>
</template>
