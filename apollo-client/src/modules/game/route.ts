import { gamePath } from '@/routes'
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    name: gamePath.game,
    path: gamePath.game + "/:roomId",
    component: () => import('./pages/Game.vue')
  }
]