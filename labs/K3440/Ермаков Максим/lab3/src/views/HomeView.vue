<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { apiRequest } from '../api/client'
import ArticleCard from '../components/ArticleCard.vue'
import RecipeGrid from '../components/RecipeGrid.vue'
import RequestStatus from '../components/RequestStatus.vue'
import { useRecipes } from '../composables/useRecipes'
import { useRequest } from '../composables/useRequest'
import { categories } from '../recipes'

const router = useRouter()
const query = ref('')
const type = ref('')
const { recipes, error, loading, reload } = useRecipes(() => ({ type: type.value }), 3)
const {
  data: articles, loading: articlesLoading, error: articlesError, reload: reloadArticles,
} = useRequest(signal => apiRequest('/articles', { signal }))

function search() {
  router.push({ name: 'recipes', query: { query: query.value.trim() || undefined } })
}
</script>

<template>
  <section class="hero" aria-labelledby="homeTitle">
    <div class="hero-copy">
      <span class="eyebrow">Готовить проще, когда мы вместе</span>
      <h1 id="homeTitle">Хорошие рецепты.<br /><em>Простые радости.</em></h1>
      <p>Находите любимые блюда, делитесь своими<br class="d-none d-xl-inline" /> рецептами и вдохновляйтесь каждый день.</p>
      <form class="search-box hero-search" role="search" @submit.prevent="search">
        <i class="bi bi-search" aria-hidden="true"></i>
        <label class="visually-hidden" for="homeQuery">Поиск рецепта</label>
        <input id="homeQuery" v-model="query" class="form-control" aria-describedby="homeSearchHint"
          placeholder="Что будем готовить?" maxlength="100" />
        <button class="btn btn-primary" type="submit">Найти рецепт</button>
      </form>
      <span id="homeSearchHint" class="hero-hint">Например: паста, завтрак или что-то к чаю</span>
    </div>
    <RouterLink class="hero-photo" :to="{ name: 'recipe', params: { id: 'pasta' } }" aria-labelledby="featuredRecipe">
      <img src="/assets/images/pasta.jpg" alt="Паста с томатами и зеленью" />
      <span class="photo-caption">
        <span id="featuredRecipe"><small>РЕЦЕПТ ДНЯ</small><strong>Паста с томатами</strong></span>
        <span class="photo-arrow"><i class="bi bi-arrow-up-right" aria-hidden="true"></i></span>
      </span>
    </RouterLink>
  </section>

  <section class="section-space" aria-labelledby="featuredTitle">
    <div class="section-heading">
      <div><span class="eyebrow">Вдохновение на каждый день</span><h2 id="featuredTitle">Что приготовим сегодня?</h2></div>
      <RouterLink class="text-link" :to="{ name: 'recipes' }">
        Все рецепты <i class="bi bi-arrow-right" aria-hidden="true"></i>
      </RouterLink>
    </div>
    <div class="category-list" role="group" aria-label="Категории рецептов">
      <button v-for="category in ['', ...categories]" :key="category" class="category-button" type="button"
        :aria-pressed="type === category" @click="type = category">{{ category || 'Все рецепты' }}</button>
    </div>
    <RequestStatus :loading="loading" :error="error" @retry="reload" />
    <RecipeGrid v-if="!loading && !error && recipes.length" :recipes="recipes" />
    <p v-else-if="!loading && !error" class="empty-note">В этой категории пока нет рецептов.</p>
  </section>

  <section class="section-space" aria-labelledby="journalTitle">
    <div class="section-heading">
      <div><span class="eyebrow">Истории из кухни</span><h2 id="journalTitle">Не только рецепты</h2></div>
      <RouterLink class="text-link" :to="{ name: 'blogs' }">
        Читать блоги <i class="bi bi-arrow-right" aria-hidden="true"></i>
      </RouterLink>
    </div>
    <RequestStatus :loading="articlesLoading" :error="articlesError" @retry="reloadArticles" />
    <div v-if="articles" class="row g-4">
      <div v-for="(article, index) in articles" :key="article.id" class="col-md-6">
        <ArticleCard :article="article" :warm="index % 2 === 1" preview />
      </div>
    </div>
  </section>
</template>
