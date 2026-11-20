import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', alias: '/index.html', name: 'home', component: () => import('./views/HomeView.vue') },
    { path: '/recipes', alias: '/recipes.html', name: 'recipes', component: () => import('./views/RecipesView.vue') },
    { path: '/recipes/:id', name: 'recipe', component: () => import('./views/RecipeView.vue') },
    {
      path: '/recipe.html',
      redirect: route => {
        const { id, ...query } = route.query
        return { name: 'recipe', params: { id: typeof id === 'string' && id ? id : 'pasta' }, query }
      },
    },
    { path: '/blogs', alias: '/blogs.html', name: 'blogs', component: () => import('./views/BlogsView.vue') },
    { path: '/login', alias: '/login.html', name: 'login', component: () => import('./views/AuthView.vue') },
    { path: '/register', alias: '/register.html', name: 'register', component: () => import('./views/AuthView.vue') },
    {
      path: '/profile',
      alias: '/profile.html',
      name: 'profile',
      meta: { requiresLogin: true },
      component: () => import('./views/ProfileView.vue'),
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./views/NotFoundView.vue') },
  ],
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || (to.path !== from.path ? { top: 0 } : undefined)
  },
})

export default router
