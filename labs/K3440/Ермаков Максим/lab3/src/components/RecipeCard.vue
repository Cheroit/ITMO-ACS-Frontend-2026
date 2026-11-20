<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useKitchen } from '../composables/useKitchen'
import { initials, recipeImage } from '../recipes'

const props = defineProps({ recipe: { type: Object, required: true } })
const { authorById, likeCount, hasReaction, actionPending, toggleReaction } = useKitchen()
const author = computed(() => authorById(props.recipe.userId))
const saved = computed(() => hasReaction('saved', props.recipe.id))
const to = computed(() => ({ name: 'recipe', params: { id: props.recipe.id } }))
</script>

<template>
  <article class="card recipe-card h-100">
    <RouterLink :to="to" class="recipe-photo">
      <img :src="recipeImage(recipe.image)" :alt="recipe.title" loading="lazy" />
    </RouterLink>
    <button
      class="save-icon" type="button" :aria-pressed="saved" :disabled="actionPending('saved', recipe.id)"
      :aria-label="`${saved ? 'Убрать из сохранённых' : 'Сохранить рецепт'}: ${recipe.title}`"
      @click="toggleReaction('saved', recipe.id)"
    >
      <i :class="saved ? 'bi bi-bookmark-fill' : 'bi bi-bookmark'" aria-hidden="true"></i>
    </button>
    <div class="card-body d-flex flex-column">
      <span class="recipe-type">{{ recipe.type }}</span>
      <h3 class="recipe-title"><RouterLink :to="to">{{ recipe.title }}</RouterLink></h3>
      <div class="recipe-meta">
        <span><i class="bi bi-clock" aria-hidden="true"></i> {{ recipe.time }} мин</span>
        <span><i class="bi bi-bar-chart" aria-hidden="true"></i> {{ recipe.difficulty }}</span>
      </div>
      <div class="recipe-bottom mt-auto">
        <span class="recipe-author">
          <span class="avatar avatar-small" aria-hidden="true">{{ initials(author.name) }}</span>{{ author.name }}
        </span>
        <span>
          <i class="bi bi-heart" aria-hidden="true"></i>
          <span class="visually-hidden">Отметок «Нравится»:</span> {{ likeCount(recipe) }}
        </span>
      </div>
    </div>
  </article>
</template>
