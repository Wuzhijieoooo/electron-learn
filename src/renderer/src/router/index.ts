import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/ipc',
      component: () => import('@renderer/views/ipc/index.vue')
    }
  ]
});

export default router;
