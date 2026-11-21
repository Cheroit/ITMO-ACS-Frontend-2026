<script setup>
import { computed, reactive, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import RecipeGrid from '../components/RecipeGrid.vue'
import RequestStatus from '../components/RequestStatus.vue'
import { useRecipes } from '../composables/useRecipes'
import { categories, difficulties } from '../recipes'

const route = useRoute()
const router = useRouter()
const fields = ['query', 'type', 'difficulty', 'ingredients']

function readFilters() {
  return Object.fromEntries(fields.map(name => [
    name, typeof route.query[name] === 'string' ? route.query[name] : '',
  ]))
}

function readPage() {
  const value = route.query.page
  const page = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : 1
  return Number.isSafeInteger(page) && page > 0 ? page : 1
}

const draft = reactive(readFilters())
watch(fields.map(name => () => route.query[name]), () => Object.assign(draft, readFilters()))
const { data, recipes, loading, error, reload } = useRecipes(() => ({
  ...readFilters(),
  page: readPage(),
}))
const pageCount = computed(() => data.value ? Math.ceil(data.value.total / data.value.pageSize) : 0)

function pageLink(page) {
  return { name: 'recipes', query: { ...route.query, page: page > 1 ? String(page) : undefined } }
}

function search() {
  const query = Object.fromEntries(fields.map(name => [name, draft[name].trim() || undefined]))
  router.push({ name: 'recipes', query })
  if (error.value) reload()
}

function reset() {
  fields.forEach(name => { draft[name] = '' })
  search()
}
</script>

<template>
  <div class="page-heading">
    <span class="eyebrow">Найдите своё любимое</span>
    <h1>Рецепты на любой день</h1>
    <p>Простые продукты, понятные шаги и немного вдохновения.</p>
  </div>
  <form @submit.prevent="search" @reset.prevent="reset">
    <div class="search-box mb-4" role="search">
      <i class="bi bi-search" aria-hidden="true"></i>
      <label for="query" class="visually-hidden">Название блюда или ингредиент</label>
      <input id="query" v-model="draft.query" class="form-control" placeholder="Название блюда или ингредиент" maxlength="100" />
      <button class="btn btn-primary" type="submit">Найти</button>
    </div>
    <div class="row g-4">
      <aside class="col-lg-3" aria-labelledby="filterTitle">
        <div class="filter-panel">
          <div class="filter-heading">
            <h2 id="filterTitle">Фильтры</h2>
            <button class="reset-button" type="reset">Сбросить</button>
          </div>
          <div class="mb-3">
            <label class="form-label" for="type">Тип блюда</label>
            <select id="type" v-model="draft.type" class="form-select">
              <option value="">Все блюда</option>
              <option v-for="type in categories" :key="type">{{ type }}</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label" for="difficulty">Сложность</label>
            <select id="difficulty" v-model="draft.difficulty" class="form-select">
              <option value="">Любая сложность</option>
              <option v-for="difficulty in difficulties" :key="difficulty">{{ difficulty }}</option>
            </select>
          </div>
          <div class="mb-2">
            <label class="form-label" for="ingredients">Ингредиенты</label>
            <input id="ingredients" v-model="draft.ingredients" class="form-control"
              placeholder="Например, томаты" aria-describedby="ingredientHint" maxlength="200" />
          </div>
          <p id="ingredientHint" class="small-note mb-4">Один или несколько ингредиентов через запятую.</p>
          <button class="btn btn-primary w-100" type="submit">Показать рецепты</button>
        </div>
      </aside>
      <section class="col-lg-9" aria-labelledby="resultsTitle">
        <h2 id="resultsTitle" class="visually-hidden">Найденные рецепты</h2>
        <RequestStatus :loading="loading" :error="error" @retry="reload" />
        <template v-if="data && !loading && !error">
          <div class="d-flex flex-wrap align-items-baseline justify-content-between gap-2 mb-3">
            <p class="result-heading mb-0" role="status">Найдено рецептов: {{ data.total }}</p>
            <nav v-if="pageCount > 1" class="d-flex flex-wrap align-items-center gap-2" aria-label="Страницы каталога">
              <RouterLink v-if="data.page > 1" class="btn btn-sm btn-outline-primary" :to="pageLink(data.page - 1)">
                Назад
              </RouterLink>
              <span class="small-note">Страница {{ data.page }} из {{ pageCount }}</span>
              <RouterLink v-if="data.page < pageCount" class="btn btn-sm btn-outline-primary" :to="pageLink(data.page + 1)">
                Далее
              </RouterLink>
            </nav>
          </div>
          <RecipeGrid v-if="recipes.length" :recipes="recipes" two-columns />
          <div v-else class="empty-state">
            <h3>Рецептов пока нет</h3><p>Попробуйте изменить запрос или сбросить фильтры.</p>
            <button class="btn btn-outline-primary" type="reset">Сбросить фильтры</button>
          </div>
        </template>
      </section>
    </div>
  </form>
</template>
