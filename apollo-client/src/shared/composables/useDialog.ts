import { Component, shallowRef, markRaw } from 'vue';
import { DialogConfig, DialogState } from '@/shared/model/dialog';

const dialogState = shallowRef<DialogState>({
  isOpen: false,
  component: null,
  config: {},
});

export function useDialog() {
  function open(component: Component, config: DialogConfig = {}) {
    dialogState.value = {
      isOpen: true,
      component: markRaw(component),
      config,
    };
  }

  function close() {
    dialogState.value = {
      isOpen: false,
      component: null,
      config: {},
    };
  }

  return {
    dialogState,
    open,
    close,
  };
}
