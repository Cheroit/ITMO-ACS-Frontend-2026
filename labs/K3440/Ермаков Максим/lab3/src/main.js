import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useSession } from './composables/useSession'

const { session } = useSession()

router.beforeEach(to => {
  if (to.meta.requiresLogin && !session.value) {
    return { name: 'login', query: { next: to.fullPath } }
  }
})

createApp(App).use(router).mount('#app')
