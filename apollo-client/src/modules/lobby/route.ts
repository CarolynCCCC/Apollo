import { lobbyPath } from '@/routes'
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: lobbyPath.home,
    component: () => import('./pages/Lobby.vue')
  }
]