<script setup>
import RecipeCard from './RecipeCard.vue'

defineProps({
  recipes: { type: Array, required: true },
  twoColumns: Boolean,
})
</script>

<template>
  <div class="row g-4">
    <div v-for="recipe in recipes" :key="recipe.id" class="col-sm-6" :class="{ 'col-lg-4': !twoColumns }">
      <RecipeCard :recipe="recipe" />
    </div>
  </div>
</template>
