import { roomPath } from '@/routes'
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    name: roomPath.room,
    path: roomPath.room + "/:roomId",
    component: () => import('./pages/Room.vue')
  }
]