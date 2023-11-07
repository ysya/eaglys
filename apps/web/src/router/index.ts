import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import NProgress from 'nprogress'
import '@/assets/scss/nprogress.scss'

NProgress.configure({
  easing: 'ease',
  showSpinner: false,
  trickleSpeed: 300,
  minimum: 0.3,
  parent: 'body',
  template:
    '<div class="bar" role="bar" style="z-index:9999"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>',
})
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/AppHome/AppHome.vue'),
        },
        {
          path: '/:catchAll(.*)*',
          name: '404',
          component: () => import('@/views/ErrorNotFound.vue'),
        },
      ],
    },
  ],
})
router.beforeEach(async () => {
  NProgress.start()
})
router.afterEach(() => {
  NProgress.done()
})

export default router
