import { ref } from 'vue';

const message = ref('');
const visible = ref(false);
let timeoutId: number | null = null;

export function useNotifications() {
  function show(msg: string, duration = 3000) {
    message.value = msg;
    visible.value = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      visible.value = false;
      timeoutId = null;
    }, duration);
  }

  return { message, visible, show };
}
