<script setup>
import { reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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

const draft = reactive(readFilters())
watch(() => route.query, () => Object.assign(draft, readFilters()))
const { recipes, loading, error, reload } = useRecipes(readFilters)

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
        <template v-if="!loading && !error">
          <p class="result-heading" role="status">Найдено рецептов: {{ recipes.length }}</p>
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
