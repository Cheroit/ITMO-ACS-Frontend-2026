<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { clearSession, useSession } from '../composables/useSession'
import { initials } from '../recipes'

const route = useRoute()
const router = useRouter()
const { session } = useSession()
const menuOpen = ref(false)

watch(() => route.fullPath, () => { menuOpen.value = false })

function logout() {
  clearSession()
  router.push({ name: 'home' })
}
</script>

<template>
  <header class="site-header">
    <nav class="navbar navbar-expand-lg container" aria-label="Главная навигация">
      <RouterLink class="brand" :to="{ name: 'home' }" aria-label="На кухне, главная">
        <span class="brand-mark"><img src="/assets/images/chef-hat.svg" width="21" height="21" alt="" /></span>
        <span class="brand-text">
          <span class="brand-word">на кухне</span>
          <span class="brand-caption">рецепты и истории</span>
        </span>
      </RouterLink>
      <button class="navbar-toggler" type="button" aria-controls="topNav"
        :aria-expanded="menuOpen" aria-label="Меню сайта" @click="menuOpen = !menuOpen">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div id="topNav" class="collapse navbar-collapse" :class="{ show: menuOpen }">
        <ul class="navbar-nav">
          <li class="nav-item"><RouterLink class="nav-link" :to="{ name: 'recipes' }">Рецепты</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link" :to="{ name: 'blogs' }">Блоги</RouterLink></li>
        </ul>
        <div v-if="session" class="account-links">
          <RouterLink class="account-profile" :to="{ name: 'profile' }">
            <span class="avatar" aria-hidden="true">{{ initials(session.user.name) }}</span> Моя кухня
          </RouterLink>
          <button class="btn btn-link logout-button" type="button" @click="logout">Выйти</button>
        </div>
        <div v-else class="account-links">
          <RouterLink :to="{ name: 'login' }">Войти</RouterLink>
          <RouterLink class="btn btn-primary" :to="{ name: 'register' }">Присоединиться</RouterLink>
        </div>
      </div>
    </nav>
  </header>
</template>
