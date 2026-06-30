import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Layout.vue'),
      redirect: '/agents',
      children: [
        { path: 'home', name: 'Home', component: () => import('@/views/Home.vue'), meta: { title: 'Home' } },
        { path: 'assets', name: 'Assets', component: () => import('@/views/Assets.vue'), meta: { title: 'Assets' } },
        { path: 'knowledge', name: 'Knowledge', component: () => import('@/views/Knowledge.vue'), meta: { title: 'Knowledge' } },
        { path: 'agents', name: 'Agents', component: () => import('@/views/Agents.vue'), meta: { title: 'Agents' } },
        { path: 'analytics', name: 'Analytics', component: () => import('@/views/Analytics.vue'), meta: { title: 'Analytics' } }
      ]
    },
    { path: '/settings', name: 'Settings', component: () => import('@/views/Settings.vue'), meta: { title: 'Settings' } },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFound.vue'), meta: { title: '404' } }
  ]
})

router.beforeEach((to) => {
  const title = to.meta.title as string
  document.title = title ? `${title} - Enterprise Workspace` : 'Enterprise Workspace'
  if (!localStorage.getItem('token')) localStorage.setItem('token', 'mock-token')
})

export default router
