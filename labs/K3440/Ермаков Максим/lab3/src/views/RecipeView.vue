<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { apiRequest } from '../api/client'
import FollowButton from '../components/FollowButton.vue'
import RecipeComments from '../components/RecipeComments.vue'
import RequestStatus from '../components/RequestStatus.vue'
import { useKitchen } from '../composables/useKitchen'
import { useRequest } from '../composables/useRequest'
import { useSession } from '../composables/useSession'
import { initials, recipeImage } from '../recipes'

const route = useRoute()
const recipeId = String(route.params.id)
const { session } = useSession()
const { authorById, hasReaction, actionPending, toggleReaction, likeCount } = useKitchen()
const { data: recipe, loading, error, reload } = useRequest(signal =>
  apiRequest('/recipes/' + encodeURIComponent(recipeId), { signal }))
const author = computed(() => authorById(recipe.value?.userId))
const saved = computed(() => hasReaction('saved', recipeId))
const liked = computed(() => hasReaction('likes', recipeId))
</script>

<template>
  <RouterLink class="back-link" :to="{ name: 'recipes' }">
    <i class="bi bi-arrow-left" aria-hidden="true"></i> К рецептам
  </RouterLink>
  <div v-if="error?.status === 404" class="empty-state">
    <h1>Рецепт не найден</h1>
    <p>Загляните в каталог: там есть другие вкусные идеи.</p>
    <RouterLink class="btn btn-primary" :to="{ name: 'recipes' }">Открыть рецепты</RouterLink>
  </div>
  <RequestStatus v-else :loading="loading" :error="error" @retry="reload" />
  <article v-if="recipe">
    <div class="row g-4 align-items-center recipe-intro">
      <div class="col-md-6">
        <span class="eyebrow">{{ recipe.type }}</span>
        <h1>{{ recipe.title }}</h1>
        <p>{{ recipe.description }}</p>
        <div class="recipe-meta">
          <span><i class="bi bi-clock" aria-hidden="true"></i> {{ recipe.time }} мин</span>
          <span><i class="bi bi-bar-chart" aria-hidden="true"></i> {{ recipe.difficulty }}</span>
          <span><i class="bi bi-people" aria-hidden="true"></i> Порций: {{ recipe.portions }}</span>
        </div>
        <div class="recipe-actions">
          <button class="btn btn-primary" type="button" :aria-pressed="saved"
            :disabled="actionPending('saved', recipeId)" @click="toggleReaction('saved', recipeId)">
            <i :class="saved ? 'bi bi-bookmark-fill' : 'bi bi-bookmark'" aria-hidden="true"></i>
            {{ saved ? 'Рецепт сохранён' : 'Сохранить рецепт' }}
          </button>
          <button class="btn btn-outline-primary" type="button" :aria-pressed="liked"
            :disabled="actionPending('likes', recipeId)" @click="toggleReaction('likes', recipeId)">
            <i :class="liked ? 'bi bi-heart-fill' : 'bi bi-heart'" aria-hidden="true"></i>
            <span class="visually-hidden">Нравится рецепт, отметок:</span> {{ likeCount(recipe) }}
          </button>
        </div>
      </div>
      <div class="col-md-6">
        <img class="recipe-main-image" :src="recipeImage(recipe.image)" :alt="recipe.title" />
      </div>
    </div>
    <div class="author-row">
      <span class="avatar avatar-large" aria-hidden="true">{{ initials(author.name) }}</span>
      <div><h2>{{ author.name }}</h2><p>{{ author.about }}</p></div>
      <FollowButton v-if="session?.user.id !== author.id" :author-id="author.id" />
    </div>
    <div class="row g-4">
      <aside class="col-lg-4" aria-labelledby="ingredientsTitle">
        <div class="ingredients-panel">
          <div class="section-heading mb-3">
            <h2 id="ingredientsTitle">Ингредиенты</h2>
            <span class="small-note">Порций: {{ recipe.portions }}</span>
          </div>
          <label v-for="([name, amount], index) in recipe.ingredients" :key="index" class="ingredient">
            <input class="form-check-input" type="checkbox" />
            <span>{{ name }}</span><span class="ingredient-amount">{{ amount }}</span>
          </label>
          <p class="small-note mt-3 mb-0">Отмечайте то, что уже подготовили.</p>
        </div>
      </aside>
      <section class="col-lg-8" aria-labelledby="stepsTitle">
        <h2 id="stepsTitle">Готовим по шагам</h2>
        <ol class="step-list" role="list">
          <li v-for="([title, text], index) in recipe.steps" :key="index"><h3>{{ title }}</h3><p>{{ text }}</p></li>
        </ol>
        <h2 class="mb-3">Видеорецепт</h2>
        <div class="video-placeholder" role="note">
          <i class="bi bi-camera-video" aria-hidden="true"></i>
          <h3>Видео будет добавлено позже</h3>
          <p>А пока готовьте по пошаговым инструкциям выше.</p>
        </div>
      </section>
    </div>
    <RecipeComments :recipe-id="recipeId" />
  </article>
</template>
