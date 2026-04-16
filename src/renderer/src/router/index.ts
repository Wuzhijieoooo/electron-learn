import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/ipc/index'
  },
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
  },
  {
    path: '/online',
    redirect: '/online/index',
    children: [
      {
        path: 'index',
        component: () => import('@renderer/views/online/index.vue'),
        meta: {
          title: 'online',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/communication',
    redirect: '/communication/index',
    children: [
      {
        path: 'index',
        component: () => import('@renderer/views/communication/index.vue'),
        meta: {
          title: 'communication',
          icon: ''
        }
      }
    ]
  },
  {
    path: '/screenshot',
    redirect: '/screenshot/index',
    children: [
      {
        path: 'index',
        component: () => import('@renderer/views/screenshot/index.vue'),
        meta: {
          title: 'screenshot',
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
