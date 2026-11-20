<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { apiRequest } from '../api/client'
import AuthorCard from '../components/AuthorCard.vue'
import PublishRecipeDialog from '../components/PublishRecipeDialog.vue'
import RecipeGrid from '../components/RecipeGrid.vue'
import RequestStatus from '../components/RequestStatus.vue'
import { useFeedback } from '../composables/useFeedback'
import { useKitchen } from '../composables/useKitchen'
import { useRequest } from '../composables/useRequest'
import { useSession } from '../composables/useSession'
import { initials } from '../recipes'

const { session } = useSession()
const { collections, hasReaction, loading: actionsLoading, error: actionsError } = useKitchen()
const { showNotice } = useFeedback()
const active = ref('saved')
const publishing = ref(false)
const tabs = [
  ['saved', 'Сохранённые рецепты'],
  ['publications', 'Мои публикации'],
  ['authors', 'Подписки'],
]

const userId = computed(() => session.value?.user.id)
const savedIds = computed(() => collections.saved.map(entry => String(entry.recipeId)))
const authors = computed(() => collections.authors.filter(author => hasReaction('following', author.id)))

const { data, loading, error, reload } = useRequest(async signal => {
  if (userId.value == null) return null
  const params = new URLSearchParams()
  savedIds.value.forEach(id => params.append('id', id))
  const [publications, saved] = await Promise.all([
    apiRequest('/recipes', { params: { userId: userId.value }, signal }),
    savedIds.value.length ? apiRequest('/recipes', { params, signal }) : [],
  ])
  return { publications, saved }
}, [userId, savedIds])

const publications = computed(() => data.value?.publications ?? [])
const saved = computed(() => data.value?.saved.filter(recipe => hasReaction('saved', recipe.id)) ?? [])

function published() {
  publishing.value = false
  active.value = 'publications'
  reload()
  showNotice('Рецепт опубликован')
}
</script>

<template>
  <template v-if="session">
    <section class="profile-head" aria-labelledby="profileName">
      <span class="avatar profile-avatar" aria-hidden="true">{{ initials(session.user.name) }}</span>
      <div>
        <span class="eyebrow">Моя кухня</span>
        <h1 id="profileName">{{ session.user.name }}</h1>
        <p>{{ session.user.email }}</p>
        <div class="profile-stats">
          <span>Публикации: <strong>{{ publications.length }}</strong></span>
          <span>Сохранено: <strong>{{ savedIds.length }}</strong></span>
          <span>Подписки: <strong>{{ authors.length }}</strong></span>
        </div>
      </div>
      <button class="btn btn-primary" type="button" @click="publishing = true">
        <i class="bi bi-plus-lg" aria-hidden="true"></i> Поделиться рецептом
      </button>
    </section>
    <div class="nav nav-tabs profile-tabs" role="group" aria-label="Разделы личного кабинета">
      <button v-for="[key, label] in tabs" :key="key" type="button" class="nav-link"
        :class="{ active: active === key }" :aria-pressed="active === key" @click="active = key">{{ label }}</button>
    </div>
    <RequestStatus
      :loading="active === 'authors' ? actionsLoading : loading || (active === 'saved' && actionsLoading)"
      :error="active === 'authors' ? null : error" @retry="reload"
    />
    <section v-if="active === 'saved' && data && !actionsError" aria-label="Сохранённые рецепты">
      <RecipeGrid v-if="saved.length" :recipes="saved" />
      <div v-else-if="!loading && !actionsLoading" class="empty-state">
        <h3>Любимые рецепты будут здесь</h3><p>Сохраняйте интересные блюда с помощью значка закладки.</p>
        <RouterLink class="btn btn-primary" :to="{ name: 'recipes' }">Найти рецепт</RouterLink>
      </div>
    </section>
    <section v-if="active === 'publications' && data" aria-label="Мои публикации">
      <RecipeGrid v-if="publications.length" :recipes="publications" />
      <div v-else-if="!loading" class="empty-state">
        <h3>Поделитесь своим особым рецептом</h3><p>Расскажите, что любите готовить для себя и друзей.</p>
        <button class="btn btn-primary" type="button" @click="publishing = true">Добавить рецепт</button>
      </div>
    </section>
    <section v-if="active === 'authors' && !actionsLoading && !actionsError" aria-label="Подписки">
      <div v-if="authors.length" class="row g-4">
        <div v-for="author in authors" :key="author.id" class="col-md-6"><AuthorCard :author="author" /></div>
      </div>
      <div v-else class="empty-state">
        <h3>Найдите своих кулинаров</h3><p>Подпишитесь на авторов, чьи рецепты вам нравятся.</p>
        <RouterLink class="btn btn-primary" :to="{ name: 'blogs' }">Знакомиться с кулинарами</RouterLink>
      </div>
    </section>
    <PublishRecipeDialog v-if="publishing" @close="publishing = false" @published="published" />
  </template>
</template>
