import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
export const routes: RouteRecordRaw[] = [
  {
    path: '/ipc',
    redirect: '/ipc/index',
    children: [
      {
        path: 'index',
        component: () => import('@renderer/views/ipc/index.vue'),
        meta: {
          title: 'ipc',
          icon: ''
        }
      },
      {
        path: 'theme',
        component: () => import('@renderer/views/ipc/theme.vue'),
        meta: {
          title: 'theme',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/menu',
    redirect: '/menu/index',
    children: [
      {
        path: 'index',
        component: () => import('@renderer/views/menu/index.vue'),
        meta: {
          title: 'menu',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/notifications',
    redirect: '/notifications/index',
    children: [
      {
        path: 'index',
        component: () => import('@renderer/views/notifications/index.vue'),
        meta: {
          title: 'notifications',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/shortcut',
    redirect: '/shortcut/index',
    children: [
      {
        path: 'index',
        component: () => import('@renderer/views/shortcut/index.vue'),
        meta: {
          title: 'shortcut',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/dialog',
    redirect: '/dialog/index',
    children: [
      {
        path: 'index',
        component: () => import('@renderer/views/dialog/index.vue'),
        meta: {
          title: 'dialog',
          icon: ''
        }
      }
    ]
  }
];
const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
