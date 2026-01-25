import { createWebHistory, createRouter } from 'vue-router'
import { routes as lobbyRoutes } from '@/modules/lobby/route'
import { routes as roomRoutes } from '@/modules/room/route'
import { routes as gameRoutes } from '@/modules/game/route'
import { lobbyPath } from './routes'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...lobbyRoutes,
    ...roomRoutes,
    ...gameRoutes,
    {
      path: '/:pathMatch(.*)*',
      redirect: lobbyPath.home,
    }
  ],
})