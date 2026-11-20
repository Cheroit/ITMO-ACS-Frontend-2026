<script setup>
import { computed, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import KitchenDialog from './components/KitchenDialog.vue'
import NoticeToast from './components/NoticeToast.vue'
import { initializeKitchen, useKitchen } from './composables/useKitchen'
import { useFeedback } from './composables/useFeedback'
import { useSession } from './composables/useSession'

const route = useRoute()
const router = useRouter()
const { expired } = useSession()
const { loginPrompt } = useFeedback()
const { error, retry } = useKitchen()
const authPage = computed(() => ['login', 'register'].includes(route.name))

initializeKitchen()
watch(expired, () => {
  if (!authPage.value) {
    router.replace({ name: 'login', query: { expired: '1', next: route.fullPath } })
  }
})
watch(() => route.fullPath, () => { loginPrompt.value = false })
</script>

<template>
  <a class="skip-link" href="#main">Перейти к содержимому</a>
  <SiteHeader />
  <main id="main" class="page-main container" tabindex="-1">
    <div v-if="error && !authPage" class="alert alert-danger" role="alert">
      {{ error }}
      <button type="button" class="btn btn-outline-primary ms-2" @click="retry">Повторить</button>
    </div>
    <RouterView v-slot="{ Component, route: current }">
      <component :is="Component" :key="current.path" />
    </RouterView>
  </main>
  <footer class="site-footer container">
    <RouterLink class="footer-brand" to="/">на кухне</RouterLink>
    <span>Место, где делятся вкусным</span>
    <span>© 2026</span>
  </footer>
  <KitchenDialog
    v-if="loginPrompt"
    title="Загляните на свою кухню"
    @close="loginPrompt = false"
  >
    <p class="mb-0">Войдите, чтобы сохранять рецепты, ставить лайки и общаться с кулинарами.</p>
    <template #footer>
      <RouterLink class="btn btn-outline-primary" :to="{ name: 'register', query: { next: route.fullPath } }">
        Создать аккаунт
      </RouterLink>
      <RouterLink class="btn btn-primary" :to="{ name: 'login', query: { next: route.fullPath } }">Войти</RouterLink>
    </template>
  </KitchenDialog>
  <NoticeToast />
</template>
