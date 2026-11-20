<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { apiRequest } from '../api/client'
import { saveSession } from '../composables/useSession'

const route = useRoute()
const router = useRouter()
const registration = computed(() => route.name === 'register')
const form = reactive({ name: '', email: '', password: '', confirm: '', remember: false })
const pending = ref(false)
const error = ref(route.query.expired ? 'Время действия сессии истекло. Войдите снова.' : '')
const errorElement = ref(null)
const next = computed(() => {
  const path = route.query.next
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return '/profile'
  }
  const allowed = ['home', 'recipes', 'recipe', 'blogs', 'profile']
  return allowed.includes(router.resolve(path).name) ? path : '/profile'
})

async function showError(message) {
  error.value = message
  await nextTick()
  errorElement.value?.focus()
}

async function submit() {
  if (pending.value) return
  error.value = ''
  if (registration.value && form.password !== form.confirm) {
    await showError('Пароли не совпадают. Проверьте повторный ввод.')
    return
  }
  if (registration.value && form.name.trim().length < 2) {
    await showError('Введите имя из двух или более символов.')
    return
  }

  const isRegistration = registration.value
  const destination = next.value
  pending.value = true
  try {
    const account = await apiRequest(isRegistration ? '/register' : '/login', {
      method: 'POST',
      auth: false,
      data: {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        ...(isRegistration ? { name: form.name.trim() } : {}),
      },
    })
    saveSession(account, isRegistration || form.remember)
    await router.replace(destination)
  } catch (failure) {
    await showError(failure.message)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section class="auth-layout">
    <aside class="auth-story">
      <template v-if="registration">
        <span class="eyebrow">Приготовим что-нибудь вместе</span>
        <h2>У каждого есть<br />свой особый рецепт.</h2>
        <p>Присоединяйтесь к нашей кухне.<br />Здесь рады новичкам и опытным кулинарам.</p>
        <img src="/assets/images/cupcakes.jpg" alt="Домашние кексы" />
      </template>
      <template v-else>
        <span class="eyebrow">Добро пожаловать домой</span>
        <h2>Любимые рецепты<br />всегда под рукой.</h2>
        <p>Сохраняйте находки, делитесь вкусным<br />и находите тех, кто любит готовить.</p>
        <img src="/assets/images/pasta.jpg" alt="Домашняя паста" />
      </template>
    </aside>
    <div class="auth-form">
      <span class="eyebrow">{{ registration ? 'Знакомимся' : 'Рады вас видеть' }}</span>
      <h1>{{ registration ? 'Добро пожаловать!' : 'С возвращением!' }}</h1>
      <p>{{ registration ? 'Создайте аккаунт и собирайте вкусные идеи.' : 'Войдите, чтобы заглянуть на свою кухню.' }}</p>
      <form @submit.prevent="submit">
        <div v-if="registration" class="mb-3">
          <label class="form-label" for="name">Ваше имя</label>
          <input id="name" v-model="form.name" class="form-control" placeholder="Как к вам обращаться?"
            autocomplete="name" minlength="2" maxlength="60" required />
        </div>
        <div class="mb-3">
          <label class="form-label" for="email">Электронная почта</label>
          <input id="email" v-model="form.email" class="form-control" type="email" placeholder="you@example.com"
            autocomplete="email" maxlength="100" required />
        </div>
        <div class="mb-3">
          <label class="form-label" for="password">Пароль</label>
          <input id="password" v-model="form.password" class="form-control" type="password"
            :placeholder="registration ? 'Не менее 6 символов' : 'Введите пароль'"
            :autocomplete="registration ? 'new-password' : 'current-password'" minlength="6" maxlength="100" required />
        </div>
        <div v-if="registration" class="mb-3">
          <label class="form-label" for="confirm">Повторите пароль</label>
          <input id="confirm" v-model="form.confirm" class="form-control" type="password"
            placeholder="Введите пароль ещё раз" autocomplete="new-password" minlength="6" maxlength="100" required />
        </div>
        <div v-else class="form-check mb-4">
          <input id="remember" v-model="form.remember" class="form-check-input" type="checkbox" />
          <label class="form-check-label small-note" for="remember">Запомнить меня</label>
        </div>
        <p v-if="error" ref="errorElement" class="alert alert-danger" role="alert" tabindex="-1">{{ error }}</p>
        <button class="btn btn-primary w-100" type="submit" :disabled="pending">
          {{ registration ? 'Создать аккаунт' : 'Войти' }}
        </button>
      </form>
      <p class="auth-switch">
        {{ registration ? 'Уже с нами?' : 'Ещё нет аккаунта?' }}
        <RouterLink :to="{ name: registration ? 'login' : 'register', query: { next } }">
          {{ registration ? 'Войти' : 'Зарегистрироваться' }}
        </RouterLink>
      </p>
    </div>
  </section>
</template>
