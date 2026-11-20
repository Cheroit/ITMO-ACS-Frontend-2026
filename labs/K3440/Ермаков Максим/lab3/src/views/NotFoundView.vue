<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="empty-state">
    <h1>Страница не найдена</h1>
    <p>Найти новые блюда можно в каталоге.</p>
    <RouterLink class="btn btn-primary" :to="{ name: 'recipes' }">Открыть рецепты</RouterLink>
  </div>
</template>
